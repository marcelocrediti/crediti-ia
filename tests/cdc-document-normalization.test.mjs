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
