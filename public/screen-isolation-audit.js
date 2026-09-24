(()=>{
  const STYLE_ID='crediti-screen-isolation-audit';
  const installStyle=()=>{if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  .direct-card.direct-upp-portabilidade{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important;width:100%!important;min-width:0!important;padding:16px!important;overflow:hidden!important;box-sizing:border-box!important;background:#fff!important}
  .direct-upp-portabilidade .direct-logo.upp-logo{align-self:flex-start!important;width:112px!important;min-width:112px!important;height:74px!important;margin:0!important;background:#f4f6f8!important}
  .direct-upp-portabilidade>div:not(.direct-logo):not(.direct-secondary-actions){width:100%!important;min-width:0!important}
  .direct-upp-portabilidade .direct-card-copy{width:100%!important;min-width:0!important;margin:0!important}
  .direct-upp-portabilidade .direct-secondary-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;width:100%!important;min-width:0!important;margin:4px 0!important;padding:0!important;border:0!important;background:transparent!important;box-sizing:border-box!important}
  .direct-upp-portabilidade .direct-secondary-actions>small{grid-column:1/-1!important;margin:0 0 2px!important;font-size:8px!important}
  .direct-upp-portabilidade .direct-secondary-actions>button{display:grid!important;grid-template-columns:minmax(0,1fr) 16px!important;align-items:center!important;width:100%!important;min-width:0!important;min-height:82px!important;padding:11px 12px!important;border:1px solid #dfe2e6!important;border-radius:12px!important;background:#fff!important;box-sizing:border-box!important;white-space:normal!important;overflow:hidden!important}
  .direct-upp-portabilidade .direct-secondary-actions>button>span{display:block!important;min-width:0!important;max-width:100%!important;overflow:visible!important}
  .direct-upp-portabilidade .direct-secondary-actions strong,.direct-upp-portabilidade .direct-secondary-actions small{display:block!important;max-width:100%!important;white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important}
  .direct-upp-portabilidade .direct-secondary-actions strong{font-size:12px!important;line-height:1.2!important;margin-bottom:4px!important}
  .direct-upp-portabilidade .direct-secondary-actions small{font-size:8.5px!important;line-height:1.28!important}
  .direct-upp-portabilidade .direct-secondary-actions button>b{justify-self:end!important;font-size:18px!important;line-height:1!important}
  .direct-card.direct-upp-portabilidade .primary-action{position:static!important;display:block!important;width:100%!important;min-height:48px!important;margin:2px 0 0!important;flex:none!important;background:#ff7a1a!important;color:#fff!important}
  .direct-card.direct-upp-portabilidade .compare-select{position:static!important;width:auto!important;align-self:flex-start!important}
  .finanzero-alternative{position:relative!important;z-index:2!important;clear:both!important;width:100%!important;margin-top:20px!important;background:#fff!important;overflow:hidden!important}
  .finanzero-alternative-logo{background:#fff!important;border:1px solid #e3e5e8!important}
  .finanzero-alternative>button{background:#008b6a!important;color:#fff!important;border:0!important}
  .learning-photo-hero,.career-section,.education-connected-card,.financial-learning-heading,.article-grid,.score-feature-card{max-width:100%!important;box-sizing:border-box!important}
  @media(max-width:520px){.direct-card.direct-upp-portabilidade{padding:14px!important}.direct-upp-portabilidade .direct-secondary-actions{grid-template-columns:1fr 1fr!important}.direct-upp-portabilidade .direct-secondary-actions>button{min-height:88px!important;padding:10px!important}.direct-upp-portabilidade .direct-secondary-actions strong{font-size:11px!important}.direct-upp-portabilidade .direct-secondary-actions small{font-size:8px!important}}
  @media(max-width:350px){.direct-upp-portabilidade .direct-secondary-actions{grid-template-columns:1fr!important}.direct-upp-portabilidade .direct-secondary-actions>small{grid-column:1!important}}
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