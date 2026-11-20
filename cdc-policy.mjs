export const POLICY_VERSION = '2026-11-20-v10-conferencia-manual';
const cents = n => Math.round(Number(n)*100);
const money = n => Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function evaluateCredit({q, parcela, valor, history=[], contracts=[], documents=[], today}) {
  const reasons=[], pending=[];
  const income=cents(q.renda), expenses=cents(q.despesas), debts=cents(q.outrasParcelas), payment=cents(parcela);
  const validMoney=![q.renda,q.despesas,q.outrasParcelas].some(x=>x===null||x===''||x===undefined) && [income,expenses,debts,payment].every(Number.isFinite) && income>0 && expenses>=0 && debts>=0 && payment>0;
  if(!validMoney) pending.push('Renda e gastos: preencha a renda líquida, os gastos mensais e as parcelas existentes com valores válidos. Sem esses dados não é possível calcular o limite.');
  if(q.restricao==='sim') reasons.push('Restrição informada.');
  if(q.restricao!=='nao' && q.restricao!=='sim') pending.push('Confirme a situação de restrições.');
  if(history.some(x=>x.tipo==='atencao'||(x.tipo==='nota'&&x.nota?.trim())))pending.push('Há observações ou pontos de atenção no histórico. Leia a gaveta e faça a avaliação manual; o texto livre não gera uma recusa automática.');
  const available=validMoney?income-expenses-debts:null;
  const maximum=validMoney?Math.max(0,Math.min(Math.floor(available*15/100),available-60000)):null;
  const requiredIncome=validMoney?expenses+debts+Math.max(Math.ceil(payment*100/15),60000+payment):null;
  if(!Number.isFinite(Number(valor))||Number(valor)<=0) pending.push('Informe o valor do empréstimo para conferir o mínimo de R$ 300,00.');
  else if(cents(valor)<30000) reasons.push('Valor abaixo do mínimo: empréstimo solicitado de '+money(valor)+'. O mínimo da Crediti é R$ 300,00.');
  if(validMoney && payment>Math.floor(available*15/100)) reasons.push('Parcela acima de 15% da sobra: renda recebida de '+money(income/100)+' − gastos de '+money(expenses/100)+' − empréstimos e financiamentos atuais de '+money(debts/100)+' = '+money(available/100)+'. Os 15% dessa sobra permitem até '+money(Math.max(0,Math.floor(available*15/100))/100)+', mas a nova parcela é '+money(payment/100)+'.');
  if(validMoney && available-payment<60000) reasons.push('Sobra insuficiente para o mês: após as despesas e os empréstimos atuais, restam '+money(available/100)+'. Descontando a nova parcela de '+money(payment/100)+', sobrariam '+money((available-payment)/100)+'. É necessário preservar pelo menos R$ 600,00 por mês.');
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
    if(d.manual===true)continue;
    if(d.legibilidade!=='legivel'&&d.consecutivos>=2) pending.push('Leitura automática inconclusiva: '+d.label+'. O leitor não confirmou a legibilidade em duas tentativas. Confira o anexo manualmente; isso não gera recusa automática.');
    else if(d.legibilidade!=='legivel') pending.push('Documento '+(d.legibilidade==='ilegivel'?'ilegível':'com leitura inconclusiva')+': '+d.label+'. Envie uma cópia completa e legível. A leitura não foi suficiente para confirmar os dados.');
    else if(!d.confirmado) pending.push('Conferência documental: '+d.label+'. Falta a confirmação do administrador.');
  }
  if(!q.documentosConferidos) pending.push('Confirme os documentos obrigatórios e os valores extraídos.');
  return {status:reasons.length?'Recusada':pending.length?'Pendente':'Aprovada',motivos:reasons.length?reasons:pending.length?pending:['Parcela dentro do limite, documentos conferidos, restrições respondidas como não e nenhum impedimento registrado.'+(history.some(x=>x.tipo==='positivo')?' Histórico contém registro positivo.':'')],pendencias:pending,limiteParcela:maximum===null?null:maximum/100,rendaMinima:requiredIncome===null?null:requiredIncome/100,calculo:validMoney?{renda:income/100,gastos:expenses/100,parcelasExistentes:debts/100,novaParcela:payment/100,teto15:Math.max(0,Math.floor(available*15/100))/100,margem15:Math.max(0,Math.floor(available*15/100))/100,saldo:(income-expenses-debts)/100}:null,comprometimento:validMoney&&available>0?payment/available*100:null,versao:POLICY_VERSION};
}

