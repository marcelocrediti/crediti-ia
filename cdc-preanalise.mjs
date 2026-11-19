// Remote intake is separate from contracts. Public input never approves credit.
import {newCode,statusKey,statusRecord,showReceipt} from './cdc-status.mjs?v=1';
export const TTL_MS=30*60*1000;
export const GROUPS=[['rgFrente','Identidade: RG, CIN ou CNH, frente e verso'],['cpfFrente','CPF, se não constar na identidade'],['comprovanteResidencia','Comprovante de residência recente'],['comprovanteRenda','Renda: 3 contracheques, benefício atual ou extratos de 3 meses']];
export const WARNING='A nova parcela pode usar até 15% do que sobra da renda após os gastos e as parcelas atuais. Depois da nova parcela, devem restar pelo menos R$ 600,00 por mês. Empréstimo mínimo: R$ 300,00. Sujeito à análise.';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=(v,max=160)=>String(v??'').replace(/[<>"'`&]/g,'').trim().slice(0,max);
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const digits=v=>String(v||'').replace(/\D/g,'');

export function formatCpf(value){
  return digits(value).slice(0,11).replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3}\.\d{3})(\d)/,'$1.$2').replace(/(\.\d{3})(\d)/,'$1-$2');
}
export function formatPhone(value){
  let n=digits(value);
  if((n.length===12||n.length===13)&&n.startsWith('55'))n=n.slice(2);
  n=n.slice(0,11);
  if(!n)return '';
  if(n.length<=2)return '('+n;
  const local=n.slice(2),split=local.length>8?5:4;
  return '('+n.slice(0,2)+') '+local.slice(0,split)+(local.length>split?'-'+local.slice(split):'');
}
function bindNumberMask(input,format){
  const apply=()=>{
    const old=input.value,pos=input.selectionStart??old.length;
    const count=digits(old.slice(0,pos)).length;
    input.value=format(old);
    if(pos===old.length){input.setSelectionRange(input.value.length,input.value.length);return;}
    let caret=0,seen=0;
    while(caret<input.value.length&&seen<count){if(/\d/.test(input.value[caret]))seen++;caret++;}
    input.setSelectionRange(caret,caret);
  };
  input.addEventListener('input',apply);
  input.addEventListener('blur',()=>{input.value=format(input.value);});
  input.value=format(input.value);
}

