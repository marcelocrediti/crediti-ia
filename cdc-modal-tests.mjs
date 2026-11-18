import assert from 'node:assert/strict';
import {mountCdcReview} from './cdc-review.mjs';
class Element {
 constructor(){this.isConnected=true;this.disabled=false;this.style={};this.nodes=new Map();this.value='';this.type='text';this.checked=false;this.textContent='';this.events={};this.children=[];}
 querySelector(k){if(!this.nodes.has(k))this.nodes.set(k,new Element());return this.nodes.get(k);}
 querySelectorAll(){return [];}
 setAttribute(){} append(...children){this.children.push(...children);} addEventListener(k,f){this.events[k]=f;} showModal(){this.open=true;} close(){this.open=false;this.events.close?.();} remove(){} focus(){} scrollIntoView(){}
}
globalThis.document={body:new Element(),createElement:()=>new Element()};
const copy=structuredClone;
async function fixture({missing=false,fail=false,high=false}={}){
 let calls=0;const sim={id:'test',dadosCliente:{cpf:'00000000000'},valor:700,parcela:high?500:150,prazo:6,taxa:9};
 const docs=missing?{}:{rgFrente:{dataUrl:'id',nome:'id.jpeg'},comprovanteResidencia:{dataUrl:'home',nome:'home.jpeg'},comprovanteRenda:{dataUrl:'income',nome:'income.jpeg'}};
 globalThis.fetch=async(url,opts)=>{calls++;if(fail)return {ok:false,json:async()=>({error:'Leitor indisponível'})};const key=JSON.parse(opts.body).dataUrl;return {ok:true,json:async()=>({document:{legibilidade:'legivel',tipo:{id:'identidade',home:'residencia',income:'renda'}[key],cpf:'00000000000',rendaLiquida:key==='income'?2000:null,competencias:[],observacoes:''}})};};
 const ctx={auth:{currentUser:{uid:'test',getIdToken:async()=>'fake'}},loadSim:async()=>copy(sim),saveSim:async s=>Object.assign(sim,copy(s)),listSims:async()=>[copy(sim)],loadDocumentos:async()=>copy(docs),saveDocumento:async()=>{},db:{collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>({automatica:true})})})})}};
 const root=new Element();await mountCdcReview('test',root,ctx);
 const el=k=>root.querySelector('#rev-'+k);el('renda').value='2.000,00';el('despesas').value='500,00';el('outrasParcelas').value='0,00';el('restricao').value='nao';el('cpfNaIdentidade').type='checkbox';el('cpfNaIdentidade').checked=true;el('documentosConferidos').type='checkbox';el('documentosConferidos').checked=true;
 await el('analyze').task();return {root,el,sim,calls:()=>calls,ctx};
}
const approved=await fixture();assert.equal(approved.calls(),3);assert.equal(approved.sim.analiseCdc.resultado.status,'Aprovada');assert(approved.sim.analiseCdc.observacoes.includes('Aprovada'));assert(!approved.sim.analiseCdc.decisao);
const dialog=document.body.children.at(-1);assert(dialog.open);assert.equal(dialog.children[2].textContent,'OK');dialog.children[2].onclick();assert(!dialog.open);assert(approved.el('observacoes').value.includes('Aprovada'));
await approved.el('analyze').task();assert.equal(approved.calls(),3,'cached reads do not call API again');
const reopened=new Element();await mountCdcReview('test',reopened,approved.ctx);assert(reopened.querySelector('#rev-observacoes').value.includes('Aprovada'));
assert.equal((await fixture({high:true})).sim.analiseCdc.resultado.status,'Recusada');
const missing=await fixture({missing:true});assert.equal(missing.sim.analiseCdc.resultado.status,'Pendente');assert(missing.sim.analiseCdc.observacoes.includes('Documento obrigatório não enviado'));assert.equal(missing.calls(),0);
const failure=await fixture({fail:true});assert.equal(failure.sim.analiseCdc.resultado.status,'Pendente');assert(failure.sim.analiseCdc.observacoes.includes('Leitor indisponível'));assert.equal(failure.el('analyze').disabled,false);
console.log('PASS: one-click auto-reading, all categories, cached reads, approval/refusal/pending, API failure, modal OK, observations persisted and reopened, no automatic final lending decision.');
