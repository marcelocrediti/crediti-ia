const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
const REST=`${BASE}/rest/v1`;
const AUTH=`${BASE}/auth/v1`;
const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
const TOKEN_KEY='crediti_creator_admin_token';
const REFRESH_KEY='crediti_creator_admin_refresh_token';
let accessToken=localStorage.getItem(TOKEN_KEY)||'';
let refreshToken=localStorage.getItem(REFRESH_KEY)||'';
let refreshPromise=null;
let profiles=[],campaigns=[],submissions=[],payments=[];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate=v=>v?new Date(v).toLocaleString('pt-BR'):'-';
const statusLabel=s=>({em_analise:'Em análise',ativo:'Ativo',nao_elegivel:'Não elegível',perfil_privado:'Perfil privado',cancelado_creator:'Cancelado pelo Creator',desativado_crediti:'Desativado pela Crediti',rascunho:'Rascunho',ativa:'Ativa',encerrada:'Encerrada',pendente:'Pendente',enviado:'Enviado',nao_enviado:'Não enviado',em_analise_video:'Em análise',vencedor:'Vencedor',nao_selecionado:'Não selecionado',publicado:'Publicado',pago:'Pago'}[s]||s||'-');
const authHeaders=(extra={})=>({apikey:KEY,Authorization:`Bearer ${accessToken}`,...extra});

