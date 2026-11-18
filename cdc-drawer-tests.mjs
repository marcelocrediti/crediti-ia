import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {mountCdcReview,mountCdcHistory,formatAmount,documentKeys,creditSnapshot} from './cdc-review.mjs';
import {evaluateCredit} from './cdc-policy.mjs';
class Node {
  constructor(){this.isConnected=true;this.style={};this.nodes=new Map();this.value='';this.checked=false;this.type='text';this.textContent='';}
  querySelector(s){if(!this.nodes.has(s))this.nodes.set(s,new Node());return this.nodes.get(s);}
  querySelectorAll(){return [];}
}
const records={a:{id:'a',cliente:'Cliente fictício',dadosCliente:{cpf:'000.000.000-00'},aceite:{},historicoCrediti:[]},b:{id:'b',dadosCliente:{cpf:'00000000000'}},c:{id:'c',dadosCliente:{cpf:'11111111111'},historicoCrediti:[{tipo:'renegociacao',nota:'OUTRO CLIENTE'}]}};
const docs={};let writes=0;
const copy=v=>structuredClone(v);
const ctx={auth:{currentUser:{uid:'teste'}},loadSim:async id=>copy(records[id]),listSims:async()=>copy(Object.values(records)),saveSim:async s=>{records[s.id]=copy(s);},loadDocumentos:async()=>copy(docs),saveDocumento:async(id,key,data)=>{docs[key]=copy(data);writes++;},db:{collection:()=>({doc:id=>({id,get:async()=>({exists:true,data:()=>({automatica:true})})})}),runTransaction:async task=>task({get:async ref=>({data:()=>copy(records[ref.id])}),update:(ref,patch)=>Object.assign(records[ref.id],patch)})}};
assert.equal(formatAmount(1500),'1.500,00');assert.equal(formatAmount(3000.5),'3.000,50');assert.equal(formatAmount(0),'0,00');
const root=new Node();await mountCdcReview('b',root,ctx);
assert(!root.innerHTML.includes('rev-conta'));assert(!root.innerHTML.includes('rev-fonteRestricao'));assert(!root.innerHTML.includes('rev-dataRestricao'));
assert.equal((root.innerHTML.match(/type="file" multiple/g)||[]).length,4);
const amount=root.querySelector('#rev-renda');amount.value='1.234,56';amount.onblur();assert.equal(amount.value,'1.234,56');amount.value='1500';amount.onblur();assert.equal(amount.value,'1.500,00');
globalThis.FileReader=class {readAsDataURL(f){this.result='data:application/pdf;base64,'+Buffer.from(f.name).toString('base64');this.onload();}};
const file=root.querySelector('[data-doc="comprovanteRenda"]');file.files=Array.from({length:5},(_,i)=>({name:'ficticio'+i+'.pdf',type:'application/pdf',size:20}));await file.onchange();assert.equal(writes,5);assert.equal(documentKeys(docs,'comprovanteRenda').length,5);
file.files=[{name:'sexto.pdf',type:'application/pdf',size:20}];await file.onchange();assert.equal(writes,5);assert.match(root.querySelector('#rev-output').textContent,/Máximo de 5/);
const history=new Node();await mountCdcHistory('a',history,ctx);assert(history.innerHTML.includes('<details'));assert(history.innerHTML.includes('Salvar observação'));const h=k=>history.querySelector('[data-history-'+k+']');h('type').value='positivo';h('date').value='2026-11-18';h('note').value='Pagou em dia';await h('save').onclick();assert.equal(records.a.historicoCrediti.length,1);assert.equal(records.a.historicoCrediti[0].nota,'Pagou em dia');assert(records.a.aceite);
const prospect=new Node();await mountCdcHistory('b',prospect,ctx);assert(!prospect.innerHTML.includes('data-history-save'));assert.match(prospect.querySelector('[data-history-list]').textContent,/Pagou em dia/);assert(!prospect.querySelector('[data-history-list]').textContent.includes('OUTRO CLIENTE'));
const before=await creditSnapshot(records.b,ctx);records.a.historicoCrediti.push({tipo:'atencao',nota:'Conferir pagamento'});assert.notEqual(await creditSnapshot(records.b,ctx),before);
const base={q:{renda:2000,despesas:1000,outrasParcelas:0,restricao:'nao',documentosConferidos:true},parcela:200,today:'2026-11-18',documents:[{legibilidade:'legivel',confirmado:true}]};
assert.equal(evaluateCredit(base).status,'Aprovada');assert.equal(evaluateCredit({...base,history:[{tipo:'positivo'}]}).status,'Aprovada');assert.equal(evaluateCredit({...base,history:[{tipo:'atencao',nota:'Conferir'}]}).status,'Pendente');assert.equal(evaluateCredit({...base,history:[{tipo:'renegociacao'},{tipo:'positivo'}]}).status,'Recusada');
const html=readFileSync('index.html','utf8');for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
console.log('OK: valores brasileiros, campos retirados, 5 anexos persistidos e sexto bloqueado, gaveta, gravação sem mudar contrato, histórico por CPF, isolamento entre clientes, invalidação da análise e política Pix.');
