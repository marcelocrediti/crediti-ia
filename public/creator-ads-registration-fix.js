(() => {
  const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
  const REST=`${BASE}/rest/v1`;
  const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  const TOKEN_KEY='crediti_creator_ads_public_token_v1';

  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

  async function rpc(name,body){
    const r=await fetch(`${REST}/rpc/${name}`,{
      method:'POST',
      headers:{apikey:KEY,'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const text=await r.text();
    if(!r.ok){
      let msg=text;
      try{const d=JSON.parse(text);msg=d.message||d.details||d.hint||text}catch{}
      throw new Error(msg||'Não foi possível enviar seu cadastro agora.');
    }
    return text?JSON.parse(text):null;
  }

  function setMessage(form,text,type='info'){
    let box=form.querySelector('#creatorFormMessage');
    if(!box){
      box=document.createElement('div');
      box.id='creatorFormMessage';
      form.appendChild(box);
    }
    box.innerHTML=`<div style="margin-top:12px;padding:13px 14px;border-radius:13px;font:700 13px/1.45 Montserrat,Arial,sans-serif;background:${type==='ok'?'#e9f8ec':type==='error'?'#fff0f0':'#fff7df'};border:1px solid ${type==='ok'?'#bfe7c8':type==='error'?'#f0c5c5':'#ead79c'};color:#171717">${esc(text)}</div>`;
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  document.addEventListener('submit',async(event)=>{
    const form=event.target;
    if(!(form instanceof HTMLFormElement)||form.id!=='creatorForm')return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if(form.dataset.fixedSubmitting==='true')return;
    if(!form.reportValidity())return;

    const button=form.querySelector('button[type="submit"]');
    const fd=new FormData(form);
    const checked=[...form.querySelectorAll('input[type="checkbox"][required]')].every(x=>x.checked);
    if(!checked){setMessage(form,'Marque todas as confirmações obrigatórias para continuar.','error');return;}

    form.dataset.fixedSubmitting='true';
    if(button){button.disabled=true;button.textContent='Enviando cadastro...';button.setAttribute('aria-busy','true');button.style.opacity='.78';}
    setMessage(form,'Enviando seu pré-cadastro...');

    try{
      const result=await rpc('creator_ads_register',{
        p_nome:String(fd.get('name')||'').trim(),
        p_whatsapp:String(fd.get('whatsapp')||'').trim(),
        p_plataforma:String(fd.get('platform')||''),
        p_perfil:String(fd.get('profile')||'').trim(),
        p_pix_chave:String(fd.get('pix')||'').trim(),
        p_pix_tipo:String(fd.get('pixType')||''),
        p_banco:String(fd.get('bank')||'').trim(),
        p_adulto:!!form.elements.adult?.checked,
        p_perfil_publico:!!form.elements.publicProfile?.checked,
        p_uso_imagem:!!form.elements.imageConsent?.checked,
        p_tratamento_dados:!!form.elements.dataConsent?.checked
      });

      if(!result?.public_token)throw new Error('O cadastro foi recebido, mas não foi possível abrir seu perfil. Tente novamente.');
      localStorage.setItem(TOKEN_KEY,result.public_token);
      setMessage(form,result.already_exists?'Cadastro já localizado. Abrindo sua área Creator Ads...':'Pré-cadastro enviado com sucesso. Abrindo sua área Creator Ads...','ok');
      if(button){button.textContent='Cadastro enviado ✓';button.style.opacity='1';}

      window.setTimeout(()=>{
        const tab=document.querySelector('#crediti-creator-ads-page .tabs button[data-tab="profile"]');
        tab?.click();
      },700);
    }catch(err){
      setMessage(form,err?.message||'Não foi possível enviar o cadastro. Tente novamente.','error');
      form.dataset.fixedSubmitting='false';
      form.dataset.submitting='false';
      if(button){button.disabled=false;button.textContent='Enviar pré-cadastro';button.removeAttribute('aria-busy');button.style.opacity='1';}
    }
  },true);
})();
