// Protected customer projection. Never copy internal notes, documents or history.
export const STATUS_DAYS=90;
export const RESPONSE_NOTICE='Resposta em até 24 horas, sem contar sábados e domingos. Análises de segunda a sexta, até as 17h (horário de Fortaleza). Consulte o andamento a qualquer horário.';
const digits=v=>String(v||'').replace(/\D/g,'');
export const normalizeCode=v=>String(v||'').replace(/[^a-f0-9]/gi,'').toLowerCase();
export const displayCode=v=>normalizeCode(v).match(/.{1,4}/g)?.join('-').toUpperCase()||'';
export const newCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(16))).map(n=>n.toString(16).padStart(2,'0')).join('');
export async function statusKey(cpf,code){
  const bytes=new TextEncoder().encode(digits(cpf)+'|'+normalizeCode(code));
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
}
export function publicStatus(sim){
  const decision=sim.analiseCdc?.decisao?.status;
  if(sim.aceite)return 'Contratada';
  if(decision==='Aprovada')return 'Pré-aprovada';
  if(decision==='Recusada')return 'Recusada';
  const result=sim.analiseCdc?.resultado?.status;
  if(result==='Aprovada')return 'Pré-aprovada';
  if(result==='Recusada'||result==='Pendente')return result;
  return 'Em análise';
}
// Map known findings to fixed customer wording. Raw findings may contain names,
// filenames, third-party data or technical errors and must never be published.
function customerReason(value){
  const text=String(value||'');
  const category=/residência|residencia|residencial/i.test(text)?'comprovante de residência':/renda|contracheque|benefício|extratos/i.test(text)?'comprovante de renda':/identidade|RG, CIN|CNH/i.test(text)?'documento de identidade':/CPF/.test(text)?'documento do CPF':'documento enviado';
  if(/^Restrição informada/.test(text))return 'Restrição informada.';
  if(/^Valor abaixo do mínimo/.test(text))return 'O valor solicitado é inferior ao mínimo de R$ 300,00.';
  if(/^Parcela acima|^Parcela superior/.test(text))return 'A parcela ultrapassa o limite de 15% da renda que sobra após os gastos e os empréstimos atuais.';
  if(/^Sobra insuficiente/.test(text))return 'Após pagar os gastos e a nova parcela, sobrariam menos de R$ 600,00 no mês.';
  if(/^Histórico de contrato renegociado/.test(text))return 'Há contrato renegociado na Crediti.';
  if(/^Três ou mais|^Bloqueio por atrasos/.test(text))return 'Há impedimento por atrasos anteriores na Crediti. Entre em contato para conferir o prazo.';
  if(/^Documento ilegível:/.test(text)&&text.includes('dois envios'))return 'Foram registrados dois envios consecutivos de documento ilegível.';
  if(/^Documento obrigatório não enviado:/.test(text))return 'Falta enviar o '+category+'.';
  if(/^Documento inadequado:|^Tipo do documento não confirmado:/.test(text))return 'O arquivo não corresponde ao '+category+' solicitado. Envie o documento correto.';
  if(/^Nome divergente|^CPF divergente/.test(text))return 'Há diferença entre os dados da ficha e o titular do '+category+'. Confira com a Crediti.';
  if(/^CPF não confirmado/.test(text))return 'Não foi possível conferir o CPF nos documentos. Envie uma cópia legível da identidade com CPF ou um comprovante de CPF separado.';
  if(/^Movimentação bancária:/.test(text))return 'Falta confirmar a movimentação dos últimos 2 meses. Envie os extratos completos desse período.';
  if(/^Titular não identificado/.test(text))return 'Não foi possível identificar o titular do '+category+'. Envie uma cópia completa e legível.';
  if(/^Documento (ilegível|com leitura inconclusiva)/.test(text))return 'Não foi possível ler o '+category+'. Envie uma cópia completa e legível.';
  if(/^Renda não confirmada|^Confirme a renda líquida/.test(text))return 'A renda não pôde ser confirmada nos anexos. Confira ou envie os comprovantes de renda.';
  if(/^Renda divergente/.test(text))return 'A renda informada difere do comprovante. Confira os valores e esclareça a diferença com a Crediti.';
  if(/^Renda e gastos:/.test(text))return 'Faltam valores válidos de renda, gastos mensais ou parcelas de empréstimos atuais.';
  if(/^Confirme a situação de restrições/.test(text))return 'Falta responder se há restrições no nome.';
  if(/^Comprovante de residência em nome de terceiro:/.test(text))return 'Falta justificar por que o comprovante de residência está em nome de terceiro.';
  if(/^Comprovante de residência: informe/.test(text))return 'Informe se o comprovante de residência está no seu nome ou no nome de terceiro.';
  if(/^Informe o valor do empréstimo/.test(text))return 'Falta confirmar o valor solicitado com a Crediti.';
  if(/^Residência de terceiro:/.test(text))return 'A Crediti está conferindo a justificativa e o endereço do comprovante em nome de terceiro.';
  return 'A Crediti precisa concluir uma conferência interna. Aguarde o contato ou fale com a equipe.';
}
export function publicDetails(sim){
  const status=publicStatus(sim),analysis=sim.analiseCdc||{};
  if(!['Recusada','Pendente'].includes(status))return [];
  if(analysis.decisao?.status==='Recusada'){
    // Only new, explicitly customer-facing manual reasons are copied verbatim.
    const approved=analysis.decisao.motivoCliente;
    if(typeof approved==='string'&&approved.trim())return [approved.trim().slice(0,500)];
    if(analysis.resultado?.status!=='Recusada')return ['A proposta não atende aos critérios de crédito da Crediti. Fale com a equipe para esclarecimentos.'];
  }
  const result=analysis.resultado||{};
  const source=status==='Pendente'&&result.pendencias?.length?result.pendencias:result.motivos;
  const details=[...new Set((Array.isArray(source)?source:[]).map(customerReason))].slice(0,20);
  return details.length?details:[status==='Recusada'?'A proposta não atende aos critérios de crédito da Crediti. Fale com a equipe para esclarecimentos.':'A Crediti precisa concluir uma conferência interna. Aguarde o contato ou fale com a equipe.'];
}
// Repair only this proposal's existing projection. Never renew or recreate expired codes.
export async function syncStatus(id,{db,fb}){
  return db.runTransaction(async tx=>{
    const snap=await tx.get(db.collection('simulacoes').doc(id));
    if(!snap.exists)return false;
    const sim=snap.data(),key=sim.consultaStatusId;
    if(!key)return false;
    const ref=db.collection('consultasCDC').doc(key),projection=await tx.get(ref);
    if(!projection.exists||projection.data().expiraEm?.toMillis()<=Date.now())return false;
    const status=publicStatus(sim),motivos=publicDetails(sim);
    if(projection.data().status===status&&JSON.stringify(projection.data().motivos)===JSON.stringify(motivos))return false;
    tx.update(ref,{status,motivos,atualizadoEm:fb.firestore.FieldValue.serverTimestamp()});
    return true;
  });
}
export function statusRecord(sim,fb){
  return {status:publicStatus(sim),motivos:publicDetails(sim),atualizadoEm:fb.firestore.FieldValue.serverTimestamp(),expiraEm:fb.firestore.Timestamp.fromMillis(Date.now()+STATUS_DAYS*86400000)};
}
export async function issueCode(id,{db,fb}){
  const ref=db.collection('simulacoes').doc(id),code=newCode();
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);if(!snap.exists)throw Error('Proposta não encontrada.');
    const s=snap.data(),cpf=digits(s.dadosCliente?.cpf);
    if(cpf.length!==11)throw Error('Informe o CPF do cliente na proposta antes de gerar o código.');
    const key=await statusKey(cpf,code);
    const intake=s.linkPreanalise?await tx.get(db.collection('preanalisesCDC').doc(s.linkPreanalise)):null;
    if(s.consultaStatusId)tx.delete(db.collection('consultasCDC').doc(s.consultaStatusId));
    tx.set(db.collection('consultasCDC').doc(key),statusRecord(s,fb));
    tx.update(ref,{consultaStatusId:key});
    if(intake?.exists)tx.update(intake.ref,{codigoConsulta:code});
  });
  return displayCode(code);
}
let sessionCode='';
function remember(code){sessionCode=displayCode(code);try{sessionStorage.setItem('cdcConsultaCodigo',sessionCode);}catch{}}
function recalled(){try{return sessionCode||sessionStorage.getItem('cdcConsultaCodigo')||'';}catch{return sessionCode;}}
export function appendCopy(container,value,label='Copiar código de consulta'){
  const input=document.createElement('input');input.type='text';input.readOnly=true;input.value=value;input.setAttribute('aria-label','Código de consulta');input.style.fontSize='16px';
  const button=document.createElement('button');button.type='button';button.className='btn btn-outline';button.textContent=label;
  const feedback=document.createElement('p');feedback.className='hint';feedback.setAttribute('role','status');
  button.onclick=async()=>{try{await navigator.clipboard.writeText(value);feedback.textContent='Copiado. Guarde este código em um lugar seguro.';}catch{input.focus();input.select();feedback.textContent='Selecione e copie o código acima.';}};
  container.append(input,button,feedback);
}
export function showReceipt(root,code){
  if(code)remember(code);
  root.innerHTML='<section class="card"><h2>Ficha recebida pela Crediti</h2><p>Seus dados e documentos foram enviados para conferência. O envio não significa aprovação.</p><p data-notice></p><div data-code></div><p data-count role="status"></p><button class="btn btn-primary" data-consult>Consultar status da proposta</button></section>';
  root.querySelector('[data-notice]').textContent=RESPONSE_NOTICE;
  const box=root.querySelector('[data-code]');
  if(code){const p=document.createElement('p');p.textContent='Guarde seu código. Você vai precisar dele e do CPF para consultar o resultado.';box.append(p);appendCopy(box,displayCode(code));}
  else box.textContent='Peça à Crediti seu código de consulta. A ficha foi recebida normalmente.';
  const counter=root.querySelector('[data-count]'),deadline=Date.now()+15000;
  const go=()=>{location.hash='consulta';window.scrollTo(0,0);};
  root.querySelector('[data-consult]').onclick=go;
  const tick=()=>{if(!counter.isConnected)return;const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));counter.textContent='Voltando para a consulta em '+seconds+' segundos. O código continuará disponível na próxima tela.';if(!seconds){go();return;}setTimeout(tick,250);};tick();
}
export function mountStatus(root,{db}){
  root.innerHTML='<section class="card" style="max-width:640px;margin:24px auto"><p class="hint">CREDITI SOLUÇÕES FINANCEIRAS</p><h2>Consultar status da proposta</h2><p data-notice></p><form data-query><label for="consulta-cpf">CPF do cliente</label><input id="consulta-cpf" name="cpf" type="text" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" autocomplete="off" required><label for="consulta-code">Código de consulta</label><input id="consulta-code" name="codigo" type="text" maxlength="39" placeholder="Código recebido ao enviar a ficha" autocomplete="off" autocapitalize="characters" spellcheck="false" required style="font-size:16px"><button class="btn btn-primary" type="submit">Consultar status da proposta</button></form><div data-saved></div><div data-result role="status" aria-live="polite"></div><p class="hint">Perdeu o código? Peça um novo à Crediti. O código anterior será cancelado. Esta página não permite alterar a ficha.</p></section>';
  root.querySelector('[data-notice]').textContent=RESPONSE_NOTICE;
  const form=root.querySelector('[data-query]'),cpf=form.elements.cpf,code=form.elements.codigo,result=root.querySelector('[data-result]');
  cpf.oninput=()=>{cpf.value=digits(cpf.value).slice(0,11).replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3}\.\d{3})(\d)/,'$1.$2').replace(/(\.\d{3})(\d)/,'$1-$2');};
  const saved=recalled();if(saved){code.value=saved;const box=root.querySelector('[data-saved]');const p=document.createElement('p');p.textContent='Seu último código nesta sessão:';box.append(p);appendCopy(box,saved);}
  let busy=false,last=0;
  form.onsubmit=async e=>{
    e.preventDefault();if(busy)return;
    if(Date.now()-last<3000){result.textContent='Aguarde alguns segundos antes de consultar novamente.';return;}
    const c=digits(cpf.value),k=normalizeCode(code.value);
    if(c.length!==11||k.length!==32){result.textContent='Confira o CPF e o código completo recebido.';return;}
    busy=true;last=Date.now();const button=form.querySelector('button');button.disabled=true;result.textContent='Consultando…';
    try{const snap=await db.collection('consultasCDC').doc(await statusKey(c,k)).get({source:'server'});if(!snap.exists)throw Error('invalid');const data=snap.data();if(!['Em análise','Pendente','Pré-aprovada','Recusada','Contratada'].includes(data.status)||data.expiraEm.toMillis()<=Date.now())throw Error('invalid');
      result.innerHTML='';const heading=document.createElement('h3');heading.textContent=data.status;
      const p=document.createElement('p');p.textContent=({'Em análise':'Sua ficha está em conferência. Consulte novamente para acompanhar.','Pendente':'Há pendências na sua ficha. Veja abaixo o que precisa ser conferido e entre em contato com a Crediti para resolver.','Pré-aprovada':'Sua proposta está pré-aprovada. A aprovação final e os próximos passos dependem da confirmação da Crediti.','Recusada':'Sua proposta foi recusada. Veja o motivo abaixo.','Contratada':'Sua contratação foi registrada pela Crediti.'})[data.status];result.append(heading,p);
      if(['Pendente','Recusada'].includes(data.status)){
        const reasons=Array.isArray(data.motivos)?data.motivos.filter(v=>typeof v==='string'&&v.trim()).slice(0,20):[];
        const list=document.createElement('ul');list.style.paddingLeft='22px';
        for(const reason of reasons){const li=document.createElement('li');li.textContent=reason.slice(0,500);li.style.marginBottom='10px';list.append(li);}
        if(reasons.length)result.append(list);
        else{const missing=document.createElement('p');missing.textContent='O detalhamento desta avaliação ainda não foi publicado. Peça à Crediti para atualizar a ficha.';result.append(missing);}
      }
      if(data.atualizadoEm?.toDate){const updated=document.createElement('p');updated.className='hint';updated.textContent='Atualizado em '+data.atualizadoEm.toDate().toLocaleString('pt-BR',{timeZone:'America/Fortaleza'});result.append(updated);}
    }catch(error){result.textContent=error.code==='unavailable'?'Não foi possível consultar agora. Verifique sua conexão e tente novamente.':'Consulta não disponível. Confira CPF e código ou peça um novo código à Crediti.';}
    finally{busy=false;button.disabled=false;}
  };
}


