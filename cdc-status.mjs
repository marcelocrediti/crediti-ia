// Public projection contains no customer data, documents, amounts or internal reasons.
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
  return 'Em análise';
}
export function statusRecord(sim,fb){
  return {status:publicStatus(sim),atualizadoEm:fb.firestore.FieldValue.serverTimestamp(),expiraEm:fb.firestore.Timestamp.fromMillis(Date.now()+STATUS_DAYS*86400000)};
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
    try{const snap=await db.collection('consultasCDC').doc(await statusKey(c,k)).get({source:'server'});if(!snap.exists)throw Error('invalid');const data=snap.data();if(!['Em análise','Pré-aprovada','Recusada','Contratada'].includes(data.status)||data.expiraEm.toMillis()<=Date.now())throw Error('invalid');
      result.innerHTML='';const heading=document.createElement('h3');heading.textContent=data.status;const p=document.createElement('p');p.textContent=({'Em análise':'Sua ficha está em conferência. Consulte novamente para acompanhar.','Pré-aprovada':'Sua proposta foi pré-aprovada pela Crediti. Entre em contato para continuar a contratação.','Recusada':'Sua proposta não foi aprovada. Entre em contato com a Crediti para esclarecimentos.','Contratada':'Sua contratação foi registrada pela Crediti.'})[data.status];result.append(heading,p);
    }catch(error){result.textContent=error.code==='unavailable'?'Não foi possível consultar agora. Verifique sua conexão e tente novamente.':'Consulta não disponível. Confira CPF e código ou peça um novo código à Crediti.';}
    finally{busy=false;button.disabled=false;}
  };
}
