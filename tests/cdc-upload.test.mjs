import assert from 'node:assert/strict';
import {documentMime,prepareDocument,DOCUMENT_ACCEPT} from '../cdc-upload.mjs';
const fixtures=[["pdf",[37,80,68,70,45],"application/pdf"],["jpg",[255,216,255,224],"image/jpeg"],["jpeg",[255,216,255,224],"image/jpeg"],["jif",[255,216,255,224],"image/jpeg"],["jfif",[255,216,255,224],"image/jpeg"],["png",[137,80,78,71,13,10,26,10],"image/png"],["gif",[71,73,70,56,57,97],"image/gif"],["webp",[82,73,70,70,0,0,0,0,87,69,66,80],"image/webp"],["bmp",[66,77,0,0],"image/bmp"]];
const saved={FileReader:globalThis.FileReader,Image:globalThis.Image,document:globalThis.document};
let decoded=0;
try{
 globalThis.FileReader=class {readAsDataURL(blob){blob.arrayBuffer().then(bytes=>{this.result='data:'+blob.type+';base64,'+Buffer.from(bytes).toString('base64');this.onload();});}};
 globalThis.Image=class {naturalWidth=4000;naturalHeight=3000;set src(v){decoded++;this.onload();}};
 globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},drawImage(){}}),toBlob:fn=>fn(new Blob([new Uint8Array([255,216,255,224])],{type:'image/jpeg'}))})};
 const file=(ext,bytes,size=bytes.length)=>{const data=new Uint8Array(size);data.set(bytes);return new File([data],'Documento.'+ext.toUpperCase(),{type:''});};
 for(const [ext,bytes,mime] of fixtures){
  assert.equal(documentMime(new Uint8Array(bytes)),mime);
  assert(DOCUMENT_ACCEPT.includes('.'+ext));
  const output=await prepareDocument(file(ext,bytes));
  assert.equal(output.tipo,ext==='pdf'?'application/pdf':'image/jpeg');
  assert(output.dataUrl.startsWith('data:'+output.tipo+';base64,'));
 }
 await prepareDocument(file('jpg',[255,216,255],5000000));
 assert.equal(decoded,5);
 await assert.rejects(()=>prepareDocument(file('pdf',[37,80,68,70,45],700001)),/PDF.*700 KB/);
 await assert.rejects(()=>prepareDocument(file('jpg',[255,216,255],20000001)),/20 MB/);
 await assert.rejects(()=>prepareDocument(file('jpg',[60,115,118,103])),/Formato/);
 await assert.rejects(()=>prepareDocument(file('jpg',[])),/vazio/);
 globalThis.Image=class {set src(v){this.onerror();}};
 await assert.rejects(()=>prepareDocument(file('png',[137,80,78,71,13,10,26,10])),/abrir esta foto/);
 console.log('PASS: formats, empty MIME, uppercase names, normalized output, oversize PDFs, invalid files and decode failures');
}finally{Object.assign(globalThis,saved);}
