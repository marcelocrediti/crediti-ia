export const DOCUMENT_ACCEPT='application/pdf,image/jpeg,image/png,image/gif,image/webp,image/bmp,.pdf,.jpg,.jpeg,.jif,.jfif,.png,.gif,.webp,.bmp';
export const DOCUMENT_HINT='PDF até 700 KB. Fotos JPG, JPEG, JIF/JFIF, PNG, GIF, WebP ou BMP até 20 MB, ajustadas automaticamente para envio. GIF: somente o primeiro quadro. Até 5 anexos por categoria.';
export function documentMime(bytes){
 const starts=a=>a.every((v,i)=>bytes[i]===v);
 const text=(a,b)=>String.fromCharCode(...bytes.slice(a,b));
 if(text(0,5)==='%PDF-')return 'application/pdf';
 if(starts([255,216,255]))return 'image/jpeg';
 if(starts([137,80,78,71,13,10,26,10]))return 'image/png';
 if(['GIF87a','GIF89a'].includes(text(0,6)))return 'image/gif';
 if(text(0,4)==='RIFF'&&text(8,12)==='WEBP')return 'image/webp';
 if(text(0,2)==='BM')return 'image/bmp';
 return '';
}
function readData(blob){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.onerror=()=>reject(Error('Não foi possível ler o arquivo. Selecione-o novamente.'));
  reader.readAsDataURL(blob);
 });
}
async function normalizeImage(file,mime){
 const url=URL.createObjectURL(file.slice(0,file.size,mime));
 try{
  const img=await new Promise((resolve,reject)=>{
   const image=new Image(),timer=setTimeout(()=>reject(Error('A foto demorou para abrir. Selecione-a novamente.')),20000);
   image.onload=()=>{clearTimeout(timer);resolve(image);};
   image.onerror=()=>{clearTimeout(timer);reject(Error('Não foi possível abrir esta foto. Salve uma cópia em JPG ou PNG e tente novamente.'));};
   image.src=url;
  });
  const width=img.naturalWidth,height=img.naturalHeight;
  if(!width||!height||width*height>60000000)throw Error('A resolução desta foto é muito grande. Envie uma cópia menor.');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Não foi possível preparar a foto neste navegador.');
  for(const edge of [2800,2400,2000,1600,1200]){
   const scale=Math.min(1,edge/Math.max(width,height));
   canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
   ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   for(const quality of [0.92,0.85,0.76,0.66]){
    const output=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
    if(output&&output.type==='image/jpeg'&&output.size<=700000)return readData(output);
   }
  }
  throw Error('Não foi possível reduzir esta foto mantendo a leitura. Envie uma foto mais próxima do documento.');
 }finally{URL.revokeObjectURL(url);}
}
export async function prepareDocument(file){
 if(!file||!file.size)throw Error('O arquivo está vazio. Selecione outro documento.');
 if(file.size>20000000)throw Error('A foto excede 20 MB. Envie uma cópia menor.');
 const mime=documentMime(new Uint8Array(await file.slice(0,12).arrayBuffer()));
 if(!mime)throw Error('Formato não reconhecido em '+file.name+'. Use PDF, JPG, JPEG, JIF/JFIF, PNG, GIF, WebP ou BMP.');
 if(mime==='application/pdf'){
  if(file.size>700000)throw Error('O PDF '+file.name+' excede 700 KB. Reduza o PDF antes de enviar.');
  return {nome:file.name,tipo:mime,dataUrl:await readData(file.slice(0,file.size,mime))};
 }
 if(mime==='image/jpeg'&&file.size<=700000)return {nome:file.name,tipo:mime,dataUrl:await readData(file.slice(0,file.size,mime))};
 const dataUrl=await normalizeImage(file,mime);
 return {nome:String(file.name||'documento').replace(/\.[^.]+$/,'')+'.jpg',tipo:'image/jpeg',dataUrl};
}