function persistSession(data={}){
  if(data.access_token){accessToken=data.access_token;localStorage.setItem(TOKEN_KEY,accessToken)}
  if(data.refresh_token){refreshToken=data.refresh_token;localStorage.setItem(REFRESH_KEY,refreshToken)}
}
function clearSession(){accessToken='';refreshToken='';localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(REFRESH_KEY)}
async function refreshSession(){
  if(refreshPromise)return refreshPromise;
  if(!refreshToken)throw new Error('Sua sessão expirou. Entre novamente.');
  refreshPromise=(async()=>{
    const r=await fetch(`${AUTH}/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refreshToken})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.access_token){clearSession();throw new Error('Sua sessão expirou. Entre novamente.')}
    persistSession(d);
    return d.access_token;
  })().finally(()=>{refreshPromise=null});
  return refreshPromise;
}
async function requestWithSession(url,opts={}){
  const make=()=>fetch(url,{...opts,headers:{...(opts.headers||{}),apikey:KEY,Authorization:`Bearer ${accessToken}`}});
  let r=await make();
  if(r.status===401&&refreshToken){await refreshSession();r=await make()}
  return r;
}
async function rest(path,opts={}){
  const r=await requestWithSession(`${REST}/${path}`,{...opts,headers:{'Content-Type':'application/json',Prefer:'return=representation',...(opts.headers||{})}});
  const text=await r.text();
  if(!r.ok){if(r.status===401)clearSession();throw new Error(text||'Erro ao acessar os dados.')}
  return text?JSON.parse(text):null;
}
async function rpc(name,body={}){
  const r=await requestWithSession(`${REST}/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const text=await r.text();
  if(!r.ok){if(r.status===401)clearSession();throw new Error(text||'Erro na operação.')}
  return text?JSON.parse(text):null;
}
window.creatorAdminRest=rest;
window.creatorAdminRequest=requestWithSession;

function setBusy(button,busy,label='PROCESSANDO...'){
  if(!button)return;
  if(busy){button.dataset.originalText=button.textContent;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent=label}
  else{button.disabled=false;button.removeAttribute('aria-busy');if(button.dataset.originalText){button.textContent=button.dataset.originalText;delete button.dataset.originalText}}
}

async function login(){
  const email=$('email').value.trim(),password=$('password').value,btn=$('loginBtn');
  if(!email||!password){$('loginMsg').textContent='Informe e-mail e senha.';return}
  setBusy(btn,true,'ENTRANDO...');
  try{
    const r=await fetch(`${AUTH}/token?grant_type=password`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const d=await r.json();
    if(!r.ok||!d.access_token)throw new Error('E-mail ou senha incorretos.');
    persistSession(d);
    const isAdmin=await rpc('creator_ads_is_admin');
    if(isAdmin!==true)throw new Error('Este usuário não possui acesso administrativo ao Creator Ads.');
    showApp();await loadAll();
  }catch(e){clearSession();$('loginMsg').textContent=e.message}
  finally{setBusy(btn,false)}
}
function logout(){clearSession();location.reload()}
function showApp(){$('loginView').classList.add('hidden');$('appView').classList.remove('hidden')}

async function loadAll(){try{[profiles,campaigns,submissions,payments]=await Promise.all([rest('creator_ads_profiles?select=*&order=created_at.desc'),rest('creator_ads_campaigns?select=*&order=created_at.desc'),rest('creator_ads_submissions?select=*&order=created_at.desc'),rest('creator_ads_payments?select=*&order=created_at.desc')]);renderAll()}catch(e){alert(e.message);if(!accessToken)$('appView')?.classList.add('hidden')&&$('loginView')?.classList.remove('hidden')}}
function renderAll(){renderProfiles();renderCampaigns();renderSubmissions();renderPayments()}
function renderProfiles(){const f=$('profileFilter').value;const list=profiles.filter(p=>!f||p.status===f);$('profilesList').innerHTML=list.length?list.map(p=>`<article class="item-card"><span class="status ${esc(p.status)}">${esc(statusLabel(p.status))}</span><h3>${esc(p.nome)}</h3><div class="meta"><span>${esc(p.plataforma)} · ${esc(p.perfil)}</span><span>WhatsApp: ${esc(p.whatsapp)}</span><span>Seguidores verificados: ${p.seguidores_verificados??'-'}</span><span>Cadastro: ${esc(fmtDate(p.created_at))}</span></div><div class="card-actions"><button type="button" data-profile="${p.id}" data-action="detail">Ver ficha</button>${p.status!=='ativo'?`<button type="button" class="accent" data-profile="${p.id}" data-action="approve">Ativar</button>`:''}<button type="button" data-profile="${p.id}" data-action="reject">Não elegível</button><button type="button" class="danger" data-profile="${p.id}" data-action="disable">Desativar Creator</button></div></article>`).join(''):'<div class="empty">Nenhum cadastro encontrado.</div>'}
function renderCampaigns(){$('campaignsList').innerHTML=campaigns.length?campaigns.map(c=>`<article class="item-card"><span class="status ${esc(c.status)}">${esc(statusLabel(c.status))}</span><h3>${esc(c.titulo)}</h3><div class="meta"><span>Prêmio por vencedor: ${money(c.premio)}</span><span>${c.numero_vencedores} vencedor(es)</span><span>${esc(fmtDate(c.inicio))} até ${esc(fmtDate(c.fim))}</span>${c.bonus_ativo?`<span>Bônus: ${money(c.bonus_valor)} ao atingir ${Number(c.bonus_meta_views||0).toLocaleString('pt-BR')} visualizações</span>`:''}</div><div class="card-actions"><button type="button" data-campaign="${c.id}" data-action="edit">Editar</button>${c.status!=='ativa'?`<button type="button" class="accent" data-campaign="${c.id}" data-action="activate">Ativar</button>`:''}${c.status!=='encerrada'?`<button type="button" class="danger" data-campaign="${c.id}" data-action="close">Encerrar</button>`:''}</div></article>`).join(''):'<div class="empty">Nenhuma campanha criada.</div>'}
function renderSubmissions(){const pm=Object.fromEntries(profiles.map(p=>[p.id,p]));const cm=Object.fromEntries(campaigns.map(c=>[c.id,c]));$('submissionsList').innerHTML=submissions.length?submissions.map(s=>{const p=pm[s.profile_id]||{},c=cm[s.campaign_id]||{};const res=s.video_largura&&s.video_altura?`${s.video_largura}×${s.video_altura}`:'-';const size=s.video_tamanho?`${(s.video_tamanho/1024/1024).toFixed(1)} MB`:'-';return `<article class="item-card"><span class="status ${esc(s.status)}">${esc(statusLabel(s.status))}</span><h3>${esc(p.nome||'Creator')}</h3><div class="meta"><span>Campanha: ${esc(c.titulo||'-')}</span><span>Arquivo: ${esc(s.video_nome||'-')}</span><span>Resolução: ${esc(res)} · Tamanho: ${esc(size)}</span><span>Formato: ${esc(s.video_mime||'-')}</span>${s.erro_upload?`<span>Falha: ${esc(s.erro_upload)}</span>`:''}</div><div class="card-actions">${['enviado','em_analise','vencedor','publicado'].includes(s.status)?`<button type="button" data-submission="${s.id}" data-action="open">Abrir original</button><button type="button" data-submission="${s.id}" data-action="download">Baixar original</button>`:''}${s.status==='enviado'?`<button type="button" data-submission="${s.id}" data-action="review">Em análise</button>`:''}${s.status!=='vencedor'&&s.status!=='nao_enviado'&&s.status!=='pendente'?`<button type="button" class="accent" data-submission="${s.id}" data-action="winner">Marcar vencedor</button>`:''}</div></article>`}).join(''):'<div class="empty">Nenhum vídeo enviado.</div>'}
function renderPayments(){const pm=Object.fromEntries(profiles.map(p=>[p.id,p]));const cm=Object.fromEntries(campaigns.map(c=>[c.id,c]));$('paymentsList').innerHTML=payments.length?payments.map(x=>{const p=pm[x.profile_id]||{},c=cm[x.campaign_id]||{};return `<article class="item-card"><span class="status ${esc(x.status)}">${esc(statusLabel(x.status))}</span><h3>${esc(p.nome||'Creator')}</h3><div class="meta"><span>Campanha: ${esc(c.titulo||'-')}</span><span>Prêmio: ${money(x.premio)} · Bônus: ${money(x.bonus)}</span><span>Total: <b>${money(x.total)}</b></span><span>Pix: ${esc(p.pix_chave||'-')}</span><span>Banco/instituição: ${esc(p.banco_instituicao||'-')}</span></div><div class="card-actions">${x.status!=='pago'?`<button type="button" class="accent" data-payment="${x.id}" data-action="paid">Marcar como pago</button>`:`<span>Pago em ${esc(fmtDate(x.pago_em))}</span>`}</div></article>`}).join(''):'<div class="empty">Nenhum pagamento registrado.</div>'}

async function audit(entidade,id,acao,detalhes={}){try{await rest('creator_ads_audit',{method:'POST',body:JSON.stringify({entidade,entidade_id:id,acao,detalhes,admin_user:null})})}catch{}}
async function updateProfile(id,status){const patch={status};if(status==='ativo'){const seguidores=prompt('Quantos seguidores foram verificados?','2000');if(seguidores===null)return;const n=Number(seguidores);if(!Number.isFinite(n)||n<2000){alert('Para ativar, informe pelo menos 2.000 seguidores verificados.');return}patch.seguidores_verificados=n;patch.perfil_publico_verificado=true;patch.cancelado_em=null;patch.motivo_desativacao=null}if(status==='desativado_crediti'){const motivo=prompt('Motivo da desativação:','Desativado pela Crediti');if(motivo===null)return;patch.cancelado_em=new Date().toISOString();patch.motivo_desativacao=motivo||'Desativado pela Crediti'}await rest(`creator_ads_profiles?id=eq.${id}`,{method:'PATCH',body:JSON.stringify(patch)});await audit('profile',id,`status_${status}`,patch);await loadAll()}
function showProfile(id){const p=profiles.find(x=>x.id===id);if(!p)return;$('profileDetail').innerHTML=`<p class="eyebrow">FICHA DO CREATOR</p><h2>${esc(p.nome)}</h2><div class="meta"><span>WhatsApp: ${esc(p.whatsapp)}</span><span>${esc(p.plataforma)}: ${esc(p.perfil)}</span><span>Pix: ${esc(p.pix_chave)}</span><span>Tipo Pix: ${esc(p.pix_tipo)}</span><span>Banco/instituição: ${esc(p.banco_instituicao)}</span><span>Status: ${esc(statusLabel(p.status))}</span></div><h3>Termo aceito</h3><div class="term-box">Participante: ${esc(p.nome)}\nPlataforma: ${esc(p.plataforma)}\nPerfil: ${esc(p.perfil)}\nVersão: ${esc(p.termo_versao)}\nAceite: ${esc(fmtDate(p.termo_aceito_em))}\n\n${esc(p.termo_texto||'')}</div>`;$('profileDialog').showModal()}
function parseMoney(v){let s=String(v||'').replace(/R\$/gi,'').replace(/\s/g,'');if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0}
function toInput(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
function openCampaign(c=null){const f=$('campaignForm');f.reset();f.elements.id.value=c?.id||'';f.titulo.value=c?.titulo||'';f.descricao.value=c?.descricao||'';f.briefing.value=c?.briefing||'';f.inicio.value=toInput(c?.inicio);f.fim.value=toInput(c?.fim);f.premio.value=c?money(c.premio):'';f.numero_vencedores.value=c?.numero_vencedores||1;f.bonus_ativo.checked=!!c?.bonus_ativo;f.bonus_valor.value=c?.bonus_valor?money(c.bonus_valor):'';f.bonus_meta_views.value=c?.bonus_meta_views||'';f.bonus_prazo.value=toInput(c?.bonus_prazo);$('bonusFields').classList.toggle('hidden',!f.bonus_ativo.checked);$('campaignFormTitle').textContent=c?'Editar campanha':'Nova campanha';$('campaignDialog').showModal()}
async function saveCampaign(status,button=null){
  if(button?.disabled)return;
  const f=$('campaignForm'),fd=new FormData(f);
  const inicio=new Date(fd.get('inicio')),fim=new Date(fd.get('fim'));
  const premio=parseMoney(fd.get('premio'));
  const winners=Number(fd.get('numero_vencedores')||1);
  if(!String(fd.get('titulo')||'').trim()||!String(fd.get('briefing')||'').trim()||Number.isNaN(inicio.getTime())||Number.isNaN(fim.getTime())||fim<=inicio){alert('Confira título, briefing e período da campanha.');return}
  if(!(premio>0)||!Number.isInteger(winners)||winners<1){alert('Informe um prêmio por vencedor maior que zero e uma quantidade válida de vencedores.');return}
  let bonusPrazo=null;
  if(f.bonus_ativo.checked&&fd.get('bonus_prazo')){const d=new Date(fd.get('bonus_prazo'));if(Number.isNaN(d.getTime())){alert('Confira o prazo do bônus.');return}bonusPrazo=d.toISOString()}
  const body={titulo:String(fd.get('titulo')||'').trim(),descricao:String(fd.get('descricao')||'').trim(),briefing:String(fd.get('briefing')||'').trim(),inicio:inicio.toISOString(),fim:fim.toISOString(),premio,numero_vencedores:winners,bonus_ativo:f.bonus_ativo.checked,bonus_valor:f.bonus_ativo.checked?parseMoney(fd.get('bonus_valor')):null,bonus_meta_views:f.bonus_ativo.checked?Number(fd.get('bonus_meta_views')||0):null,bonus_prazo:bonusPrazo,status};
  setBusy(button,true,'SALVANDO...');
  try{const id=f.elements.id.value;if(id)await rest(`creator_ads_campaigns?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(body)});else await rest('creator_ads_campaigns',{method:'POST',body:JSON.stringify(body)});$('campaignDialog').close();await loadAll()}
  catch(e){alert('Não foi possível salvar a campanha. '+(e.message||''));}
  finally{setBusy(button,false)}
}
async function patchCampaign(id,status){await rest(`creator_ads_campaigns?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status})});await audit('campaign',id,status);await loadAll()}
async function patchSubmission(id,status){const patch={status};if(status==='vencedor')patch.vencedor_em=new Date().toISOString();await rest(`creator_ads_submissions?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(patch)});if(status==='vencedor'){const s=submissions.find(x=>x.id===id),c=campaigns.find(x=>x.id===s?.campaign_id);if(s&&c)await rest('creator_ads_payments',{method:'POST',body:JSON.stringify({profile_id:s.profile_id,campaign_id:s.campaign_id,submission_id:s.id,premio:Number(c.premio||0),bonus:0,status:'pendente'}),headers:{Prefer:'resolution=ignore-duplicates,return=representation'}})}await audit('submission',id,status);await loadAll()}
async function signedVideo(id,download=false){const s=submissions.find(x=>x.id===id);if(!s?.video_path)return;const r=await requestWithSession(`${BASE}/storage/v1/object/sign/creator-ads-videos/${s.video_path.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600})});const d=await r.json();if(!r.ok)throw new Error('Não foi possível gerar acesso ao vídeo.');const url=`${BASE}/storage/v1${d.signedURL}${download?'&download=1':''}`;window.open(url,'_blank','noopener')}
async function markPaid(id){if(!confirm('Confirmar que este pagamento foi realizado?'))return;await rest(`creator_ads_payments?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status:'pago',pago_em:new Date().toISOString()})});await audit('payment',id,'pago');await loadAll()}

$('loginBtn').addEventListener('click',login);$('logoutBtn').addEventListener('click',logout);$('refreshBtn').addEventListener('click',loadAll);$('profileFilter').addEventListener('change',renderProfiles);$('newCampaignBtn').addEventListener('click',()=>openCampaign());$('campaignForm').bonus_ativo.addEventListener('change',e=>$('bonusFields').classList.toggle('hidden',!e.target.checked));$('saveDraftBtn').addEventListener('click',e=>saveCampaign('rascunho',e.currentTarget));$('campaignForm').addEventListener('submit',e=>{e.preventDefault();saveCampaign('ativa',e.submitter)});
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===b.dataset.tab));window.scrollTo({top:0,behavior:'auto'})}));document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
document.addEventListener('click',async e=>{const t=e.target.closest('button[data-action]');if(!t||t.disabled)return;try{setBusy(t,true);if(t.dataset.profile){if(t.dataset.action==='detail'){setBusy(t,false);showProfile(t.dataset.profile);return}if(t.dataset.action==='approve')await updateProfile(t.dataset.profile,'ativo');if(t.dataset.action==='reject')await updateProfile(t.dataset.profile,'nao_elegivel');if(t.dataset.action==='disable')await updateProfile(t.dataset.profile,'desativado_crediti')}if(t.dataset.campaign){const c=campaigns.find(x=>x.id===t.dataset.campaign);if(t.dataset.action==='edit'){setBusy(t,false);openCampaign(c);return}if(t.dataset.action==='activate')await patchCampaign(t.dataset.campaign,'ativa');if(t.dataset.action==='close'&&confirm('Encerrar esta campanha?'))await patchCampaign(t.dataset.campaign,'encerrada')}if(t.dataset.submission){if(t.dataset.action==='open')await signedVideo(t.dataset.submission,false);if(t.dataset.action==='download')await signedVideo(t.dataset.submission,true);if(t.dataset.action==='review')await patchSubmission(t.dataset.submission,'em_analise');if(t.dataset.action==='winner'&&confirm('Marcar este vídeo como vencedor?'))await patchSubmission(t.dataset.submission,'vencedor')}if(t.dataset.payment&&t.dataset.action==='paid')await markPaid(t.dataset.payment)}catch(err){alert(err.message||'Não foi possível concluir.')}finally{if(document.body.contains(t))setBusy(t,false)}});

(async()=>{if(!accessToken)return;try{const ok=await rpc('creator_ads_is_admin');if(ok===true){showApp();await loadAll()}else logout()}catch{if(refreshToken){try{await refreshSession();const ok=await rpc('creator_ads_is_admin');if(ok===true){showApp();await loadAll();return}}catch{}}logout()}})();
