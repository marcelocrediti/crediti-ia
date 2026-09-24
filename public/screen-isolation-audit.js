(()=>{
  const STYLE_ID='crediti-screen-isolation-audit';
  const CONSIGA_URL='https://www.consigmais.com.br/';
  const CONSIGA_LOGO='/partners/consiga-mais.png';
  const installStyle=()=>{if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  .direct-card.direct-upp-portabilidade{position:relative!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important;width:100%!important;min-width:0!important;height:auto!important;min-height:0!important;margin-bottom:16px!important;padding:16px!important;overflow:hidden!important;box-sizing:border-box!important;background:#fff!important}
  .direct-card.direct-upp-portabilidade>*{position:static!important}
  .direct-upp-portabilidade .direct-logo.upp-logo{align-self:flex-start!important;width:112px!important;min-width:112px!important;height:74px!important;margin:0!important;background:#f4f6f8!important}
  .direct-upp-portabilidade>div:not(.direct-logo):not(.direct-secondary-actions){width:100%!important;min-width:0!important}
  .direct-upp-portabilidade .direct-card-copy{width:100%!important;min-width:0!important;margin:0!important}
  .direct-upp-portabilidade .direct-secondary-actions{display:none!important}
  .direct-card.direct-upp-portabilidade .primary-action{position:static!important;display:block!important;width:100%!important;min-height:48px!important;margin:2px 0 0!important;flex:none!important;background:#ff7a1a!important;color:#fff!important}
  .direct-card.direct-upp-portabilidade .compare-select{position:static!important;width:auto!important;align-self:flex-start!important}

  .finanzero-alternative{position:relative!important;z-index:5!important;clear:both!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:18px 0 10px!important;padding:14px!important;display:grid!important;grid-template-columns:112px minmax(0,1fr)!important;grid-template-rows:auto auto!important;align-items:center!important;gap:12px 14px!important;box-sizing:border-box!important;border:1px solid #e1e5e8!important;border-radius:15px!important;background:#fff!important;overflow:hidden!important;isolation:isolate!important}
  .finanzero-alternative::before,.finanzero-alternative::after{content:none!important;display:none!important}
  .finanzero-alternative>*{position:static!important;float:none!important;transform:none!important;max-height:none!important}
  .finanzero-alternative>.finanzero-alternative-logo{grid-column:1!important;grid-row:1!important;width:112px!important;min-width:112px!important;height:58px!important;min-height:58px!important;margin:0!important;padding:10px!important;display:grid!important;place-items:center!important;box-sizing:border-box!important;border:1px solid #e3e5e8!important;border-radius:11px!important;background:#fff!important;overflow:hidden!important}
  .finanzero-alternative>.finanzero-alternative-logo img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important}
  .finanzero-alternative>.finanzero-alternative-copy{grid-column:2!important;grid-row:1!important;min-width:0!important;width:auto!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important}
  .finanzero-alternative>.finanzero-alternative-copy small{display:block!important;margin:0 0 4px!important;color:#687078!important;font-size:8px!important;font-weight:800!important;letter-spacing:.08em!important}
  .finanzero-alternative>.finanzero-alternative-copy h2{margin:0 0 5px!important;color:#171d2e!important;font-size:17px!important;line-height:1.15!important}
  .finanzero-alternative>.finanzero-alternative-copy p{margin:0!important;color:#686d75!important;font-size:10px!important;line-height:1.4!important}
  .finanzero-alternative>button{grid-column:1 / -1!important;grid-row:2!important;justify-self:start!important;width:auto!important;min-width:0!important;height:auto!important;min-height:38px!important;margin:0!important;padding:9px 14px!important;border:0!important;border-radius:10px!important;background:#008b6a!important;color:#fff!important;font-size:9px!important;font-weight:800!important;box-shadow:none!important}
  .finanzero-alternative .direct-card,.finanzero-alternative .direct-secondary-actions,.finanzero-alternative .product-strip-card,.finanzero-alternative .upp-logo{display:none!important}

  .crediti-consiga-fixed .direct-logo,.crediti-consiga-fixed .product-strip-logo{background:#fff!important;border-color:#e3e5e8!important}
  .crediti-consiga-fixed .direct-logo img,.crediti-consiga-fixed .product-strip-logo img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;filter:none!important;opacity:1!important}
  .crediti-consiga-fixed .primary-action,.crediti-consiga-fixed button.primary-action{background:#4b2587!important;color:#fff!important;border-color:#4b2587!important}
  .crediti-home-credit-card[data-credit="inss"] .product-strip-logo{background:#fff!important;border-color:#e3e5e8!important}
  .crediti-home-credit-card[data-credit="inss"] .product-strip-action{color:#4b2587!important;font-weight:700!important}
  .learning-photo-hero,.career-section,.education-connected-card,.financial-learning-heading,.article-grid,.score-feature-card{max-width:100%!important;box-sizing:border-box!important}
  @media(max-width:620px){
    .direct-card.direct-upp-portabilidade{padding:14px!important}
    .finanzero-alternative{grid-template-columns:92px minmax(0,1fr)!important;grid-template-rows:auto auto!important;gap:10px 12px!important;padding:12px!important;margin-top:18px!important}
    .finanzero-alternative>.finanzero-alternative-logo{width:92px!important;min-width:92px!important;height:56px!important;min-height:56px!important;padding:9px!important}
    .finanzero-alternative>.finanzero-alternative-copy h2{font-size:14px!important}
    .finanzero-alternative>.finanzero-alternative-copy p{font-size:9px!important}
    .finanzero-alternative>button{min-height:36px!important;padding:9px 13px!important}
  }

  /* Final compact FinanZero presentation: one clean row, no oversized outlined box. */
  .finanzero-alternative{grid-template-columns:82px minmax(0,1fr) auto!important;grid-template-rows:auto!important;align-items:center!important;gap:9px!important;width:100%!important;margin:10px 0!important;padding:10px 0!important;border:0!important;border-top:1px solid #e7eaee!important;border-bottom:1px solid #e7eaee!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
  .finanzero-alternative>.finanzero-alternative-logo{grid-column:1!important;grid-row:1!important;width:82px!important;min-width:82px!important;height:44px!important;min-height:44px!important;padding:6px!important;border:0!important;border-radius:9px!important}
  .finanzero-alternative>.finanzero-alternative-copy{grid-column:2!important;grid-row:1!important}
  .finanzero-alternative>.finanzero-alternative-copy small{font-size:8px!important;margin-bottom:2px!important}
  .finanzero-alternative>.finanzero-alternative-copy h2{font-size:14px!important;margin-bottom:2px!important}
  .finanzero-alternative>.finanzero-alternative-copy p{font-size:9px!important;line-height:1.3!important}
  .finanzero-alternative>button{grid-column:3!important;grid-row:1!important;min-height:34px!important;padding:8px 11px!important;border-radius:9px!important;background:#008f6a!important;color:#fff!important;white-space:nowrap!important}
  `;document.head.appendChild(s)};
  const title=()=>{const h=document.querySelector('.app-header h1,.app-header-title,.topbar h1,header h1');return (h?.textContent||'').trim().toLowerCase()};
  const isLearn=()=>title()==='aprenda'||!!document.querySelector('main .career-section');
  const cleanFinanzero=()=>{
    const card=document.querySelector('.finanzero-alternative');
    if(!card)return;
    const logo=card.querySelector(':scope > .finanzero-alternative-logo');
    const copy=card.querySelector(':scope > .finanzero-alternative-copy');
    const compareButton=[...card.querySelectorAll(':scope > button')].find(btn=>{const label=(btn.textContent||'').toLowerCase();return label.includes('comparar ofertas')||label.includes('conferir ofertas')});
    [...card.children].forEach(child=>{
      if(child!==logo&&child!==copy&&child!==compareButton)child.remove();
    });
    card.querySelectorAll('.finanzero-alternative-logo').forEach((el,index)=>{if(index>0)el.remove()});
    card.querySelectorAll('.direct-card,.direct-secondary-actions,.product-strip-card,.upp-logo').forEach(el=>el.remove());
    card.style.height='auto';
    card.style.minHeight='0';
  };
  const ensureLogo=(frame)=>{
    if(!frame)return;
    frame.classList.add('crediti-consiga-logo');
    let img=frame.querySelector('img');
    if(!img){frame.innerHTML='';img=document.createElement('img');frame.appendChild(img)}
    if(!img.src.includes('/partners/consiga-mais.png'))img.src=CONSIGA_LOGO;
    img.alt='Consig Mais';img.loading='eager';img.decoding='async';
  };
  const fixConsigaMais=()=>{
    document.querySelectorAll('a[href*="184987"]').forEach(a=>{a.href=CONSIGA_URL;a.target='_blank';a.rel='noopener noreferrer'});
    const home=document.querySelector('.crediti-home-credit-card[data-credit="inss"]');
    if(home){home.classList.add('crediti-consiga-fixed');ensureLogo(home.querySelector('.product-strip-logo'))}
    document.querySelectorAll('.direct-card').forEach(card=>{
      const text=(card.textContent||'').toLowerCase();
      if(!text.includes('consignado inss')&&!text.includes('consig mais'))return;
      card.classList.add('crediti-consiga-fixed');
      ensureLogo(card.querySelector('.direct-logo'));
      card.querySelectorAll('button').forEach(btn=>{
        const label=(btn.textContent||'').toLowerCase();
        if(label.includes('simular')||label.includes('consignado')){
          btn.style.background='#4b2587';btn.style.color='#fff';btn.style.borderColor='#4b2587';
        }
      });
    });
  };
  const isolate=()=>{
    installStyle();
    cleanFinanzero();
    fixConsigaMais();
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
  const openConsiga=(event)=>{
    const target=event.target.closest('button,a,.crediti-home-credit-card');
    if(!target)return;
    const card=target.closest('.crediti-home-credit-card[data-credit="inss"],.direct-card.crediti-consiga-fixed');
    const broken=target.matches('a[href*="184987"]');
    if(!card&&!broken)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    const opened=window.open(CONSIGA_URL,'_blank','noopener,noreferrer');if(opened)opened.opener=null;
  };
  document.addEventListener('click',openConsiga,true);
  let raf=0;const run=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(isolate)};
  installStyle();run();
  const root=document.getElementById('root');if(root)new MutationObserver(run).observe(root,{childList:true,subtree:true});
  window.addEventListener('pageshow',run,{passive:true});
})();