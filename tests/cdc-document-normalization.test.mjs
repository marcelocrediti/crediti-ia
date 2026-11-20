import assert from 'node:assert/strict';
import {normalizeDocument} from '../server/cdc-analysis.mjs';
for(const subtipo of ['pix','recibo_transferencia']){
 const d=normalizeDocument({subtipo,tipo:'renda',extratoBancario:true,contemEndereco:true,rendaLiquida:5000,valorBeneficio:2000,competencias:['2026-10'],periodoInicio:'2026-09-01',periodoFim:'2026-10-31'});
 assert.equal(d.tipo,'outro');assert.equal(d.extratoBancario,false);assert.equal(d.contemEndereco,false);assert.equal(d.rendaLiquida,null);assert.deepEqual(d.competencias,[]);assert.equal(d.periodoInicio,null);
}
const bank=normalizeDocument({subtipo:'extrato_bancario',tipo:'renda',rendaLiquida:20000,valorBeneficio:5000});
assert.equal(bank.rendaLiquida,null);assert.equal(bank.valorBeneficio,null);assert.equal(bank.extratoBancario,true);assert.equal(bank.tipo,'conta');
const inss=normalizeDocument({subtipo:'pagamento_inss',rendaLiquida:2000,valorBeneficio:2000,extratoBancario:true});
assert.equal(inss.rendaLiquida,null);assert.equal(inss.valorBeneficio,2000);assert.equal(inss.extratoBancario,false);assert.equal(inss.tipo,'renda');
assert.equal(normalizeDocument({subtipo:'contracheque',rendaLiquida:2000}).rendaLiquida,2000);
assert.equal(normalizeDocument({subtipo:'outro',rendaLiquida:3000,extratoBancario:true}).extratoBancario,false);
console.log('PASS: model output normalized for payroll, INSS, statements, Pix and isolated transfers');
const cin=normalizeDocument({tipoIdentidade:'cin',cpf:null,numeroUnicoCin:'529.982.247-25'});
assert.equal(cin.cpf,'52998224725');assert.equal(cin.tipo,'identidade');
assert.equal(normalizeDocument({tipoIdentidade:'rg',cpf:null,numeroUnicoCin:'52998224725'}).cpf,null);
assert.equal(normalizeDocument({tipoIdentidade:'cnh',cpf:null,numeroUnicoCin:'52998224725'}).cpf,null);
assert.equal(normalizeDocument({tipoIdentidade:'cin',cpf:null,numeroUnicoCin:'***.982.247-25'}).cpf,null);
const {readDocument}=await import('../server/cdc-analysis.mjs');
let calls=0;
const fake={responses:{create:async req=>{calls++;return {status:'completed',output_text:JSON.stringify({tipo:'identidade',tipoIdentidade:'cnh',cpf:calls===1?null:'52998224725',legibilidade:'legivel',observacoes:'Teste fictício',subtipo:'outro'})};}}};
const reread=await readDocument(fake,'data:application/pdf;base64,JVBERg==','rgFrente');
assert.equal(calls,2);assert.equal(reread.cpf,'52998224725');assert.equal(reread.versaoIdentidade,1);
calls=0;
const direct={responses:{create:async()=>{calls++;return {status:'completed',output_text:JSON.stringify({tipo:'identidade',tipoIdentidade:'cin',cpf:null,numeroUnicoCin:'52998224725',legibilidade:'legivel',observacoes:'Teste fictício'})};}}};
assert.equal((await readDocument(direct,'data:application/pdf;base64,JVBERg==','rgFrente')).cpf,'52998224725');assert.equal(calls,1);
console.log('PASS: CIN unique ID, CNH focused reread, no old-RG substitution or extra call for already readable CPF');