const normalizedName=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').split(/\s+/).filter(x=>x&&!['DE','DA','DO','DAS','DOS'].includes(x)).join(' ');
const digits=v=>String(v||'').replace(/\D/g,'');
export const completeCpf=v=>/^\d{11}$/.test(String(v||'').replace(/[.\-\s]/g,''));
const oneEdit=(a,b)=>{if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,errors=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++errors>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}return errors+(a.length-i)+(b.length-j)<=1;};
const nearName=(a,b)=>{const x=a.split(' '),y=b.split(' ');return x.length>=2&&x.length===y.length&&x.filter((v,i)=>v!==y[i]).length===1&&x.every((v,i)=>oneEdit(v,y[i]));};
export function compatibleShortName(documentName,clientName){
  const short=normalizedName(documentName).split(' ').filter(Boolean),full=normalizedName(clientName).split(' ').filter(Boolean);
  // Only a complete one/two-word prefix, never a substring or a different surname.
  return short.length>0&&short.length<=2&&short.length<full.length&&short.every((word,i)=>word===full[i]);
}
export function documentCpf(d){
  if(completeCpf(d.cpf))return digits(d.cpf);
  if(d.tipoIdentidade==='cin'&&completeCpf(d.numeroUnicoCin))return digits(d.numeroUnicoCin);
  const partial=d.cpfParcial||d.cpf;
  if(/^[0-9.\-\s]+$/.test(String(partial||''))&&digits(partial).length===9)return digits(partial);
  return '';
}
export const cpfMatches=(d,expected)=>{const read=documentCpf(d),full=digits(expected);return full.length===11&&(read.length===11?read===full:read.length===9&&read===full.slice(0,9));};
export const identityDocument=d=>['rg','cin','cnh','identidade','carteira identidade nacional','carteira nacional habilitacao'].includes(normalizedName(d.tipo).toLowerCase())||['rg','cin','cnh'].includes(String(d.tipoIdentidade||'').toLowerCase());
export function incomeDocumentKind(d){
  // Classification comes from the document content, never its filename.
  if(['pix','recibo_transferencia'].includes(d.subtipo))return 'recibo';
  if(d.subtipo==='extrato_bancario'||d.extratoBancario===true)return 'extrato';
  if(d.subtipo==='pagamento_inss')return 'inss';
  if(d.subtipo==='contracheque')return 'contracheque';
  return 'outro';
}
export function documentIncomeSummary(d){
  const kind=incomeDocumentKind(d);
  if(kind==='recibo')return 'Recibo de operação isolada: não aceito como extrato bancário.';
  if(kind==='extrato')return 'Movimentação bancária: não exige renda líquida no documento. Saldo e entradas não são renda líquida.';
  if(kind==='inss')return 'Extrato de pagamento do INSS'+(Number.isFinite(d.valorBeneficio)?': valor do benefício '+money(d.valorBeneficio):': sem exigência de campo de renda líquida')+'.';
  if(kind==='contracheque')return 'Renda líquida: '+(Number.isFinite(d.rendaLiquida)&&d.rendaLiquida>0?money(d.rendaLiquida):'Não identificada no contracheque/holerite');
  return '';
}
export function statementCoverage(readDocs,today){
  const date=new Date(today+'T12:00:00Z');
  const months=[1,2].map(n=>new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()-n,1)).toISOString().slice(0,7));
  const docs=readDocs.filter(x=>x.key==='comprovanteRenda'&&x.d.legibilidade==='legivel'&&incomeDocumentKind(x.d)==='extrato');
  const found=new Set(docs.flatMap(x=>Array.isArray(x.d.competencias)?x.d.competencias:[]));
  // Complete preceding calendar months, or a complete rolling 60-day statement.
  const ranges=docs.map(x=>[x.d.periodoInicio,x.d.periodoFim]).filter(([a,b])=>/^\d{4}-\d{2}-\d{2}$/.test(a||'')&&/^\d{4}-\d{2}-\d{2}$/.test(b||'')&&a<=b&&b<=today).sort((a,b)=>a[0].localeCompare(b[0]));
  const merged=[];for(const [a,b]of ranges){const last=merged.at(-1);if(last&&Date.parse(a)-Date.parse(last[1])<=86400000)last[1]=last[1]>b?last[1]:b;else merged.push([a,b]);}
  const rollingStart=new Date(Date.parse(today+'T12:00:00Z')-59*86400000).toISOString().slice(0,10);
  return {ok:months.every(m=>found.has(m))||merged.some(([a,b])=>a<=rollingStart&&b>=today),months};
}
export function documentFindings({q,cliente,cpf,readDocs,today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})}){
  const pending=[],notes=[];
  const expected={rgFrente:'identidade',cpfFrente:'cpf',comprovanteResidencia:'residencia',comprovanteRenda:'renda'};
  const typeLabels={identidade:'documento de identidade',cpf:'CPF',residencia:'comprovante de residência',renda:'comprovante de renda',conta:'comprovante bancário',outro:'outro tipo de documento'};
  if(!['proprio','terceiro'].includes(q.residenciaTitular))pending.push('Comprovante de residência: informe se está no nome do cliente ou de terceiro.');
  if(q.residenciaTitular==='terceiro'&&!String(q.residenciaJustificativa||'').trim())pending.push('Comprovante de residência em nome de terceiro: falta justificar a relação com o titular e o endereço informado.');
  const manualKeys=new Set(readDocs.filter(x=>x.manual===true).map(x=>x.key));
  for(const {key,label,d,manual}of readDocs){
    if(manual===true){notes.push('Conferência manual registrada em '+label+': o administrador abriu e conferiu o documento. Essa conferência prevalece sobre a leitura automática desta categoria.');continue;}
    if(d.legibilidade!=='legivel'){
      if(d.legibilidade==='incerto'&&documentCpf(d)&&!cpfMatches(d,cpf))pending.push('CPF divergente em '+label+': o CPF lido não corresponde ao CPF da ficha. Confira a identidade do titular antes de prosseguir.');
      continue;
    }
    const kind=incomeDocumentKind(d);
    if(key==='comprovanteRenda'&&kind==='recibo'){
      pending.push('Documento inadequado: '+label+'. Comprovante Pix ou recibo isolado de transferência, depósito ou pagamento não é extrato bancário. Envie contracheque/holerite, extrato de pagamento do INSS ou extrato/comprovante bancário com movimentação dos últimos 60 dias.');
      continue;
    }
    const bankIncome=key==='comprovanteRenda'&&['extrato','inss','contracheque'].includes(kind);
    const bankAddress=key==='comprovanteResidencia'&&d.contemEndereco===true;
    const identityCpf=['rgFrente','cpfFrente'].includes(key)&&identityDocument(d);
    if((key==='comprovanteRenda'&&!bankIncome)||(d.tipo!==expected[key]&&!bankIncome&&!bankAddress&&!identityCpf)){pending.push('Documento inadequado: '+label+'. Esperado: '+typeLabels[expected[key]]+'. O conteúdo lido não confirmou essa finalidade. Confira o anexo antes de solicitar outro.');continue;}
    if(bankAddress)notes.push('Documento bancário com endereço identificado em '+label+'. Confira se o endereço corresponde à ficha.');
    const third=key==='comprovanteResidencia'&&q.residenciaTitular==='terceiro';
    if(third){
      notes.push('Residência em nome de terceiro. Titular lido: '+(d.nome||'não identificado')+'. Justificativa: '+(q.residenciaJustificativa||'não preenchida')+'. A diferença de titular, sozinha, não é motivo de recusa. Confira o endereço e a justificativa.');
      if(!q.documentosConferidos)pending.push('Residência de terceiro: o administrador precisa conferir o endereço, o vínculo declarado e a justificativa.');
      continue;
    }
    const name=normalizedName(d.nome),clientName=normalizedName(cliente);
    if(name&&clientName&&name.replace(/ /g,'')!==clientName.replace(/ /g,'')){
      if(key==='comprovanteRenda'&&bankIncome&&compatibleShortName(name,clientName))notes.push('Nome abreviado compatível em '+label+': “'+d.nome+'”. A abreviação, sozinha, não gera pendência; a identificação completa é conferida na identidade.');
      else if(nearName(name,clientName)&&documentCpf(d)&&cpfMatches(d,cpf)&&q.documentosConferidos)notes.push('Pequena variação de grafia em '+label+': ficha “'+cliente+'”, leitura “'+d.nome+'”. CPF coincide e o administrador marcou os documentos como conferidos. A variação foi registrada, sem recusa automática.');
      else pending.push('Nome divergente em '+label+': a ficha está em nome de “'+cliente+'”, mas o nome lido no documento é “'+d.nome+'”. Confira o titular no anexo; erro de leitura, abreviação ou alteração de nome precisam de verificação.');
    }
    if(documentCpf(d)&&!cpfMatches(d,cpf))pending.push('CPF divergente em '+label+': o CPF lido não corresponde ao CPF da ficha. Confira a identidade do titular antes de prosseguir.');
    if(!name&&!documentCpf(d))pending.push('Titular não identificado em '+label+': a leitura não encontrou nome nem CPF suficientes para comparar com a ficha.');
  }
  const cpfFound=manualKeys.has('rgFrente')||manualKeys.has('cpfFrente')||readDocs.some(x=>['rgFrente','cpfFrente'].includes(x.key)&&(identityDocument(x.d)||x.d.tipo==='cpf')&&['legivel','incerto'].includes(x.d.legibilidade)&&cpfMatches(x.d,cpf));
  if(!cpfFound)pending.push('Leitura do CPF inconclusiva. Isso não significa que o CPF esteja ausente do documento. Abra o anexo para conferir o campo CPF da CNH ou o número único da CIN e tente Analisar ficha novamente. Não é necessário comprovante separado quando o número consta na identidade.');
  else notes.push(manualKeys.has('rgFrente')||manualKeys.has('cpfFrente')?'CPF conferido manualmente pelo administrador no documento. Não é necessário comprovante separado.':readDocs.some(x=>documentCpf(x.d).length===9&&cpfMatches(x.d,cpf))?'Os nove primeiros dígitos do CPF lidos no documento correspondem à ficha. Os dois restantes não foram inventados nem preenchidos pelo leitor.':'CPF identificado automaticamente nos documentos e compatível com a ficha. Não é necessário comprovante separado.');
  const bankDocs=readDocs.filter(x=>x.key==='comprovanteRenda'&&x.d.legibilidade==='legivel'&&incomeDocumentKind(x.d)==='extrato');
  if(!manualKeys.has('comprovanteRenda')&&bankDocs.length){const coverage=statementCoverage(readDocs,today);if(!coverage.ok)pending.push('Movimentação bancária: apresente os últimos 2 meses. Confira a cobertura dos extratos; os meses esperados são '+coverage.months.slice().reverse().join(' e ')+' ou os últimos 60 dias completos.');else notes.push('Extrato bancário aceito para conferir a movimentação dos últimos 2 meses. Confira se as páginas e o período estão completos; entradas e saldo não equivalem automaticamente à renda.');}
  const payrolls=readDocs.filter(x=>x.key==='comprovanteRenda'&&x.d.legibilidade==='legivel'&&incomeDocumentKind(x.d)==='contracheque');
  const benefits=readDocs.filter(x=>x.key==='comprovanteRenda'&&x.d.legibilidade==='legivel'&&incomeDocumentKind(x.d)==='inss');
  if(bankDocs.length)notes.push('Extrato/comprovante bancário: renda líquida não se aplica. A renda mensal informada na ficha permanece para conferência do administrador, sem transformar movimentação ou saldo em renda.');
  if(benefits.length)notes.push('Extrato de pagamento do INSS aceito. Não se exige o campo de renda líquida de contracheque neste documento. Confira o benefício e a competência.');
  for(const x of manualKeys.has('comprovanteRenda')?[]:payrolls){
    if(!Number.isFinite(x.d.rendaLiquida)||x.d.rendaLiquida<=0)pending.push('Renda não confirmada no contracheque/holerite: '+x.label+'. Confira o valor líquido no documento.');
    else{
      notes.push('Renda informada: '+money(q.renda)+'. Renda líquida no contracheque/holerite: '+money(x.d.rendaLiquida)+' ('+x.label+').');
      if(q.renda>x.d.rendaLiquida+0.01)pending.push('Renda divergente: informada '+money(q.renda)+', mas o contracheque/holerite apresenta '+money(x.d.rendaLiquida)+'. Confira as competências e as fontes de renda.');
    }
  }
  if(!manualKeys.has('comprovanteRenda')&&!bankDocs.length&&!benefits.length&&!payrolls.length)pending.push('Comprovante de renda: envie contracheque/holerite, extrato de pagamento do INSS ou extrato/comprovante bancário dos últimos 60 dias. Comprovante Pix não é aceito como extrato.');
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
    'Limite de 15% sobre a sobra: '+money(c.saldo)+' × 15% = '+money(c.teto15)+'.',
    'Saldo após gastos e parcelas existentes: '+money(c.renda)+' − '+money(c.gastos)+' − '+money(c.parcelasExistentes)+' = '+money(c.saldo)+'.',
    'Limite para a nova parcela: '+money(result.limiteParcela)+'. É o menor valor entre 15% da sobra e o valor que permite manter R$ 600,00 depois da nova parcela, nunca abaixo de zero.',
    'Sobra após a nova parcela: '+money(c.saldo-parcela)+'. Mínimo a preservar: R$ 600,00.',
    'Nova parcela solicitada: '+money(parcela)+'. Renda mínima calculada para atender aos dois critérios: '+money(result.rendaMinima)+'. Esse valor é uma referência matemática, não uma renda comprovada nem garantia de aprovação.'
  ]:['Limite não calculado: faltam dados financeiros válidos. Não interpretar como renda ou limite de R$ 0,00.']});
  if(result.notasDocumentos?.length)sections.push({title:'Conferência dos documentos',items:result.notasDocumentos});
  sections.push({title:'Resumo da proposta',items:['Crédito: '+money(valor)+'. Parcelamento: '+prazo+'x de '+money(parcela)+'.','Anexos com leitura concluída: '+readCount+'. A leitura não comprova autenticidade.','Registros consultados no histórico: '+historyCount+'.','Confira as evidências antes de confirmar a decisão.']});
  return sections;
}
export const sectionsText=(status,sections)=>status+'\n\n'+sections.map(s=>s.title+'\n\n'+s.items.map((v,i)=>(i+1)+'. '+v).join('\n\n')).join('\n\n');

