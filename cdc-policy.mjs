export const POLICY_VERSION = '2026-11-19-v3-explicacoes';
const cents = n => Math.round(Number(n)*100);
const money = n => Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function evaluateCredit({q, parcela, history=[], contracts=[], documents=[], today}) {
  const reasons=[], pending=[];
  const income=cents(q.renda), expenses=cents(q.despesas), debts=cents(q.outrasParcelas), payment=cents(parcela);
  const validMoney=![q.renda,q.despesas,q.outrasParcelas].some(x=>x===null||x===''||x===undefined) && [income,expenses,debts,payment].every(Number.isFinite) && income>0 && expenses>=0 && debts>=0 && payment>0;
  if(!validMoney) pending.push('Renda e gastos: preencha a renda líquida, os gastos mensais e as parcelas existentes com valores válidos. Sem esses dados não é possível calcular o limite.');
  if(q.restricao==='sim') reasons.push('Restrição informada.');
  if(q.restricao!=='nao' && q.restricao!=='sim') pending.push('Confirme a situação de restrições.');
  if(history.some(x=>x.tipo==='atencao'||(x.tipo==='nota'&&x.nota?.trim())))pending.push('Há observações ou pontos de atenção no histórico. Leia a gaveta e faça a avaliação manual; o texto livre não gera uma recusa automática.');
  const maximum = validMoney?Math.max(0,Math.min(Math.floor(income*15/100)-debts,income-expenses-debts)):null;
  const requiredIncome=validMoney?Math.max(Math.ceil((debts+payment)*100/15),expenses+debts+payment):null;
  if(validMoney && debts+payment>Math.floor(income*15/100)) reasons.push('Comprometimento da renda: renda líquida informada de '+money(income/100)+'. O limite de 15% corresponde a '+money(Math.floor(income*15/100)/100)+'. As parcelas existentes de '+money(debts/100)+' mais a nova parcela de '+money(payment/100)+' somam '+money((debts+payment)/100)+' ('+((debts+payment)/income*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'% da renda). Para atender somente a este limite, seria necessária renda líquida de pelo menos '+money(Math.ceil((debts+payment)*100/15)/100)+'.');
  if(validMoney && payment>income-expenses-debts) reasons.push('Saldo após os gastos: '+money(income/100)+' de renda − '+money(expenses/100)+' de gastos com mercado, energia, água, internet, remédios e aluguéis − '+money(debts/100)+' de parcelas existentes = '+money((income-expenses-debts)/100)+'. Esse saldo não cobre a nova parcela de '+money(payment/100)+'. Mantidos os gastos, seria necessária renda de pelo menos '+money((expenses+debts+payment)/100)+' para cobrir todos esses pagamentos.');
  if(history.some(x=>x.tipo==='renegociacao')) reasons.push('Histórico de contrato renegociado na Crediti.');
  const late=new Set(history.filter(x=>x.tipo==='atraso' && x.dias>0).map(x=>x.contrato+'|'+x.vencimento));
  if(late.size>=3){
    const payoff=contracts.map(id=>history.filter(x=>x.contrato===id && x.tipo==='quitacao').map(x=>x.data).sort().at(-1));
    if(!contracts.length || payoff.some(x=>!x)) reasons.push('Três ou mais parcelas atrasadas e quitação de todos os contratos ainda não registrada.');
    else {
      const last=payoff.sort().at(-1);
      const date=new Date(last+'T12:00:00Z'); const month=date.getUTCMonth(); date.setUTCFullYear(date.getUTCFullYear()+1);
      if(date.getUTCMonth()!==month) date.setUTCDate(0);
      const until=date.toISOString().slice(0,10);
      if(today<until) reasons.push('Bloqueio por atrasos até '+until.split('-').reverse().join('/')+' (12 meses após a quitação).');
    }
  }
  for(const d of documents){
    if(d.consecutivos>=2) reasons.push('Documento ilegível: '+d.label+'. Foram registrados dois envios consecutivos ilegíveis, conforme a regra da Crediti. Confira os registros antes de confirmar a recusa.');
    else if(d.legibilidade!=='legivel') pending.push('Documento '+(d.legibilidade==='ilegivel'?'ilegível':'com leitura inconclusiva')+': '+d.label+'. Envie uma cópia completa e legível. A leitura não foi suficiente para confirmar os dados.');
    else if(!d.confirmado) pending.push('Conferência documental: '+d.label+'. Falta a confirmação do administrador.');
  }
  if(!q.documentosConferidos) pending.push('Confirme os documentos obrigatórios e os valores extraídos.');
  return {status:reasons.length?'Recusada':pending.length?'Pendente':'Aprovada',motivos:reasons.length?reasons:pending.length?pending:['Parcela dentro do limite, documentos conferidos, restrições respondidas como não e nenhum impedimento registrado.'+(history.some(x=>x.tipo==='positivo')?' Histórico contém registro positivo.':'')],pendencias:pending,limiteParcela:maximum===null?null:maximum/100,rendaMinima:requiredIncome===null?null:requiredIncome/100,calculo:validMoney?{renda:income/100,gastos:expenses/100,parcelasExistentes:debts/100,novaParcela:payment/100,teto15:Math.floor(income*15/100)/100,margem15:Math.max(0,Math.floor(income*15/100)-debts)/100,saldo:(income-expenses-debts)/100}:null,comprometimento:validMoney?(debts+payment)/income*100:null,versao:POLICY_VERSION};
}

const normalizedName=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const digits=v=>String(v||'').replace(/\D/g,'');
export function documentFindings({q,cliente,cpf,readDocs}){
  const pending=[],notes=[];
  const expected={rgFrente:'identidade',cpfFrente:'cpf',comprovanteResidencia:'residencia',comprovanteRenda:'renda'};
  const typeLabels={identidade:'documento de identidade',cpf:'CPF',residencia:'comprovante de residência',renda:'comprovante de renda',conta:'comprovante bancário',outro:'outro tipo de documento'};
  if(!['proprio','terceiro'].includes(q.residenciaTitular))pending.push('Comprovante de residência: informe se está no nome do cliente ou de terceiro.');
  if(q.residenciaTitular==='terceiro'&&!String(q.residenciaJustificativa||'').trim())pending.push('Comprovante de residência em nome de terceiro: falta justificar a relação com o titular e o endereço informado.');
  for(const {key,label,d}of readDocs){
    if(d.legibilidade!=='legivel')continue;
    if(d.tipo!==expected[key]){pending.push('Documento inadequado: '+label+'. Esperado: '+typeLabels[expected[key]]+'. O leitor identificou: '+(typeLabels[d.tipo]||'tipo não identificado')+'. Envie o documento solicitado.');continue;}
    const third=key==='comprovanteResidencia'&&q.residenciaTitular==='terceiro';
    if(third){
      notes.push('Residência em nome de terceiro. Titular lido: '+(d.nome||'não identificado')+'. Justificativa: '+(q.residenciaJustificativa||'não preenchida')+'. A diferença de titular, sozinha, não é motivo de recusa. Confira o endereço e a justificativa.');
      if(!q.documentosConferidos)pending.push('Residência de terceiro: o administrador precisa conferir o endereço, o vínculo declarado e a justificativa.');
      continue;
    }
    const name=normalizedName(d.nome),clientName=normalizedName(cliente);
    if(name&&clientName&&name!==clientName)pending.push('Nome divergente em '+label+': a ficha está em nome de “'+cliente+'”, mas o nome lido no documento é “'+d.nome+'”. Confira o titular no anexo; erro de leitura, abreviação ou alteração de nome precisam de verificação.');
    if(digits(d.cpf)&&digits(d.cpf)!==digits(cpf))pending.push('CPF divergente em '+label+': o CPF lido não corresponde ao CPF da ficha. Confira a identidade do titular antes de prosseguir.');
    if(!name&&!digits(d.cpf))pending.push('Titular não identificado em '+label+': a leitura não encontrou nome nem CPF suficientes para comparar com a ficha.');
  }
  const incomes=readDocs.filter(x=>x.key==='comprovanteRenda'&&x.d.tipo==='renda'&&x.d.legibilidade==='legivel'&&Number.isFinite(x.d.rendaLiquida)&&x.d.rendaLiquida>0);
  if(!incomes.length)pending.push('Renda não confirmada nos anexos. Renda informada: '+(Number.isFinite(q.renda)&&q.renda>0?money(q.renda):'não preenchida')+'. Não foi possível identificar renda líquida comprovada. Isso não significa renda zero; envie ou confira o comprovante de renda.');
  else{
    notes.push('Renda informada: '+money(q.renda)+'. Valores líquidos identificados nos comprovantes: '+incomes.map(x=>money(x.d.rendaLiquida)+' ('+x.label+')').join('; ')+'.');
    if(q.renda>Math.min(...incomes.map(x=>x.d.rendaLiquida))+0.01)pending.push('Renda divergente: informada '+money(q.renda)+', mas há comprovante com renda líquida de '+money(Math.min(...incomes.map(x=>x.d.rendaLiquida)))+'. Confira as competências, variações mensais e eventual soma de fontes de renda. A diferença exige conferência, não comprova informação falsa.');
  }
  return {pending:[...new Set(pending)],notes:[...new Set(notes)]};
}

export function analysisSections(result,{valor,parcela,prazo,readCount,historyCount}){
  const sections=[];
  if(result.status==='Recusada')sections.push({title:'Motivos da recusa na avaliação',items:result.motivos});
  if(result.pendencias?.length)sections.push({title:'Pendências de conferência',items:result.pendencias});
  if(result.status==='Aprovada')sections.push({title:'Motivos da avaliação',items:result.motivos});
  const c=result.calculo;
  sections.push({title:'Como o limite foi calculado',items:c?[
    'Renda líquida informada: '+money(c.renda)+'.',
    'Gastos mensais informados: '+money(c.gastos)+' (mercado, energia, água, internet, remédios e aluguéis).',
    'Empréstimos e financiamentos existentes: '+money(c.parcelasExistentes)+' por mês.',
    'Limite de 15%: '+money(c.renda)+' × 15% = '+money(c.teto15)+'. Descontando as parcelas existentes, restam '+money(c.margem15)+'.',
    'Saldo após gastos e parcelas existentes: '+money(c.renda)+' − '+money(c.gastos)+' − '+money(c.parcelasExistentes)+' = '+money(c.saldo)+'.',
    'Limite para a nova parcela: '+money(result.limiteParcela)+'. É o menor valor entre a margem de 15% e o saldo disponível, nunca abaixo de zero.',
    'Nova parcela solicitada: '+money(parcela)+'. Renda mínima calculada para atender aos dois critérios: '+money(result.rendaMinima)+'. Esse valor é uma referência matemática, não uma renda comprovada nem garantia de aprovação.'
  ]:['Limite não calculado: faltam dados financeiros válidos. Não interpretar como renda ou limite de R$ 0,00.']});
  if(result.notasDocumentos?.length)sections.push({title:'Conferência dos documentos',items:result.notasDocumentos});
  sections.push({title:'Resumo da proposta',items:['Crédito: '+money(valor)+'. Parcelamento: '+prazo+'x de '+money(parcela)+'.','Anexos com leitura concluída: '+readCount+'. A leitura não comprova autenticidade.','Registros consultados no histórico: '+historyCount+'.','Confira as evidências antes de confirmar a decisão.']});
  return sections;
}
export const sectionsText=(status,sections)=>status+'\n\n'+sections.map(s=>s.title+'\n\n'+s.items.map((v,i)=>(i+1)+'. '+v).join('\n\n')).join('\n\n');

