import {CURRENT_LATE_CHARGES,LEGACY_LATE_CHARGES} from './cdc-charges.mjs?v=20261120-aviso-v16';
const stable=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const comparable=s=>Object.fromEntries(['cliente','valor','parcela','prazo','taxa','dataPrimeira','dataUltima','dadosCliente'].map(k=>[k,k==='dadosCliente'&&s[k]?{...s[k],cpf:String(s[k].cpf||'').replace(/\D/g,'')}:s[k]]));
export const signatureProposalChanged=(before,after)=>stable(comparable(before))!==stable(comparable(after));
export const signatureUrl=(base,token)=>base+'?v=20261120-signature-v11#cliente/'+token;
const decode=v=>{
 if('nullValue'in v)return null;if('stringValue'in v)return v.stringValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return v.doubleValue;if('booleanValue'in v)return v.booleanValue;
 if('timestampValue'in v)return {toMillis:()=>Date.parse(v.timestampValue)};
 if('mapValue'in v)return fields(v.mapValue.fields||{});if('arrayValue'in v)return (v.arrayValue.values||[]).map(decode);
 throw Error('Resposta da proposta inválida.');
};
const fields=f=>Object.fromEntries(Object.entries(f).map(([k,v])=>[k,decode(v)]));
export async function readPublicSignature({projectId,token,fetcher=fetch,timeoutMs=20000}){
 if(!/^[a-f0-9]{64}$/.test(token||''))throw Object.assign(Error('O endereço do link está incompleto. Peça à Crediti o link completo de assinatura.'),{code:'signature-token'});
 if(!projectId)throw Error('Não foi possível iniciar o carregamento da proposta.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetcher('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(projectId)+'/databases/(default)/documents/assinaturasCDC/'+token,{signal:controller.signal,credentials:'omit',cache:'no-store'});
  if(response.status===403||response.status===404)throw Object.assign(Error('Este link não está disponível para assinatura. Ele pode ter sido substituído, encerrado ou expirado. Peça à Crediti para verificar e enviar um novo link.'),{code:'signature-unavailable'});
  if(!response.ok)throw Object.assign(Error('O serviço não conseguiu carregar a proposta agora. Toque em Tentar novamente.'),{code:'signature-service'});
  const data=fields((await response.json()).fields||{});
  if(data.aceite||!data.expiraEm||data.expiraEm.toMillis()<=Date.now())throw Object.assign(Error('Este link já foi encerrado ou expirou. Peça à Crediti um novo link de assinatura.'),{code:'signature-closed'});
  if(!data.proposta||typeof data.proposta.cliente!=='string')throw Object.assign(Error('A proposta deste link está incompleta. Peça à Crediti para verificar a contratação.'),{code:'signature-data'});
  return {...data.proposta,encargosAtraso:data.proposta.encargosAtraso||LEGACY_LATE_CHARGES,id:token,aceite:null};
 }catch(e){if(e.code?.startsWith('signature-'))throw e;throw Object.assign(Error('Não foi possível carregar a proposta neste momento. Toque em Tentar novamente. Isso não significa que a simulação foi excluída.'),{code:'signature-service'});}
 finally{clearTimeout(timer);}
}
export function signatureAcceptance(aceite){
 const geo=aceite.geo;
 return {...aceite,geo:geo&&Number.isFinite(geo.lat)&&Number.isFinite(geo.lng)?{lat:geo.lat,lng:geo.lng}:null};
}

// Repeated clicks and concurrent tabs share one active link. Only an expired or
// unavailable record is replaced; a signed record can never be renewed here.
export async function ensureSignatureLink({db,fb,sim,uid,now=()=>Date.now(),newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('')}){
 const candidate=newToken(),ref=db.collection('simulacoes').doc(sim.id);
 return db.runTransaction(async tx=>{
  const snap=await tx.get(ref);
  if(!snap.exists)throw Error('A ficha não foi encontrada.');
  const current=snap.data();
  if(current.aceite)throw Error('Esta proposta já está assinada.');
  if(signatureProposalChanged(sim,current)||stable(sim.analiseCdc?.decisao)!==stable(current.analiseCdc?.decisao)||sim.analiseCdc?.snapshot!==current.analiseCdc?.snapshot)throw Error('A ficha foi atualizada em outra tela. Abra novamente antes de gerar o link.');
  const oldRef=current.linkAssinatura?db.collection('assinaturasCDC').doc(current.linkAssinatura):null;
  const old=oldRef?await tx.get(oldRef):null;
  if(old?.exists){
   const data=old.data();
   if(data.aceite)throw Error('A assinatura já foi recebida. Atualize a ficha para visualizar.');
   if(data.simId===sim.id&&data.expiraEm?.toMillis()>now())return current.linkAssinatura;
  }
  const proposta={encargosAtraso:{...CURRENT_LATE_CHARGES}};
  for(const key of ['cliente','valor','prazo','parcela','taxa','cet','dataPrimeira','dataUltima','produto','tipo','salarioBruto','parcela13','inssAplicado'])if(current[key]!==undefined)proposta[key]=current[key];
  tx.set(db.collection('assinaturasCDC').doc(candidate),{proposta,simId:sim.id,aceite:null,expiraEm:fb.firestore.Timestamp.fromMillis(now()+7*86400000)});
  if(old?.exists)tx.update(oldRef,{expiraEm:fb.firestore.Timestamp.fromMillis(0)});
  tx.update(ref,{encargosAtraso:proposta.encargosAtraso,linkAssinatura:candidate,status:'aguardando_cliente',contratacao:{finalizadaEm:now(),por:uid,motivoAprovacao:current.analiseCdc?.decisao?.motivo||''}});
  return candidate;
 });
}
