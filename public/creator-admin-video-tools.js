(() => {
  const BASE='https://vgdtywdpywezrwlrsawq.supabase.co';
  const REST=`${BASE}/rest/v1`;
  const KEY='sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  const token=()=>localStorage.getItem('crediti_creator_admin_token')||'';
  const headers=(extra={})=>({apikey:KEY,Authorization:`Bearer ${token()}`,...extra});

  async function rest(path,opts={}){
    const r=await fetch(`${REST}/${path}`,{...opts,headers:headers({'Content-Type':'application/json',Prefer:'return=representation',...(opts.headers||{})})});
    const text=await r.text();
    if(!r.ok)throw new Error(text||'Erro ao acessar os dados.');
    return text?JSON.parse(text):null;
  }

  async function getSubmission(id){
    const rows=await rest(`creator_ads_submissions?id=eq.${encodeURIComponent(id)}&select=*`);
    return rows?.[0]||null;
  }

  async function signedUrl(s,download=false){
    if(!s?.video_path)throw new Error('Este vídeo não possui arquivo original disponível.');
    const path=s.video_path.split('/').map(encodeURIComponent).join('/');
    const r=await fetch(`${BASE}/storage/v1/object/sign/creator-ads-videos/${path}`,{
      method:'POST',headers:headers({'Content-Type':'application/json'}),body:JSON.stringify({expiresIn:3600})
    });
    const d=await r.json();
    if(!r.ok||!d.signedURL)throw new Error('Não foi possível abrir o arquivo original.');
    return `${BASE}/storage/v1${d.signedURL}${download?'&download=1':''}`;
  }

  function ensureViewer(){
    let d=document.getElementById('creatorVideoViewer');
    if(d)return d;
    d=document.createElement('dialog');d.id='creatorVideoViewer';d.className='video-viewer';
    d.innerHTML='<button type="button" class="dialog-close" aria-label="Fechar">×</button><div class="video-viewer-body"><h2>Vídeo original</h2><video controls playsinline preload="metadata"></video><p class="video-viewer-name"></p></div>';
    document.body.appendChild(d);
    const close=()=>{const v=d.querySelector('video');v.pause();v.removeAttribute('src');v.load();d.close();};
    d.querySelector('.dialog-close').addEventListener('click',close);
    d.addEventListener('click',e=>{if(e.target===d)close();});
    return d;
  }

  async function openOriginal(id){
    const s=await getSubmission(id),url=await signedUrl(s,false),d=ensureViewer();
    d.querySelector('.video-viewer-name').textContent=s.video_nome||'Arquivo original';
    const v=d.querySelector('video');v.src=url;d.showModal();
  }

  async function downloadOriginal(id){
    const s=await getSubmission(id),url=await signedUrl(s,true);
    const r=await fetch(url);
    if(!r.ok)throw new Error('Não foi possível baixar o vídeo original.');
    const blob=await r.blob();
    const name=s.video_nome||'video-original.mp4';
    const file=new File([blob],name,{type:blob.type||s.video_mime||'video/mp4'});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:'Vídeo original'});
      return;
    }
    const objectUrl=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=objectUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),10000);
  }

  async function deleteVideo(id){
    const s=await getSubmission(id);if(!s)return;
    if(!confirm('Apagar este vídeo? O arquivo original será removido.'))return;
    if(s.video_path){
      const path=s.video_path.split('/').map(encodeURIComponent).join('/');
      const r=await fetch(`${BASE}/storage/v1/object/creator-ads-videos/${path}`,{method:'DELETE',headers:headers()});
      if(!r.ok){const t=await r.text();throw new Error(t||'Não foi possível apagar o arquivo do armazenamento.');}
    }
    const pay=await rest(`creator_ads_payments?submission_id=eq.${encodeURIComponent(id)}&select=id`);
    if(pay?.length){
      await rest(`creator_ads_submissions?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({video_path:null,erro_upload:'Arquivo original apagado pelo administrador; histórico preservado.'})});
      alert('Arquivo original apagado. O histórico foi mantido porque existe registro financeiro desta participação.');
    }else{
      await rest(`creator_ads_submissions?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});
    }
    document.getElementById('refreshBtn')?.click();
  }

  function enhance(){
    document.querySelectorAll('#submissionsList .item-card').forEach(card=>{
      const any=card.querySelector('[data-submission]');if(!any)return;
      const id=any.dataset.submission,actions=card.querySelector('.card-actions');
      if(!actions||actions.querySelector('[data-video-delete]'))return;
      const b=document.createElement('button');b.type='button';b.className='danger';b.dataset.videoDelete=id;b.textContent='Apagar vídeo';actions.appendChild(b);
    });
  }

  document.addEventListener('click',async e=>{
    const btn=e.target.closest('button');if(!btn)return;
    try{
      if(btn.dataset.videoDelete){e.preventDefault();e.stopImmediatePropagation();await deleteVideo(btn.dataset.videoDelete);return;}
      if(btn.dataset.submission&&btn.dataset.action==='open'){e.preventDefault();e.stopImmediatePropagation();await openOriginal(btn.dataset.submission);return;}
      if(btn.dataset.submission&&btn.dataset.action==='download'){e.preventDefault();e.stopImmediatePropagation();await downloadOriginal(btn.dataset.submission);return;}
    }catch(err){alert(err.message||'Não foi possível concluir.');}
  },true);

  new MutationObserver(enhance).observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(enhance,300);
})();