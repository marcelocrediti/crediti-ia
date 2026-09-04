(() => {
  const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
  const REST=`${BASE}/rest/v1`;
  const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  const TOKEN_KEY='crediti_creator_admin_token';
  const token=()=>localStorage.getItem(TOKEN_KEY)||'';
  const headers=(extra={})=>({apikey:KEY,Authorization:`Bearer ${token()}`,...extra});

  async function rest(path,opts={}){
    const r=await fetch(`${REST}/${path}`,{...opts,headers:headers({'Content-Type':'application/json',...(opts.headers||{})})});
    const text=await r.text();
    if(!r.ok)throw new Error(text||'Não foi possível concluir.');
    return text?JSON.parse(text):null;
  }

  async function deleteCampaign(id,card){
    if(!token())return;
    try{
      const [subs,pays]=await Promise.all([
        rest(`creator_ads_submissions?select=id&campaign_id=eq.${encodeURIComponent(id)}&limit=1`),
        rest(`creator_ads_payments?select=id&campaign_id=eq.${encodeURIComponent(id)}&limit=1`)
      ]);
      if((subs&&subs.length)||(pays&&pays.length)){
        alert('Esta campanha já possui histórico de vídeo ou pagamento e não pode ser apagada. Encerre a campanha para manter os registros.');
        return;
      }
      const title=card?.querySelector('h3')?.textContent?.trim()||'esta campanha';
      if(!confirm(`Apagar definitivamente “${title}”? Esta ação não poderá ser desfeita.`))return;
      await rest(`creator_ads_campaigns?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
      card?.remove();
    }catch(e){
      alert('Não foi possível apagar a campanha. '+e.message);
    }
  }

  function enhance(){
    document.querySelectorAll('#campaignsList .item-card').forEach(card=>{
      if(card.querySelector('[data-delete-campaign]'))return;
      const source=card.querySelector('[data-campaign]');
      const id=source?.getAttribute('data-campaign');
      if(!id)return;
      const actions=card.querySelector('.card-actions');
      if(!actions)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent='Apagar';
      btn.className='danger';
      btn.setAttribute('data-delete-campaign',id);
      btn.addEventListener('click',e=>{e.stopPropagation();deleteCampaign(id,card)});
      actions.appendChild(btn);
    });
  }

  const observer=new MutationObserver(enhance);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('[data-tab="campanhas"]'))setTimeout(enhance,100)});
  enhance();
})();
