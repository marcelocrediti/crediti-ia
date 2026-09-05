(() => {
  const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
  const AUTH=`${BASE}/auth/v1`;
  const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  const TOKEN_KEY='crediti_creator_admin_token';
  const REFRESH_KEY='crediti_creator_admin_refresh_token';
  const ADMIN_EMAIL='marcelinoteixeira.santos@gmail.com';

  function readAuthFromUrl(){
    const raw=(location.hash||'').replace(/^#/,'');
    if(!raw)return false;
    const p=new URLSearchParams(raw);
    const token=p.get('access_token');
    const refresh=p.get('refresh_token');
    if(!token)return false;
    localStorage.setItem(TOKEN_KEY,token);
    if(refresh)localStorage.setItem(REFRESH_KEY,refresh);
    history.replaceState({},'',location.pathname+location.search);
    location.reload();
    return true;
  }

  async function sendMagicLink(){
    const emailInput=document.getElementById('email');
    const msg=document.getElementById('loginMsg');
    const email=(emailInput?.value||ADMIN_EMAIL).trim();
    const btn=document.getElementById('magicLinkBtn');
    if(!email){if(msg)msg.textContent='Informe seu e-mail.';return;}
    if(btn){btn.disabled=true;btn.textContent='ENVIANDO LINK...';}
    if(msg)msg.textContent='';
    try{
      const redirectTo=`${location.origin}/creator-admin.html`;
      const r=await fetch(`${AUTH}/otp?redirect_to=${encodeURIComponent(redirectTo)}`,{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json'},
        body:JSON.stringify({email,create_user:false})
      });
      const text=await r.text();
      if(!r.ok)throw new Error(text||'Não foi possível enviar o link de acesso.');
      if(msg)msg.textContent='Link de acesso enviado para seu e-mail. Abra o e-mail neste aparelho e toque no link para entrar.';
      if(btn)btn.textContent='LINK ENVIADO ✓';
    }catch(e){
      if(msg)msg.textContent='Não foi possível enviar o link agora. Tente novamente.';
      if(btn){btn.disabled=false;btn.textContent='RECEBER LINK DE ACESSO';}
    }
  }

  function init(){
    if(readAuthFromUrl())return;
    const email=document.getElementById('email');
    if(email&&!email.value)email.value=ADMIN_EMAIL;
    const login=document.getElementById('loginBtn');
    if(!login||document.getElementById('magicLinkBtn'))return;
    const btn=document.createElement('button');
    btn.id='magicLinkBtn';
    btn.type='button';
    btn.textContent='RECEBER LINK DE ACESSO';
    btn.style.width='100%';
    btn.style.minHeight='48px';
    btn.style.marginTop='10px';
    btn.style.border='1px solid #111';
    btn.style.borderRadius='13px';
    btn.style.background='#fff';
    btn.style.color='#111';
    btn.style.font='inherit';
    btn.style.fontWeight='900';
    btn.style.touchAction='manipulation';
    btn.addEventListener('click',sendMagicLink);
    login.insertAdjacentElement('afterend',btn);

    const hint=document.createElement('p');
    hint.textContent='Sem senha? Use o link de acesso enviado ao seu e-mail.';
    hint.style.fontSize='12px';
    hint.style.color='#666';
    hint.style.textAlign='center';
    hint.style.margin='10px 0 0';
    btn.insertAdjacentElement('afterend',hint);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();