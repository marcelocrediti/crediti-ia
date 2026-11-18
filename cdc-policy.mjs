export const POLICY_VERSION = '2026-11-18-v2-pix';
const cents = n => Math.round(Number(n)*100);
export function evaluateCredit({q, parcela, history=[], contracts=[], documents=[], today}) {
  const reasons=[], pending=[];
  const income=cents(q.renda), expenses=cents(q.despesas), debts=cents(q.outrasParcelas), payment=cents(parcela);
  if([q.renda,q.despesas,q.outrasParcelas].some(x=>x===null||x===''||x===undefined) || ![income,expenses,debts,payment].every(Number.isFinite) || income<=0 || expenses<0 || debts<0 || payment<=0) pending.push('Informe renda líquida, despesas e parcelas existentes com valores válidos.');
  if(q.restricao==='sim') reasons.push('Restrição informada na ficha.');
  if(q.restricao!=='nao' && q.restricao!=='sim') pending.push('Confirme a situação de restrições.');
  if(history.some(x=>x.tipo==='atencao'||(x.tipo==='nota'&&x.nota?.trim())))pending.push('Há observações ou pontos de atenção no histórico. Leia a gaveta e faça a avaliação manual; o texto livre não gera uma recusa automática.');
  const maximum = Math.max(0,Math.min(Math.floor(income*0.15)-debts,income-expenses-debts));
  if(payment>maximum && Number.isFinite(maximum)) reasons.push('Parcela acima do limite de renda disponível: máximo R$ '+(maximum/100).toFixed(2).replace('.',',')+'.');
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
    if(d.consecutivos>=2) reasons.push('Dois envios consecutivos ilegíveis: '+d.label+'.');
    else if(d.legibilidade!=='legivel' || !d.confirmado) pending.push('Conferir ou reenviar '+d.label+'.');
  }
  if(!q.documentosConferidos) pending.push('Confirme os documentos obrigatórios e os valores extraídos.');
  return {status:reasons.length?'Recusada':pending.length?'Pendente':'Aprovada',motivos:reasons.length?reasons:pending.length?pending:['Parcela dentro do limite, documentos conferidos, restrições respondidas como não e nenhum impedimento registrado.'+(history.some(x=>x.tipo==='positivo')?' Histórico contém registro positivo.':'')],pendencias:pending,limiteParcela:maximum/100,comprometimento:income>0?(debts+payment)/income*100:null,versao:POLICY_VERSION};
}
