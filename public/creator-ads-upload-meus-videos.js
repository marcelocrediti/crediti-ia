(() => {
  const PAGE_ID='crediti-creator-ads-page';
  const TOKEN_KEY='crediti_creator_ads_public_token_v1';
  const UPLOAD_ID='creator-videos-direct-upload';
  const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
  const REST=`${BASE}/rest/v1`;
  const STORAGE=`${BASE}/storage/v1/object`;
  const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';

  const token=()=>localStorage.getItem(TOKEN_KEY)||'';
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const headers=(extra={})=>({apikey:KEY,...extra});

  async function rpc(name,body){
    const r=await fetch(`${REST}/rpc/${name}`,{method:'POST',headers:headers({'Content-Type':'application/json'}),body:JSON.stringify(body)});
    const text=await r.text();
    if(!r.ok){let msg=text;try{const j=JSON.parse(text);msg=j.message||j.error_description||text}catch{}throw new Error(msg||'Não foi possível concluir agora.');}
    return text?JSON.parse(text):null;
  }

  function videoMeta(file){
    return new Promise(resolve=>{
      const url=URL.createObjectURL(file),v=document.createElement('video');
      v.preload='metadata';
      v.onloadedmetadata=()=>{const out={width:v.videoWidth||null,height:v.videoHeight||null,duration:Number.isFinite(v.duration)?v.duration:null};URL.revokeObjectURL(url);resolve(out)};
      v.onerror=()=>{URL.revokeObjectURL(url);resolve({width:null,height:null,duration:null})};
      v.src=url;
    });
  }

  async function upload(form){
    if(form.dataset.busy==='1')return;
    const file=form.video.files?.[0],campaign=form.campaign.value,progress=form.querySelector('.upload-progress'),btn=form.querySelector('button[type="submit"]');
    if(!campaign){progress.textContent='Escolha a campanha.';return;}
    if(!file){progress.textContent='Escolha um vídeo da galeria.';return;}
    if(file.size>157286400){progress.textContent='Arquivo acima de 150 MB. Escolha outro vídeo.';return;}
    if(!form.checkValidity()){form.reportValidity();return;}
    form.dataset.busy='1';btn.disabled=true;btn.textContent='Enviando...';
    let begin=null;
    try{
      progress.textContent='Enviando: preparando vídeo...';
      const meta=await videoMeta(file);
      begin=await rpc('creator_ads_begin_upload',{p_token:token(),p_campaign:campaign,p_video_nome:file.name,p_video_mime:file.type||'video/mp4',p_video_tamanho:file.size,p_video_largura:meta.width,p_video_altura:meta.height,p_video_duracao:meta.duration});
      progress.textContent='Enviando: transferindo arquivo original...';
      const up=await fetch(`${STORAGE}/creator-ads-videos/${begin.path.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:headers({'Content-Type':file.type||'application/octet-stream'}),body:file});
      if(!up.ok){const text=await up.text();let msg='O arquivo não chegou ao armazenamento. Tente novamente.';try{const j=JSON.parse(text);msg=j.message||j.error||msg}catch{if(text)msg=text}throw new Error(msg);}
      await rpc('creator_ads_finish_upload',{p_token:token(),p_submission:begin.submission_id,p_upload_token:begin.upload_token,p_video_path:begin.path,p_ok:true,p_error:null});
      progress.innerHTML='<span style="color:#176b2c">Enviado ✓ Agora aguarde a análise da equipe Crediti.</span>';
      btn.textContent='Vídeo enviado ✓';
      form.reset();
      setTimeout(()=>{document.querySelector('#crediti-creator-ads-page .tabs button[data-tab="videos"]')?.click();},500);
    }catch(e){
      progress.innerHTML=`<span style="color:#8a1f1f">Não enviado: ${esc(e.message)}</span>`;
      if(begin)try{await rpc('creator_ads_finish_upload',{p_token:token(),p_submission:begin.submission_id,p_upload_token:begin.upload_token,p_video_path:begin.path,p_ok:false,p_error:e.message})}catch{}
      form.dataset.busy='0';btn.disabled=false;btn.textContent='Enviar vídeo';
    }
  }

  async function mount(){
    const page=document.getElementById(PAGE_ID),box=document.getElementById('creatorVideos');
    if(!page||!box||!token()||document.getElementById(UPLOAD_ID))return;
    let me=null,campaigns=[];
    try{me=await rpc('creator_ads_get_me',{p_token:token()})}catch{return;}
    if(!me?.id)return;

    const block=document.createElement('section');
    block.id=UPLOAD_ID;
    block.className='upload-box';

    if(me.status!=='ativo'){
      block.innerHTML=`<b>Enviar vídeo</b><p>O envio será liberado quando seu cadastro estiver ativo. Status atual: ${esc(me.status||'-')}.</p>`;
      box.prepend(block);return;
    }

    try{campaigns=(await rpc('creator_ads_public_campaigns',{p_token:token()}))||[]}catch{}
    if(!campaigns.length){
      block.innerHTML='<b>Enviar vídeo</b><p>Seu cadastro está ativo, mas não há campanha aberta para receber vídeo agora.</p>';
      box.prepend(block);return;
    }

    block.innerHTML=`
      <b style="font-size:16px">Enviar vídeo</b>
      <p style="margin:6px 0 12px">Escolha a campanha e selecione o vídeo direto da galeria do celular.</p>
      <form id="creatorDirectVideoForm">
        <div class="field"><label>Campanha</label><select name="campaign" required><option value="">Escolha a campanha</option>${campaigns.map(c=>`<option value="${esc(c.id)}">${esc(c.titulo)}</option>`).join('')}</select></div>
        <div class="field"><label>Vídeo da galeria</label><input type="file" name="video" accept="video/mp4,video/quicktime,video/webm" required></div>
        <label class="check"><input type="checkbox" required><span>Confirmo que o vídeo foi produzido por mim.</span></label>
        <label class="check"><input type="checkbox" required><span>Confirmo as autorizações das pessoas e elementos que aparecem no vídeo.</span></label>
        <label class="check"><input type="checkbox" required><span>Confirmo que não usei conteúdo protegido sem autorização.</span></label>
        <label class="check"><input type="checkbox" required><span>Li e aceito as regras da campanha escolhida.</span></label>
        <button class="full" type="submit">Selecionar e enviar vídeo</button>
        <div class="upload-progress" aria-live="polite"></div>
      </form>`;
    box.prepend(block);
    block.querySelector('form')?.addEventListener('submit',e=>{e.preventDefault();upload(e.currentTarget)});
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest(`#${PAGE_ID} .tabs button[data-tab="videos"]`);
    if(b)setTimeout(mount,80);
  },true);

  const obs=new MutationObserver(()=>{if(document.getElementById('creatorVideos'))mount()});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  mount();
})();
