import assert from 'node:assert/strict';
import {publicStatus,statusRecord,syncStatus,mountStatus,statusKey,publicDetails} from '../cdc-status.mjs';
const pending={consultaStatusId:'key',analiseCdc:{resultado:{status:'Pendente'},observacoes:'INTERNAL'}};
for(const [s,want] of [[{},'Em análise'],[pending,'Pendente'],[{analiseCdc:{resultado:{status:'Aprovada'}}},'Pré-aprovada'],[{analiseCdc:{resultado:{status:'Recusada'}}},'Recusada'],[{analiseCdc:{decisao:{status:'Aprovada'}}},'Pré-aprovada'],[{analiseCdc:{decisao:{status:'Recusada'}}},'Recusada'],[{...pending,aceite:{}},'Contratada']])assert.equal(publicStatus(s),want);
const fb={firestore:{FieldValue:{serverTimestamp:()=>123},Timestamp:{fromMillis:n=>n}}};
assert.deepEqual(Object.keys(statusRecord(pending,fb)).sort(),['atualizadoEm','expiraEm','motivos','status']);
const expiry={toMillis:()=>Date.now()+100000};
let rows={'simulacoes/test':pending,'consultasCDC/key':{status:'Em análise',expiraEm:expiry}},writes=[];
const db={collection:c=>({doc:id=>({path:c+'/'+id,get:async options=>{assert.equal(options.source,'server');return {exists:true,data:()=>rows['consultasCDC/key']};}})}),runTransaction:async fn=>fn({get:async ref=>({exists:!!rows[ref.path],data:()=>rows[ref.path]}),update:(ref,patch)=>{writes.push({ref,patch});Object.assign(rows[ref.path],patch);}})};
assert.equal(await syncStatus('test',{db,fb}),true);
assert.equal(rows['consultasCDC/key'].status,'Pendente');assert.equal(rows['consultasCDC/key'].expiraEm,expiry);assert.equal(writes.length,1);
assert.equal(await syncStatus('test',{db,fb}),false);assert.equal(writes.length,1);
rows['consultasCDC/key']={status:'Em análise',expiraEm:{toMillis:()=>0}};
assert.equal(await syncStatus('test',{db,fb}),false);assert.equal(writes.length,1);
delete rows['consultasCDC/key'];assert.equal(await syncStatus('test',{db,fb}),false);
class Element{constructor(){this.children=[];this.style={};this.value='';}append(...els){this.children.push(...els);}setAttribute(){} set innerHTML(v){this.html=v;this.children=[];}get innerHTML(){return this.html;}}
globalThis.document={createElement:()=>new Element()};
globalThis.sessionStorage={getItem:()=>''};
const result=new Element(),button=new Element(),cpf=new Element(),code=new Element();
const form={elements:{cpf,codigo:code},querySelector:()=>button};
const nodes={'[data-query]':form,'[data-result]':result,'[data-notice]':new Element()};
const root={querySelector:k=>nodes[k]};
mountStatus(root,{db});cpf.value='000.000.000-00';code.value='a'.repeat(32);
rows['consultasCDC/key']={status:'Pendente',expiraEm:expiry};
await form.onsubmit({preventDefault(){}});
assert.equal(result.children[0].textContent,'Pendente');
assert.match(result.children[1].textContent,/pendências/);
assert.equal(button.disabled,false);
assert.equal(JSON.stringify(result).includes('INTERNAL'),false);
console.log('Status mapping, private projection, existing-code sync, expiry, idempotency and customer lookup: PASS');

const refused={analiseCdc:{resultado:{status:'Recusada',motivos:['Restrição informada.','Sobra insuficiente: SECRET']},observacoes:'INTERNAL'}};
assert.deepEqual(publicDetails(refused),['Restrição informada.','Após pagar os gastos e a nova parcela, sobrariam menos de R$ 600,00 no mês.']);
assert.ok(statusRecord(refused,fb).expiraEm-Date.now()>3600000);
assert.deepEqual(publicDetails({analiseCdc:{decisao:{status:'Recusada',motivo:'INTERNAL',motivoCliente:'Valor solicitado fora dos critérios.'}}}),['Valor solicitado fora dos critérios.']);
assert.equal(JSON.stringify(publicDetails({analiseCdc:{resultado:{status:'Pendente',pendencias:['Nome divergente: identidade Maria SECRET','Erro técnico SECRET']}}})).includes('SECRET'),false);
for(const s of ['Recusada','Pendente','Aprovada']){
  mountStatus(root,{db});cpf.value='00000000000';code.value='a'.repeat(32);
  rows['consultasCDC/key']={...statusRecord({analiseCdc:{resultado:{status:s,motivos:['Restrição informada.'],pendencias:['Documento obrigatório não enviado: Renda']}}},fb),expiraEm:expiry};
  await form.onsubmit({preventDefault(){}});
  assert.equal(result.children[0].textContent,s==='Aprovada'?'Pré-aprovada':s);
  if(s!=='Aprovada')assert.equal(result.children[2].children.length,1);
  assert.equal(button.disabled,false);
}
console.log('Customer reasons, safe wording, manual reasons, status rendering and minimum validity: PASS');

const technical={analiseCdc:{resultado:{status:'Pendente',tipoFalha:'tecnica',motivos:['Falha interna']}}};
assert.equal(publicStatus(technical),'Em análise');assert.deepEqual(publicDetails(technical),[]);
assert.equal(publicStatus({analiseCdc:{resultado:{status:'Recusada',motivos:['Documento ilegível: teste. Foram registrados dois envios consecutivos ilegíveis.']}}}),'Em análise');
assert.equal(publicStatus({analiseCdc:{...technical.analiseCdc,decisao:{status:'Recusada'}}}),'Recusada');
console.log('PASS: technical failures and old OCR-only refusals remain under review, explicit decisions preserved');