export function validCpf(value){const c=digits(value);if(!/^\d{11}$/.test(c)||/^(\d)\1{10}$/.test(c))return false;for(let n=9;n<11;n++){let sum=0;for(let i=0;i<n;i++)sum+=Number(c[i])*(n+1-i);if(Number(c[n])!==((sum*10)%11)%10)return false;}return true;}
export function amount(v){const s=String(v).trim();return s?Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):/^\d{1,3}(\.\d{3})+$/.test(s)?s.replace(/\./g,''):s):NaN;}
export const digest=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export function publicProposal(s){return Object.fromEntries(['cliente','valor','prazo','parcela','taxa','cet','cetAnual','dataPrimeira','dataUltima'].filter(k=>s[k]!==undefined).map(k=>[k,s[k]]));}
export function validateResidence(q){if(!['proprio','terceiro'].includes(q.residenciaTitular))throw Error('Informe em nome de quem está o comprovante de endereço.');if(q.residenciaTitular==='terceiro'&&!String(q.residenciaJustificativa||'').trim())throw Error('Justifique o comprovante de endereço em nome de terceiro.');}
export function validateQuestionnaire(q){for(const k of ['renda','despesas','outrasParcelas'])if(!Number.isFinite(q[k])||q[k]<0||q[k]>10000000)throw Error('Informe renda, despesas e parcelas com valores válidos.');if(q.renda<=0)throw Error('Informe a renda líquida mensal.');if(!['sim','nao','nao_sei'].includes(q.restricao))throw Error('Informe se há restrições.');}
export async function createLink(s,ctx){
  const {db,fb}=ctx,cpf=digits(s.dadosCliente?.cpf);
  if(!validCpf(cpf))throw Error('Informe um CPF válido antes de gerar o link.');
  if(s.aceite||s.analiseCdc?.decisao)throw Error('Esta ficha já tem uma decisão ou contrato. Crie uma nova simulação.');
  const existing=await db.collection('simulacoes').doc(s.id).collection('documentos').limit(1).get();
  if(!existing.empty)throw Error('Esta ficha já recebeu documentos. Continue a análise pelo painel.');
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const cpfHash=await digest(token+cpf),ref=db.collection('preanalisesCDC').doc(token);
  const codigoConsulta=newCode(),consultaStatusId=await statusKey(cpf,codigoConsulta);
  await db.runTransaction(async tx=>{
    const current=await tx.get(db.collection('simulacoes').doc(s.id));if(!current.exists)throw Error('Salve a simulação antes de gerar o link.');
    const d=current.data();if(d.aceite||d.analiseCdc?.decisao||d.preanaliseRecebida)throw Error('Esta ficha já foi concluída ou recebida.');
    if(JSON.stringify(publicProposal(d))!==JSON.stringify(publicProposal(s)))throw Error('A simulação mudou. Calcule novamente.');
    if(d.linkPreanalise){const old=await tx.get(db.collection('preanalisesCDC').doc(d.linkPreanalise));if(old.data()?.estado==='enviado')throw Error('O cliente já enviou a ficha. Abra o painel para receber os documentos.');}
    tx.set(ref,{simId:s.id,proposta:publicProposal(s),cpfHash,codigoConsulta,criadoEm:fb.firestore.FieldValue.serverTimestamp(),estado:'aberto'});
    if(d.consultaStatusId)tx.delete(db.collection('consultasCDC').doc(d.consultaStatusId));
    tx.set(db.collection('consultasCDC').doc(consultaStatusId),statusRecord(s,fb));
    if(d.linkPreanalise)tx.update(db.collection('preanalisesCDC').doc(d.linkPreanalise),{estado:'revogado'});
    tx.update(db.collection('simulacoes').doc(s.id),{linkPreanalise:token,status:'preanalise_aguardando',consultaStatusId});
  });
  const record=(await ref.get({source:'server'})).data();
  return {token,expires:record.criadoEm.toMillis()+TTL_MS};
}
export async function receiveSubmission(s,{db}){
  if(!s.linkPreanalise||s.preanaliseRecebida===s.linkPreanalise||s.aceite)return s;
  const ref=db.collection('preanalisesCDC').doc(s.linkPreanalise),link=(await ref.get({source:'server'})).data();
  if(!link||link.estado!=='enviado')return s;
  const r=link.resposta;
  if(!r||await digest(s.linkPreanalise+digits(r.cpf))!==link.cpfHash||digits(r.cpf)!==digits(s.dadosCliente?.cpf))throw Error('CPF do envio não corresponde à ficha.');
  validateQuestionnaire(r);
  if(!Array.isArray(r.arquivos)||r.arquivos.length>20||r.arquivos.some(k=>!/^(rgFrente|cpfFrente|comprovanteResidencia|comprovanteRenda)(__[2-5])?$/.test(k)))throw Error('Lista de anexos inválida.');
  for(const key of r.arquivos){
    const file=(await ref.collection('documentos').doc(key).get()).data();
    if(!file||typeof file.dataUrl!=='string'||file.dataUrl.length>950000)throw Error('Anexo ausente ou inválido.');
    const target=db.collection('simulacoes').doc(s.id).collection('documentos').doc(key);
    // Idempotent copies: never replace an existing administrative document.
    await db.runTransaction(async tx=>{const old=await tx.get(target);if(old.exists&&old.data().origemPreanalise!==s.linkPreanalise)throw Error('Há um documento interno no mesmo espaço. Confira a ficha.');if(!old.exists)tx.set(target,{nome:clean(file.nome),tipo:file.tipo,dataUrl:file.dataUrl,categoria:key.split('__')[0],origemPreanalise:s.linkPreanalise});});
  }
  const simRef=db.collection('simulacoes').doc(s.id);
  await db.runTransaction(async tx=>{
    const snap=await tx.get(simRef),now=snap.data();if(now.preanaliseRecebida===s.linkPreanalise)return;
    if(now.linkPreanalise!==s.linkPreanalise||now.aceite||now.analiseCdc?.decisao)throw Error('A ficha mudou durante o recebimento. Confira antes de continuar.');
    const questionario={renda:r.renda,despesas:r.despesas,outrasParcelas:r.outrasParcelas,restricao:r.restricao,cpfNaIdentidade:!!r.cpfNaIdentidade,documentosConferidos:false,residenciaTitular:clean(r.residenciaTitular,20),residenciaJustificativa:clean(r.residenciaJustificativa,600)};
    tx.update(simRef,{preanaliseRecebida:s.linkPreanalise,status:'preanalise_recebida',dadosCliente:{...(now.dadosCliente||{}),telefone:digits(r.telefone).slice(0,13),email:clean(r.email),endereco:clean(r.endereco,300),profissao:clean(r.profissao),renda:String(r.renda)},documentosEnviados:[...new Set([...(now.documentosEnviados||[]),...r.arquivos])],analiseCdc:{questionario,observacoes:'Ficha e documentos enviados pelo cliente. Aguardando leitura dos anexos, consulta ao histórico interno e confirmação do administrador.',atualizadoEm:Date.now()}});
  });
  return (await simRef.get()).data();
}
export async function mountCustomer(root,token,{db,fb,logo}){
  const closed=()=>{root.innerHTML='<section class="card"><h2>Link encerrado</h2><p>Este link expirou, já foi utilizado ou foi cancelado. Peça um novo link à Crediti.</p></section>';};
  if(!/^[a-f0-9]{64}$/.test(token)){closed();return;}
  root.innerHTML='<section class="card"><p>Verificando seu link…</p></section>';
  const ref=db.collection('preanalisesCDC').doc(token);let record;
  try{record=(await ref.get({source:'server'})).data();}catch{closed();return;}
  if(!record||record.estado!=='aberto'){closed();return;}
  const expires=record.criadoEm.toMillis()+TTL_MS,s=record.proposta;
  if(Date.now()>=expires){closed();return;}
  root.innerHTML=`<header class="top"><img src="${esc(logo)}" alt="Crediti"><div><div class="brand-name">Olá, ${esc(s.cliente)}!</div><div class="brand-sub">Sua pré-análise de crédito pessoal</div></div></header><section class="card"><p data-clock role="status"></p><h2>Sua simulação</h2>${[['Valor do crédito',money(s.valor)],['Parcelas',s.prazo+'x de '+money(s.parcela)],['Taxa mensal',Number(s.taxa).toLocaleString('pt-BR')+'%'],['Primeiro vencimento',String(s.dataPrimeira).split('-').reverse().join('/')],['Último vencimento',String(s.dataUltima).split('-').reverse().join('/')],['Total a pagar',money(Math.round(s.parcela*s.prazo*100)/100)]].map(([k,v])=>`<div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}<p class="hint">Simulação sujeita à conferência e aprovação. Este formulário não é um contrato.</p></section><section class="card"><h2>Checklist dos documentos</h2><ul>${GROUPS.map(([,label])=>`<li>${esc(label)}</li>`).join('')}</ul><p class="hint">Até 5 anexos por categoria. PDF, JPG ou JPEG, até 700 KB cada. Use arquivos completos e legíveis.</p><p class="result-box"><strong>Limite da parcela</strong><br>${WARNING}</p><p>A chave Pix será solicitada somente após a aprovação.</p></section><section class="card"><h2>Complete sua ficha</h2><form data-form><label>Confirme seu CPF</label><input name="cpf" type="text" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" required autocomplete="off"><label>Telefone com DDD</label><input name="telefone" type="tel" inputmode="tel" maxlength="20" placeholder="(85) 99999-9999" required><label>E-mail (opcional)</label><input name="email" type="email" maxlength="160"><label>Endereço completo</label><input name="endereco" type="text" maxlength="300" required><label for="residenciaTitular">O comprovante de endereço está no seu nome ou no nome de terceiro?</label><select id="residenciaTitular" name="residenciaTitular" required><option value="">Selecione</option><option value="proprio">No meu nome</option><option value="terceiro">No nome de terceiro</option></select><div data-residencia-box hidden><label for="residenciaJustificativa">Justifique aqui</label><textarea id="residenciaJustificativa" name="residenciaJustificativa" maxlength="600" placeholder="Explique quem é o titular do comprovante e sua relação com o endereço informado."></textarea></div><label>Profissão ou ocupação</label><input name="profissao" type="text" maxlength="160" required>${[['renda','Renda líquida mensal (R$)'],['despesas','Soma dos gastos com mercado, energia, água, internet, remédios, aluguéis (R$)'],['outrasParcelas','Soma dos empréstimos e financiamentos em andamento (R$)']].map(([k,l])=>`<label>${l}</label><input name="${k}" type="text" inputmode="decimal" placeholder="0,00" required maxlength="20">`).join('')}<p class="hint" data-income></p><label>Tem restrições no nome?</label><select name="restricao" required><option value="">Selecione</option><option value="nao">Não</option><option value="sim">Sim</option></select><p class="hint">Resposta declarada por você. Não é uma consulta ao Serasa ou SPC.</p><label style="display:flex;gap:10px"><input name="cpfNaIdentidade" type="checkbox" style="width:22px;flex:0 0 22px">Meu CPF consta na identidade</label><h2>Anexe seus documentos</h2>${GROUPS.map(([k,l])=>`<label>${esc(l)}</label><input type="file" data-files="${k}" multiple accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg" style="width:100%;max-width:100%;font-size:14px"><p data-file-label="${k}" class="hint"></p>`).join('')}<label style="display:flex;gap:10px"><input name="consentimento" type="checkbox" required style="width:22px;flex:0 0 22px"><span>Confirmo que os dados são meus e autorizo seu envio à Crediti para esta solicitação de crédito. Não envie documentos de saúde ou informações sem relação com o pedido.</span></label><button class="btn btn-gold" type="submit">Enviar para pré-análise</button><p data-message role="status"></p></form></section>`;
  const form=root.querySelector('[data-form]'),msg=root.querySelector('[data-message]');let busy=false,done=false;
  const fields=name=>form.elements.namedItem(name);
  fields('residenciaTitular').onchange=()=>{const third=fields('residenciaTitular').value==='terceiro';root.querySelector('[data-residencia-box]').hidden=!third;fields('residenciaJustificativa').required=third;};
  bindNumberMask(fields('cpf'),formatCpf);
  bindNumberMask(fields('telefone'),formatPhone);
  const clock=root.querySelector('[data-clock]');
  const tick=()=>{if(!clock.isConnected||done)return;const left=Math.max(0,Math.ceil((expires-Date.now())/1000));clock.textContent='Tempo restante: '+String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');if(!left){done=true;closed();return;}setTimeout(tick,1000);};tick();
  const income=()=>{const r=amount(fields('renda').value),d=amount(fields('outrasParcelas').value),g=amount(fields('despesas').value),sobra=r-g-d;root.querySelector('[data-income]').textContent=r>0&&Number.isFinite(d)&&Number.isFinite(g)?'Após gastos e parcelas atuais, sobram '+money(sobra)+'. Limite para a nova parcela: '+money(Math.max(0,Math.min(Math.floor(sobra*100*0.15)/100,sobra-600)))+'. Após a parcela solicitada, restariam '+money(sobra-s.parcela)+'. É necessário manter R$ 600,00 por mês. Empréstimo mínimo: R$ 300,00.':'';};
  for(const k of ['renda','despesas','outrasParcelas']){fields(k).oninput=income;fields(k).onblur=()=>{const n=amount(fields(k).value);if(Number.isFinite(n))fields(k).value=n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});income();};}
  for(const [k] of GROUPS)root.querySelector('[data-files="'+k+'"]').onchange=e=>{const files=Array.from(e.target.files);root.querySelector('[data-file-label="'+k+'"]').textContent=files.length+'/5: '+files.map(f=>f.name).join('; ');};
  form.onsubmit=async e=>{e.preventDefault();if(busy||done)return;busy=true;const submit=form.querySelector('button');submit.disabled=true;msg.textContent='Conferindo e enviando seus documentos…';
    try{
      if(Date.now()>=expires)throw Error('O link expirou. Peça um novo link à Crediti.');
      const cpf=digits(fields('cpf').value);if(!validCpf(cpf)||await digest(token+cpf)!==record.cpfHash)throw Error('O CPF não corresponde ao cliente desta simulação. Confira os números.');
      const q={cpf,telefone:digits(fields('telefone').value),email:clean(fields('email').value),endereco:clean(fields('endereco').value,300),profissao:clean(fields('profissao').value),residenciaTitular:fields('residenciaTitular').value,residenciaJustificativa:fields('residenciaTitular').value==='terceiro'?clean(fields('residenciaJustificativa').value,600):'',renda:amount(fields('renda').value),despesas:amount(fields('despesas').value),outrasParcelas:amount(fields('outrasParcelas').value),restricao:fields('restricao').value,cpfNaIdentidade:fields('cpfNaIdentidade').checked,consentimento:fields('consentimento').checked,arquivos:[]};
      validateResidence(q);validateQuestionnaire(q);if(q.telefone.length<10||q.telefone.length>13||!q.endereco||!q.profissao||!q.consentimento)throw Error('Complete os dados obrigatórios e confirme o envio.');
      const uploads=[];
      for(const [key,label] of GROUPS){const files=Array.from(root.querySelector('[data-files="'+key+'"]').files||[]);if(!files.length&&(key!=='cpfFrente'||!q.cpfNaIdentidade))throw Error('Anexe: '+label);if(files.length>5)throw Error('O máximo é 5 arquivos por categoria.');for(let i=0;i<files.length;i++){const file=files[i];if(file.size>700000||!['application/pdf','image/jpeg'].includes(file.type))throw Error('Use somente PDF ou JPEG de até 700 KB por arquivo.');const bytes=new Uint8Array(await file.slice(0,5).arrayBuffer());if(file.type==='application/pdf'?String.fromCharCode(...bytes)!=='%PDF-':bytes[0]!==255||bytes[1]!==216)throw Error('Arquivo inválido: '+file.name);const dataUrl=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(Error('Falha ao ler arquivo.'));fr.readAsDataURL(file);});const slot=key+(i?'__'+(i+1):'');q.arquivos.push(slot);uploads.push([slot,{nome:clean(file.name),tipo:file.type,dataUrl}]);}}
      // Each upload is bounded. Final state transition is atomic and closes access.
      for(const [slot,file] of uploads){if(Date.now()>=expires)throw Error('O link expirou durante o envio. Peça um novo link.');await ref.collection('documentos').doc(slot).set(file);}
      const currentIntake=await ref.get({source:'server'});
      const currentCode=currentIntake.exists?currentIntake.data().codigoConsulta:record.codigoConsulta;
      await ref.update({estado:'enviado',resposta:q,enviadoEm:fb.firestore.FieldValue.serverTimestamp()});done=true;
      showReceipt(root,currentCode);
    }catch(error){msg.textContent=error.code==='permission-denied'?'Link expirado ou já utilizado. Peça um novo link à Crediti.':error.message;}finally{busy=false;submit.disabled=false;}
  };
}


