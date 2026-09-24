(()=>{
  const STYLE_ID='crediti-screen-isolation-audit';
  const installStyle=()=>{if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  .direct-upp-portabilidade .direct-secondary-actions{display:flex!important;flex-direction:column!important;gap:10px!important;padding:10px!important;width:100%!important;box-sizing:border-box!important}
  .direct-upp-portabilidade .direct-secondary-actions>button{display:grid!important;grid-template-columns:minmax(0,1fr) 18px!important;align-items:center!important;width:100%!important;min-width:0!important;min-height:64px!important;padding:11px 12px!important;box-sizing:border-box!important;white-space:normal!important;overflow:hidden!important}
  .direct-upp-portabilidade .direct-secondary-actions>button>span{display:block!important;min-width:0!important;max-width:100%!important;overflow:hidden!important}
  .direct-upp-portabilidade .direct-secondary-actions strong,.direct-upp-portabilidade .direct-secondary-actions small{display:block!important;max-width:100%!important;white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important}
  .direct-upp-portabilidade .direct-secondary-actions strong{font-size:12px!important;line-height:1.25!important;margin-bottom:3px!important}
  .direct-upp-portabilidade .direct-secondary-actions small{font-size:9px!important;line-height:1.35!important}
  .direct-upp-portabilidade .direct-secondary-actions button>b{justify-self:end!important;font-size:18px!important;line-height:1!important}
  .learning-photo-hero,.career-section,.education-connected-card,.financial-learning-heading,.article-grid,.score-feature-card{max-width:100%!important;box-sizing:border-box!important}
  @media(max-width:380px){.direct-upp-portabilidade .direct-secondary-actions>button{min-height:68px!important;padding:10px!important}.direct-upp-portabilidade .direct-secondary-actions strong{font-size:11px!important}.direct-upp-portabilidade .direct-secondary-actions small{font-size:8.5px!important}}
  `;document.head.appendChild(s)};
  const title=()=>{const h=document.querySelector('.app-header h1,.app-header-title,.topbar h1,header h1');return (h?.textContent||'').trim().toLowerCase()};
  const isLearn=()=>title()==='aprenda'||!!document.querySelector('main .career-section');
  const isolate=()=>{
    installStyle();
    const learn=isLearn();
    if(learn){
      const main=document.querySelector('main.modern-page');
      const tips=main?.querySelector(':scope > .score-feature-card');
      const articles=main?.querySelector(':scope > .article-grid');
      if(tips&&articles&&articles.nextElementSibling!==tips)articles.insertAdjacentElement('afterend',tips);
      document.querySelectorAll('.education-partner-carousel img,.crediti-gran-hero img').forEach(img=>{img.loading='eager';img.decoding='async';try{img.fetchPriority='high'}catch{}});
    }else{
      document.querySelectorAll('[data-crediti-injected="learn"],.crediti-learning-hero-shell,.crediti-gran-card').forEach(el=>el.remove());
    }
  };
  let raf=0;const run=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(isolate)};
  installStyle();run();
  const root=document.getElementById('root');if(root)new MutationObserver(run).observe(root,{childList:true,subtree:true});
  window.addEventListener('pageshow',run,{passive:true});
})();