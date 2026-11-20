// Fresh authenticated reads only. Never use offline/cache data to decide credit.
const transient=e=>['unavailable','deadline-exceeded','firestore/unavailable','firestore/deadline-exceeded'].includes(e?.code);
const forbidden=e=>['permission-denied','unauthenticated','firestore/permission-denied','firestore/unauthenticated'].includes(e?.code);
export function decodeValue(v,types,db){
  if('nullValue'in v)return null;
  if('booleanValue'in v)return v.booleanValue;
  if('stringValue'in v)return v.stringValue;
  if('integerValue'in v)return Number(v.integerValue);
  if('doubleValue'in v)return Number(v.doubleValue);
  if('timestampValue'in v)return types?.Timestamp?types.Timestamp.fromDate(new Date(v.timestampValue)):new Date(v.timestampValue);
  if('arrayValue'in v)return (v.arrayValue.values||[]).map(x=>decodeValue(x,types,db));
  if('mapValue'in v)return decodeFields(v.mapValue.fields,types,db);
  if('geoPointValue'in v&&types?.GeoPoint)return new types.GeoPoint(v.geoPointValue.latitude,v.geoPointValue.longitude);
  if('bytesValue'in v&&types?.Blob)return types.Blob.fromBase64String(v.bytesValue);
  if('referenceValue'in v&&db?.doc)return db.doc(v.referenceValue.split('/documents/')[1]);
  throw Error('O banco retornou um campo que não pôde ser carregado.');
}
const decodeFields=(fields,types,db)=>Object.fromEntries(Object.entries(fields||{}).map(([k,v])=>[k,decodeValue(v,types,db)]));
export async function restSnapshot({db,auth,path,collection=false,fetcher=fetch,signal,types=globalThis.firebase?.firestore}){
  const project=db.app?.options?.projectId;
  if(!project||!auth?.currentUser)throw Error('Sessão administrativa indisponível para carregar os dados.');
  const base='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(project)+'/databases/(default)/documents/';
  const snapshot=d=>({exists:true,id:d.name.split('/').at(-1),data:()=>decodeFields(d.fields,types,db)});
  async function get(url){
    for(let attempt=0;attempt<2;attempt++){
      const token=await auth.currentUser.getIdToken(attempt>0);
      const response=await fetcher(url,{headers:{Authorization:'Bearer '+token},signal,cache:'no-store'});
      if(response.status===401&&!attempt)continue;
      if(response.status===404&&!collection)return null;
      const body=await response.json();
      if(!response.ok)throw Object.assign(Error('O banco não concluiu o carregamento.'),{code:response.status===403?'permission-denied':response.status===401?'unauthenticated':'unavailable'});
      return body;
    }
  }
  const url=base+path.split('/').map(encodeURIComponent).join('/');
  if(!collection){const doc=await get(url);return doc?snapshot(doc):{exists:false,id:path.split('/').at(-1),data:()=>undefined};}
  const docs=[];let page='';const tokens=new Set();
  do{
    const result=await get(url+'?pageSize=100'+(page?'&pageToken='+encodeURIComponent(page):''));
    docs.push(...(result.documents||[]).map(snapshot));page=result.nextPageToken||'';
    if(page&&tokens.has(page))throw Error('O banco repetiu uma página de resultados.');
    tokens.add(page);
  }while(page);
  return {docs};
}
export function freshServerRead(operation,{fallback,label='os dados',hedgeMs=3500,timeoutMs=30000}={}){
  return new Promise((resolve,reject)=>{
    let settled=false,startedFallback=false,failures=0,lastError;
    const controller=new AbortController();
    const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(deadline);clearTimeout(hedge);controller.abort();fn(value);};
    const failed=error=>{
      if(settled)return;
      if(forbidden(error))return finish(reject,error);
      lastError=error;failures++;
      if(fallback&&!startedFallback)startFallback();
      if(failures===(fallback?2:1))finish(reject,lastError);
    };
    const startFallback=()=>{if(settled||startedFallback)return;startedFallback=true;Promise.resolve().then(()=>fallback(controller.signal)).then(v=>finish(resolve,v),failed);};
    const deadline=setTimeout(()=>finish(reject,Object.assign(Error('O carregamento de '+label+' no serviço não foi concluído. Isso não indica falta de documentos nem reprovação.'),{code:'read-timeout'})),timeoutMs);
    const hedge=fallback?setTimeout(startFallback,hedgeMs):undefined;
    Promise.resolve().then(async()=>{try{return await operation();}catch(e){if(!transient(e))throw e;return operation();}}).then(v=>finish(resolve,v),failed);
  });
}
export function readFirestore(ctx,path,{collection=false,label='os dados',reference}={}){
  const {db,auth}=ctx;
  const ref=reference||(collection?db.collection(path):db.doc?db.doc(path):db.collection(path.split('/')[0]).doc(path.split('/')[1]));
  const canFallback=!!db.app?.options?.projectId&&!!auth?.currentUser;
  return freshServerRead(()=>ref.get({source:'server'}),{label,fallback:canFallback?signal=>restSnapshot({db,auth,path,collection,signal}):undefined});
}
