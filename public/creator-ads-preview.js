(() => {
  const CARD_ID = 'crediti-creator-ads-card';
  const PAGE_ID = 'crediti-creator-ads-page';
  const STYLE_ID = 'crediti-creator-ads-v3-style';
  const TOKEN_KEY = 'crediti_creator_ads_public_token_v1';
  const BASE = 'https://vgdtywdpywezrwlrsawq.supabase.co';
  const REST = `${BASE}/rest/v1`;
  const STORAGE = `${BASE}/storage/v1/object`;
  const KEY = 'sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  const PHOTO = 'https://images.unsplash.com/photo-1776748665113-ca641e59508e?auto=format&fit=crop&fm=jpg&q=82&w=1200';

  const rules = [
    'Ter 18 anos ou mais.',
    'Informar nome completo e WhatsApp.',
    'Participar com perfil público no Instagram, TikTok ou Kwai.',
    'Ter no mínimo 2.000 seguidores.',
    'Manter o perfil público enquanto estiver ativo.',
    'Enviar somente vídeo real e original.',
    'Não usar conteúdo protegido sem autorização.',
    'Respeitar as regras específicas de cada campanha.',
    'O envio não garante seleção, publicação ou pagamento.',
    'O prêmio é definido pela Crediti em cada campanha.',
    'Bônus só aparece quando estiver ativado naquela campanha.',
    'Somente a Crediti cria, altera, encerra campanhas e escolhe o vencedor.'
  ];

  let rootDisplay = '';
  const esc = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const money = v => Number(v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  const token = () => localStorage.getItem(TOKEN_KEY) || '';
  const headers = (extra={}) => ({ apikey: KEY, ...extra });
  const statusLabel = s => ({
    em_analise:'Em análise', ativo:'Creator ativo', nao_elegivel:'Não elegível',
    perfil_privado:'Perfil privado', cancelado_creator:'Cancelado por você',
    desativado_crediti:'Desativado pela Crediti', pendente:'Pendente', enviado:'Enviado',
    nao_enviado:'Não enviado', vencedor:'Vencedor', nao_selecionado:'Não selecionado',
    publicado:'Publicado', em_analise_video:'Em análise'
  }[s] || s || '-');

  function readableError(text) {
    try {
      const data = JSON.parse(text);
      return data.message || data.error_description || data.hint || text;
    } catch { return text || 'Não foi possível concluir agora.'; }
  }

  async function rpc(name, body) {
    const r = await fetch(`${REST}/rpc/${name}`, {
      method:'POST',
      headers: headers({ 'Content-Type':'application/json' }),
      body: JSON.stringify(body)
    });
    const text = await r.text();
    if (!r.ok) throw new Error(readableError(text));
    return text ? JSON.parse(text) : null;
  }

  async function getMe() { if (!token()) return null; try { return await rpc('creator_ads_get_me',{p_token:token()}); } catch { return null; } }
  async function getCampaigns() { if (!token()) return []; try { return await rpc('creator_ads_public_campaigns',{p_token:token()}) || []; } catch { return []; } }
  async function getSubs() { if (!token()) return []; try { return await rpc('creator_ads_my_submissions',{p_token:token()}) || []; } catch { return []; } }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
#${CARD_ID}{width:100%;border:0;border-radius:22px;padding:18px;margin:16px 0 4px;background:#171717;color:#fff;font:inherit;text-align:left;cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:12px;box-sizing:border-box;box-shadow:0 10px 26px rgba(0,0,0,.12)}
#${CARD_ID} .copy{display:grid;gap:8px}#${CARD_ID} .k{display:inline-flex;width:fit-content;padding:6px 10px;border-radius:999px;background:#FDCA01;color:#111;font-size:10px;font-weight:900;text-transform:uppercase}#${CARD_ID} strong{font-size:clamp(18px,5vw,22px);line-height:1.12;font-weight:900}#${CARD_ID} small{color:rgba(255,255,255,.74);font-size:12px;line-height:1.45}#${CARD_ID} .a{color:#FDCA01;font-size:12px;font-weight:900}#${CARD_ID} .film{width:64px;height:64px;border-radius:18px;background:#2a2a2a;display:grid;place-items:center;align-self:center;color:#FDCA01}#${CARD_ID} .film svg{width:34px;height:34px}
#${PAGE_ID}{min-height:100dvh;background:#f6f6f4;color:#151515;font-family:Montserrat,Arial,sans-serif;padding-bottom:36px}#${PAGE_ID} *{box-sizing:border-box}#${PAGE_ID} .top{position:sticky;top:0;z-index:20;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:13px 16px;background:rgba(255,255,255,.97);border-bottom:1px solid #e7e7e3;backdrop-filter:blur(10px)}#${PAGE_ID} .back{display:inline-flex;align-items:center;justify-content:center;width:auto;min-width:122px;max-width:150px;min-height:42px;padding:9px 12px;border:1px solid #deded9;border-radius:12px;background:#fff;color:#222;font:inherit;font-size:11px;font-weight:900;line-height:1.1;white-space:nowrap}#${PAGE_ID} .brand{font-size:23px;font-weight:900;letter-spacing:-.04em;justify-self:start}#${PAGE_ID} .wrap{width:min(100%,760px);margin:0 auto;padding:14px 16px 24px}
#${PAGE_ID} .hero{position:relative;min-height:245px;border-radius:25px;background:#171717;color:#fff;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.16fr) minmax(180px,.84fr);box-shadow:0 10px 28px rgba(0,0,0,.12)}#${PAGE_ID} .hero-copy{position:relative;z-index:2;padding:22px 8px 22px 20px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}#${PAGE_ID} .hero:before{content:'$';position:absolute;left:52%;top:4px;color:#f28c28;font-size:54px;font-weight:900;opacity:.15;transform:rotate(-12deg);z-index:1}#${PAGE_ID} .pill{display:inline-flex;padding:6px 10px;border-radius:999px;background:#FDCA01;color:#111;font-size:9px;font-weight:900;letter-spacing:.05em}#${PAGE_ID} h1{margin:12px 0 8px;color:#fff;font-size:clamp(24px,7vw,38px);line-height:1.03;letter-spacing:-.035em;max-width:360px}#${PAGE_ID} .hero p{margin:0;color:rgba(255,255,255,.76);font-size:12px;line-height:1.48;max-width:350px}#${PAGE_ID} .hero-note{margin-top:14px;padding:10px 12px;border:1px solid rgba(242,140,40,.35);border-radius:12px;background:rgba(242,140,40,.10);font-size:11px;font-weight:800}#${PAGE_ID} .hero-art{position:relative;min-height:245px;overflow:hidden}#${PAGE_ID} .hero-art:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#171717 0%,rgba(23,23,23,.30) 30%,rgba(23,23,23,0) 72%)}#${PAGE_ID} .hero-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.92) contrast(1.03)}
#${PAGE_ID} .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:13px 0 16px}#${PAGE_ID} .step{min-width:0;padding:13px;border:1px solid #e3e3df;border-radius:16px;background:#fff;display:grid;gap:7px}#${PAGE_ID} .step .ico{width:34px;height:34px;border-radius:10px;background:#fff1e6;color:#d76b00;display:grid;place-items:center}#${PAGE_ID} .step svg{width:19px;height:19px}#${PAGE_ID} .step b{font-size:12px}#${PAGE_ID} .step small{font-size:10px;line-height:1.4;color:#686868}
#${PAGE_ID} .tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:10px 0 18px}#${PAGE_ID} .tabs button{min-width:0;min-height:46px;padding:8px 5px;border:1px solid #deded9;border-radius:13px;background:#fff;color:#252525;font:inherit;font-size:10px;font-weight:900;line-height:1.15;white-space:normal}#${PAGE_ID} .tabs button.active{background:#FDCA01;border-color:#FDCA01;color:#111;box-shadow:0 5px 14px rgba(253,202,1,.18)}#${PAGE_ID} .panel{display:none}#${PAGE_ID} .panel.active{display:block}#${PAGE_ID} .section-title span{font-size:10px;font-weight:900;color:#a04b2c;text-transform:uppercase;letter-spacing:.05em}#${PAGE_ID} .section-title h2{margin:4px 0 14px;font-size:25px;letter-spacing:-.025em}
#${PAGE_ID} .rules{display:grid;gap:9px}#${PAGE_ID} .rule{padding:13px;border-radius:15px;background:#fff;border:1px solid #e6e6e2;display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.45}#${PAGE_ID} .rule i{font-style:normal;width:23px;height:23px;flex:0 0 23px;border-radius:50%;background:#fff2d0;display:grid;place-items:center;font-weight:900}
#${PAGE_ID} .notice,#${PAGE_ID} .status{padding:14px;border-radius:15px;background:#fff7df;border:1px solid #f0ddb1;font-size:13px;line-height:1.5}#${PAGE_ID} .success{background:#eef9f0;border-color:#cce8d1;color:#174b22}#${PAGE_ID} .error{background:#fff0f0;border-color:#efcaca;color:#7a2020}#${PAGE_ID} .field{display:grid;gap:6px;margin:12px 0}#${PAGE_ID} label{font-size:12px;font-weight:800}#${PAGE_ID} input,#${PAGE_ID} select{width:100%;min-height:48px;border:1px solid #d8d8d4;border-radius:14px;padding:11px 13px;background:#fff;font:inherit;font-size:16px}#${PAGE_ID} input:focus,#${PAGE_ID} select:focus{outline:2px solid rgba(253,202,1,.45);border-color:#c4a300}#${PAGE_ID} .check{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-size:12px;line-height:1.42}#${PAGE_ID} .check input{width:21px;min-height:21px;margin:0;flex:0 0 21px}#${PAGE_ID} .full,#${PAGE_ID} .secondary{width:100%;min-height:50px;border:0;border-radius:14px;background:#FDCA01;color:#111;font:inherit;font-weight:900;margin-top:11px}#${PAGE_ID} .full:disabled{opacity:.62;cursor:wait}#${PAGE_ID} .secondary{background:#fff;border:1px solid #222}#${PAGE_ID} .mini-action{border:0;border-radius:12px;background:#111;color:#fff;padding:10px 12px;font:inherit;font-size:11px;font-weight:900;margin-top:10px}
#${PAGE_ID} .campaign,#${PAGE_ID} .video{border:1px solid #e4e4df;border-radius:20px;padding:14px;margin-bottom:12px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.045)}#${PAGE_ID} .campaign-visual{border-radius:17px;padding:16px;background:linear-gradient(135deg,#fff0e4,#ffe0c8);border:1px solid #f2d7c0;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}#${PAGE_ID} .campaign-visual strong{font-size:19px;line-height:1.12}#${PAGE_ID} .campaign-visual .film{width:56px;height:56px;border-radius:15px;background:#fff7f1;display:grid;place-items:center;color:#d76b00}#${PAGE_ID} .campaign-visual svg{width:28px;height:28px}#${PAGE_ID} .campaign p,#${PAGE_ID} .video p{font-size:12px;line-height:1.5;color:#555}#${PAGE_ID} .upload-box{margin-top:13px;padding:13px;border:1px dashed #cfcfc9;border-radius:15px;background:#fafaf8}#${PAGE_ID} .upload-box input[type=file]{padding:10px;background:#fff}#${PAGE_ID} .upload-progress{font-size:12px;font-weight:800;margin-top:10px;line-height:1.4}#${PAGE_ID} .term{white-space:pre-line;padding:15px;border-radius:16px;background:#fff;border:1px solid #e4e4df;font-size:12px;line-height:1.55}
@media(max-width:560px){#${PAGE_ID} .top{grid-template-columns:auto 1fr}#${PAGE_ID} .brand{font-size:21px}#${PAGE_ID} .hero{grid-template-columns:minmax(0,1.18fr) minmax(116px,.82fr);min-height:225px}#${PAGE_ID} .hero-copy{padding:18px 0 18px 16px}#${PAGE_ID} h1{font-size:21px;max-width:235px}#${PAGE_ID} .hero p{font-size:11px;max-width:230px}#${PAGE_ID} .hero-art{min-height:225px}#${PAGE_ID} .steps{grid-template-columns:1fr}#${PAGE_ID} .step{grid-template-columns:34px 1fr;column-gap:10px;align-items:center}#${PAGE_ID} .step .ico{grid-row:1/3}#${PAGE_ID} .tabs{grid-template-columns:1fr 1fr}#${PAGE_ID} .tabs button:last-child{grid-column:span 2}}
@media(max-width:380px){#${PAGE_ID} .back{min-width:112px;font-size:10px;padding:8px 9px}#${PAGE_ID} .hero{grid-template-columns:1fr}.hero-art{display:none!important}}
`;
    document.head.appendChild(s);
  }

  function iconFilm(){return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="17" width="34" height="23" rx="4"/><path d="M9 17l7-9h8l-7 9m9 0 7-9h6l-7 9M8 25h32"/><path d="M21 29l8 5-8 5z" fill="currentColor" stroke="none"/></svg>'}
  function iconCamera(){return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="14" width="27" height="22" rx="4"/><path d="M34 21l8-5v18l-8-5z"/><circle cx="20" cy="25" r="6"/></svg>'}
  function iconPlay(){return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="18"/><path d="M20 16l12 8-12 8z" fill="currentColor" stroke="none"/></svg>'}

  function mountCard(){
    if(document.getElementById(CARD_ID)) return;
    const tools=document.querySelector('.home-personal-tools');
    if(!tools?.parentElement) return;
    const b=document.createElement('button');
    b.id=CARD_ID;b.type='button';
    b.innerHTML=`<span class="copy"><span class="k">1 vencedor por campanha</span><strong>Seja um Creator Ads da Crediti e fature</strong><small>Envie seu vídeo, participe de campanhas e ganhe se for o escolhido.</small><span class="a">Ver campanhas →</span></span><span class="film" aria-hidden="true">${iconFilm()}</span>`;
    b.addEventListener('click',openPage);
    tools.insertAdjacentElement('afterend',b);
  }

  function pageHtml(){return `<main id="${PAGE_ID}"><header class="top"><button class="back" type="button" id="creatorBack">← Voltar ao app</button><div class="brand">CREDITI</div></header><div class="wrap"><section class="hero"><div class="hero-copy"><span class="pill">CREATOR ADS CREDITI</span><h1>Crie conteúdo e fature com a Crediti</h1><p>Participe das campanhas, envie seu vídeo e tenha a chance de ser o creator escolhido da vez.</p><div class="hero-note">Sua ideia pode virar campanha</div></div><div class="hero-art"><img src="${PHOTO}" referrerpolicy="no-referrer" alt="Jovem criando conteúdo com smartphone"></div></section><section class="steps"><article class="step"><span class="ico">${iconFilm()}</span><b>Campanhas</b><small>Veja o tema e o prêmio de cada oportunidade.</small></article><article class="step"><span class="ico">${iconCamera()}</span><b>Criação</b><small>Grave seu vídeo no formato pedido.</small></article><article class="step"><span class="ico">${iconPlay()}</span><b>Envio</b><small>Envie e acompanhe o resultado pelo app.</small></article></section><nav class="tabs" aria-label="Creator Ads"><button data-tab="rules" class="active">Regras</button><button data-tab="profile">Meu cadastro</button><button data-tab="campaigns">Campanhas</button><button data-tab="videos">Meus vídeos</button><button data-tab="term">Meu termo</button></nav><section class="panel active" data-panel="rules"><div class="section-title"><span>Antes de participar</span><h2>Regras principais</h2></div><div id="creatorRules" class="rules"></div></section><section class="panel" data-panel="profile"><div class="section-title"><span>Creator Ads</span><h2>Meu cadastro</h2></div><div id="creatorProfile"></div></section><section class="panel" data-panel="campaigns"><div class="section-title"><span>Oportunidades</span><h2>Campanhas</h2></div><div id="creatorCampaigns"></div></section><section class="panel" data-panel="videos"><div class="section-title"><span>Acompanhamento</span><h2>Meus vídeos</h2></div><div id="creatorVideos"></div></section><section class="panel" data-panel="term"><div class="section-title"><span>Transparência</span><h2>Meu termo</h2></div><div id="creatorTerm"></div></section></div></main>`}

  function showTab(name){
    const page=document.getElementById(PAGE_ID); if(!page)return;
    page.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    page.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
    refresh();
  }

  function openPage(){
    if(document.getElementById(PAGE_ID))return;
    const root=document.getElementById('root'); if(root){rootDisplay=root.style.display;root.style.display='none';}
    document.body.insertAdjacentHTML('beforeend',pageHtml());
    if(location.hash!=='#creator-ads') history.pushState({creatorAds:true},'',location.pathname+location.search+'#creator-ads');
    const page=document.getElementById(PAGE_ID);
    page.querySelector('#creatorBack').addEventListener('click',closePage);
    page.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
    page.querySelector('#creatorRules').innerHTML=rules.map(r=>`<div class="rule"><i>✓</i><div>${esc(r)}</div></div>`).join('');
    refresh();
    window.scrollTo(0,0);
  }

  function closePage(){
    document.getElementById(PAGE_ID)?.remove();
    const root=document.getElementById('root'); if(root)root.style.display=rootDisplay;
    if(location.hash==='#creator-ads') history.replaceState({},'',location.pathname+location.search);
    window.scrollTo(0,0); mountCard();
  }

  window.addEventListener('popstate',()=>{
    if(location.hash==='#creator-ads'){if(!document.getElementById(PAGE_ID))openPage();}
    else if(document.getElementById(PAGE_ID))closePage();
  });

  function formHtml(){return `<div class="notice">Faça seu pré-cadastro. Depois da conferência da Crediti, seu perfil poderá ser ativado e você terá acesso às campanhas.</div><form id="creatorForm" novalidate><div class="field"><label>Nome completo</label><input name="name" required autocomplete="name"></div><div class="field"><label>WhatsApp</label><input name="whatsapp" required inputmode="tel"></div><div class="field"><label>Plataforma</label><select name="platform" required><option value="">Escolha</option><option>Instagram</option><option>TikTok</option><option>Kwai</option></select></div><div class="field"><label>@perfil ou link oficial</label><input name="profile" required></div><div class="field"><label>Chave Pix</label><input name="pix" required></div><div class="field"><label>Tipo da chave Pix</label><select name="pixType" required><option value="">Escolha</option><option>Telefone</option><option>E-mail</option><option>Chave aleatória</option><option>Outro</option></select></div><div class="field"><label>Banco ou instituição da conta Pix</label><input name="bank" required></div><label class="check"><input type="checkbox" name="adult" required><span>Declaro que tenho 18 anos ou mais.</span></label><label class="check"><input type="checkbox" name="publicProfile" required><span>Confirmo que meu perfil está público e permanecerá público enquanto eu participar.</span></label><label class="check"><input type="checkbox" name="imageConsent" required><span>Autorizo uso de imagem, voz, nome e conteúdo enviado conforme o termo.</span></label><label class="check"><input type="checkbox" name="dataConsent" required><span>Concordo com o tratamento dos dados necessários à participação.</span></label><button class="full" type="submit">Enviar pré-cadastro</button><div id="creatorFormMessage" aria-live="polite"></div></form>`}

  async function submitRegistration(form){
    if(form.dataset.busy==='1') return;
    const msg=form.querySelector('#creatorFormMessage');
    const btn=form.querySelector('button[type="submit"]');
    if(!form.checkValidity()){ form.reportValidity(); return; }
    form.dataset.busy='1'; btn.disabled=true; btn.textContent='Enviando...';
    msg.innerHTML='<div class="notice">Enviando seu pré-cadastro...</div>';
    const f=new FormData(form);
    try{
      const r=await rpc('creator_ads_register',{
        p_nome:String(f.get('name')||'').trim(), p_whatsapp:String(f.get('whatsapp')||'').trim(),
        p_plataforma:String(f.get('platform')||''), p_perfil:String(f.get('profile')||'').trim(),
        p_pix_chave:String(f.get('pix')||'').trim(), p_pix_tipo:String(f.get('pixType')||''),
        p_banco:String(f.get('bank')||'').trim(), p_adulto:!!form.elements.adult.checked,
        p_perfil_publico:!!form.elements.publicProfile.checked, p_uso_imagem:!!form.elements.imageConsent.checked,
        p_tratamento_dados:!!form.elements.dataConsent.checked
      });
      localStorage.setItem(TOKEN_KEY,r.public_token);
      btn.textContent='Cadastro enviado ✓';
      msg.innerHTML='<div class="notice success"><b>Pré-cadastro enviado com sucesso.</b><br>Seu cadastro já foi recebido pela Crediti. Status inicial: Em análise.</div>';
      await new Promise(resolve=>setTimeout(resolve,650));
      await refresh();
    }catch(err){
      form.dataset.busy='0'; btn.disabled=false; btn.textContent='Enviar pré-cadastro';
      msg.innerHTML=`<div class="notice error"><b>Não foi possível enviar.</b><br>${esc(err.message)}</div>`;
    }
  }

  async function renderProfile(me){
    const box=document.getElementById('creatorProfile'); if(!box)return;
    if(!me?.id){
      box.innerHTML=formHtml();
      const form=box.querySelector('#creatorForm');
      form.addEventListener('submit',e=>{e.preventDefault();submitRegistration(form);});
      return;
    }
    const pending=me.status==='em_analise';
    box.innerHTML=`<div class="status${me.status==='ativo'?' success':''}"><b>${esc(me.nome)}</b><br>${esc(me.plataforma)}: ${esc(me.perfil)}<br>Status: <b>${esc(statusLabel(me.status))}</b>${me.seguidores_verificados?`<br>Seguidores verificados: ${Number(me.seguidores_verificados).toLocaleString('pt-BR')}`:''}${pending?'<br><br>A Crediti precisa aprovar seu cadastro antes do primeiro envio.':''}</div>${!['cancelado_creator','desativado_crediti','nao_elegivel'].includes(me.status)?'<button id="cancelCreator" class="secondary" type="button">Cancelar minha participação como Creator</button>':''}`;
    box.querySelector('#cancelCreator')?.addEventListener('click',async()=>{if(!confirm('Ao cancelar, você deixará de participar de novas campanhas. Seus registros anteriores serão mantidos. Deseja continuar?'))return;try{await rpc('creator_ads_cancel_me',{p_token:token()});await refresh();}catch(e){alert(e.message);}});
  }

  function videoMeta(file){return new Promise(resolve=>{const url=URL.createObjectURL(file),v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{const m={width:v.videoWidth||null,height:v.videoHeight||null,duration:Number.isFinite(v.duration)?v.duration:null};URL.revokeObjectURL(url);resolve(m)};v.onerror=()=>{URL.revokeObjectURL(url);resolve({width:null,height:null,duration:null})};v.src=url;});}

  async function uploadVideo(form){
    if(form.dataset.busy==='1')return;
    const file=form.video.files?.[0],progress=form.querySelector('.upload-progress'),btn=form.querySelector('button[type="submit"]');
    if(!file){progress.textContent='Escolha um vídeo primeiro.';return;}
    if(file.size>157286400){progress.textContent='Arquivo acima de 150 MB. Escolha outro arquivo.';return;}
    form.dataset.busy='1';btn.disabled=true;btn.textContent='Enviando vídeo...';let begin;
    try{
      progress.textContent='Preparando o arquivo original...';
      const m=await videoMeta(file);
      begin=await rpc('creator_ads_begin_upload',{p_token:token(),p_campaign:form.dataset.campaign,p_video_nome:file.name,p_video_mime:file.type||'video/mp4',p_video_tamanho:file.size,p_video_largura:m.width,p_video_altura:m.height,p_video_duracao:m.duration});
      progress.textContent='Enviando vídeo. Não feche esta tela...';
      const up=await fetch(`${STORAGE}/creator-ads-videos/${begin.path.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:headers({'Content-Type':file.type||'application/octet-stream','x-upsert':'true'}),body:file});
      if(!up.ok)throw new Error('O arquivo não chegou ao armazenamento. Tente novamente.');
      await rpc('creator_ads_finish_upload',{p_token:token(),p_submission:begin.submission_id,p_upload_token:begin.upload_token,p_video_path:begin.path,p_ok:true,p_error:null});
      progress.innerHTML='<span style="color:#176b2c">✓ Vídeo enviado com sucesso. Agora ele está aguardando análise.</span>';
      btn.textContent='Vídeo enviado ✓';form.reset();
      await refresh();
    }catch(err){
      progress.innerHTML=`<span style="color:#8a1f1f">Não enviado: ${esc(err.message)}</span>`;
      if(begin)try{await rpc('creator_ads_finish_upload',{p_token:token(),p_submission:begin.submission_id,p_upload_token:begin.upload_token,p_video_path:begin.path,p_ok:false,p_error:err.message});}catch{}
      form.dataset.busy='0';btn.disabled=false;btn.textContent='Enviar vídeo';
    }
  }

  function renderCampaigns(me,items){
    const box=document.getElementById('creatorCampaigns'); if(!box)return;
    if(!me?.id){box.innerHTML='<div class="notice">Faça seu pré-cadastro em <b>Meu cadastro</b> para participar das campanhas.</div><button class="mini-action" id="goRegister" type="button">Fazer pré-cadastro</button>';box.querySelector('#goRegister')?.addEventListener('click',()=>showTab('profile'));return;}
    if(me.status!=='ativo'){box.innerHTML=`<div class="notice"><b>Cadastro ${esc(statusLabel(me.status))}.</b><br>Assim que a Crediti aprovar seu perfil, o campo de envio de vídeo será liberado automaticamente aqui.</div>`;return;}
    if(!items.length){box.innerHTML='<div class="notice">Nenhuma campanha ativa no momento.</div>';return;}
    box.innerHTML=items.map(c=>`<article class="campaign"><div class="campaign-visual"><strong>${esc(c.titulo)}</strong><span class="film">${iconFilm()}</span></div>${c.descricao?`<p>${esc(c.descricao)}</p>`:''}<p>${esc(c.briefing)}</p><p><b>Prêmio: ${money(c.premio)}</b></p>${c.bonus_ativo?`<p><b>Bônus: ${money(c.bonus_valor)}</b> ao atingir ${Number(c.bonus_meta_views||0).toLocaleString('pt-BR')} visualizações.</p>`:''}<div class="upload-box"><b>Enviar meu vídeo</b><p>Preferencialmente 1080 × 1920, vertical 9:16. MP4, MOV ou WebM, até 150 MB.</p><form class="uploadForm" data-campaign="${c.id}"><div class="field"><label>Escolher vídeo</label><input type="file" name="video" accept="video/mp4,video/quicktime,video/webm" required></div><label class="check"><input type="checkbox" required><span>Confirmo que o vídeo foi produzido por mim.</span></label><label class="check"><input type="checkbox" required><span>Confirmo as autorizações das pessoas e elementos do vídeo.</span></label><label class="check"><input type="checkbox" required><span>Confirmo que não utilizei conteúdo protegido sem autorização.</span></label><label class="check"><input type="checkbox" required><span>Li e aceito as regras desta campanha.</span></label><button class="full" type="submit">Enviar vídeo</button><div class="upload-progress" aria-live="polite"></div></form></div></article>`).join('');
    box.querySelectorAll('.uploadForm').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();uploadVideo(form);}));
  }

  function renderVideos(items){const box=document.getElementById('creatorVideos');if(!box)return;box.innerHTML=items.length?items.map(v=>`<article class="video"><b>${esc(v.video_nome||'Vídeo')}</b><p>Status: <b>${esc(statusLabel(v.status))}</b></p>${v.video_largura&&v.video_altura?`<p>Resolução: ${v.video_largura} × ${v.video_altura}</p>`:''}${v.erro_upload?`<p>${esc(v.erro_upload)}</p>`:''}</article>`).join(''):'<div class="notice">Você ainda não enviou vídeos.</div>';}
  function renderTerm(me){const box=document.getElementById('creatorTerm');if(!box)return;box.innerHTML=me?.id?`<div class="term">Participante: ${esc(me.nome)}\nPlataforma: ${esc(me.plataforma)}\nPerfil: ${esc(me.perfil)}\nVersão: ${esc(me.term_version)}\nAceite: ${new Date(me.accepted_at).toLocaleString('pt-BR')}\n\n${esc(me.term_text||'')}</div>`:'<div class="notice">Seu termo aparecerá aqui depois do pré-cadastro.</div>';}

  async function refresh(){
    if(!document.getElementById(PAGE_ID))return;
    const [me,camps,subs]=await Promise.all([getMe(),getCampaigns(),getSubs()]);
    await renderProfile(me);renderCampaigns(me,camps);renderVideos(subs);renderTerm(me);
  }

  function init(){
    injectStyles();mountCard();
    new MutationObserver(mountCard).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
    if(location.hash==='#creator-ads')setTimeout(openPage,0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();