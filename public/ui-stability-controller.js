(() => {
  const UPP_URL = "https://apretailer.com.br/click/6ab43ae52bfa810f9a64b789/179925/360419/app-crediti";
  const GRAN_URL = "https://mais.app/IvPIAQ";
  const GRAN_LOGO = "https://www.grancursosonline.com.br/assets/img/email/logo-.png";
  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
  ];
  const openSafely = (url) => { const opened = window.open(url, "_blank", "noopener,noreferrer"); if (opened) opened.opener = null; };

  const installStyles = () => {
    if (document.getElementById("crediti-structure-fix-style")) return;
    const style = document.createElement("style");
    style.id = "crediti-structure-fix-style";
    style.textContent = `
      #root .app,#root .app input,#root .app select,#root .app textarea{font-weight:400!important}
      #root .app button,#root .app strong,#root .app b{font-weight:500!important}
      #root .app h1,#root .app h2,#root .app h3{font-weight:600!important}
      .direct-card.direct-upp-portabilidade{width:100%!important;min-width:0!important;box-sizing:border-box!important;border:1px solid #dedfe2!important;border-left:4px solid #FDCA01!important;background:#fff!important;overflow:visible!important}
      .direct-upp-portabilidade .direct-secondary-actions{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:12px 0 4px!important;padding:10px!important;border:1px solid #e7e9ec!important;border-radius:12px!important;background:#f5f6f8!important}
      .direct-upp-portabilidade .direct-secondary-actions>small{display:block!important;margin:0!important;font-size:9px!important;line-height:1.25!important;color:#68707b!important}
      .direct-upp-portabilidade .direct-secondary-actions>button{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;width:100%!important;min-width:0!important;min-height:58px!important;box-sizing:border-box!important;margin:0!important;padding:10px 12px!important;border:1px solid #dfe2e6!important;border-radius:10px!important;background:#fff!important;color:#171d2e!important;text-align:left!important;white-space:normal!important;overflow:visible!important}
      .direct-upp-portabilidade .direct-secondary-actions>button>span{display:grid!important;gap:3px!important;min-width:0!important;flex:1 1 auto!important}
      .direct-upp-portabilidade .direct-secondary-actions strong{font-size:12px!important;line-height:1.2!important;overflow-wrap:normal!important;word-break:normal!important}
      .direct-upp-portabilidade .direct-secondary-actions button small{font-size:9px!important;line-height:1.3!important;color:#686f78!important;overflow-wrap:normal!important;word-break:normal!important}
      .direct-upp-portabilidade .direct-secondary-actions button b{flex:0 0 auto!important;font-size:18px!important}
      .direct-grid .favorite-toggle,.direct-grid .compare-select,.compare-tray{display:none!important}
      .product-strip-logo img,.direct-logo img,.career-logo-frame img,.partner-notice-logo img{display:block!important;object-fit:contain!important;object-position:center!important;max-width:100%!important;max-height:100%!important}
      .crediti-learning-hero-shell{position:relative;margin-bottom:22px}
      .crediti-learning-hero-carousel{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;overscroll-behavior-x:contain;margin-bottom:0}
      .crediti-learning-hero-carousel::-webkit-scrollbar{display:none}
      .crediti-learning-hero-carousel>.bank-photo-hero{flex:0 0 100%;width:100%;margin-bottom:0;scroll-snap-align:start;scroll-snap-stop:always}
      .crediti-carousel-dots{display:flex;justify-content:center;gap:7px;padding-top:10px}
      .crediti-carousel-dots button{appearance:none;border:0;padding:0;width:7px;height:7px;border-radius:999px;background:#d3d3ce}
      .crediti-carousel-dots button.active{width:22px;background:#FDCA01}
      .crediti-gran-hero{position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,#fff 0%,#f6f7f9 100%)!important;border:1px solid #e5e7eb!important;cursor:pointer}
      .crediti-gran-hero:after{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(90deg,rgba(255,255,255,.99),rgba(255,255,255,.9) 62%,rgba(255,255,255,.45))!important;z-index:1!important}
      .crediti-gran-hero .gran-hero-art{position:absolute;right:18px;top:20px;z-index:3;width:152px;height:92px;border-radius:18px;background:#fff;display:grid;place-items:center;padding:12px}
      .crediti-gran-hero .gran-hero-art img{width:100%;height:100%;object-fit:contain;display:block}
      .crediti-gran-hero .gran-hero-copy{position:relative;z-index:4;width:min(69%,430px)}
      .crediti-gran-card{border-left:4px solid #e5232f!important}
      .crediti-gran-card .career-brand{background:#fff!important}.crediti-gran-card .career-brand>b{display:none!important}
      .crediti-gran-card .career-logo-frame{width:min(100%,180px)!important;height:48px!important;padding:8px!important;background:#fff!important}
      @media(max-width:430px){.crediti-gran-hero .gran-hero-art{width:122px;height:76px;right:12px;top:16px;padding:9px}.crediti-gran-hero .gran-hero-copy{width:70%}.direct-upp-portabilidade .direct-secondary-actions>button{min-height:62px!important;padding:10px!important}.direct-upp-portabilidade .direct-secondary-actions strong{font-size:11px!important}.direct-upp-portabilidade .direct-secondary-actions button small{font-size:8.5px!important}}
    `;
    document.head.appendChild(style);
  };

  const boostLogos = (scope=document) => scope.querySelectorAll(".product-strip img,.direct-card img,.career-card img,.partner-notice-logo img,.finanzero-alternative img").forEach(img=>{img.loading="eager";img.decoding="async";try{img.fetchPriority="high"}catch{}});

  const ensureUppHomeHighlight = () => {
    const strip = document.querySelector(".modern-home .product-strip"); if(!strip) return;
    let card=strip.querySelector(".product-strip-upp-portabilidade");
    if(!card){card=document.createElement("button");card.type="button";card.className="product-strip-card product-strip-upp-portabilidade";card.dataset.creditiInjected="upp-home";card.innerHTML='<div class="product-strip-logo"><span class="product-strip-brand">Up.p</span></div><strong>Portabilidade CLT com troco</strong><span class="product-strip-action">SIMULAR PORTABILIDADE ›</span>';card.addEventListener("click",()=>openSafely(UPP_URL));}
    if(strip.firstElementChild!==card) strip.insertBefore(card,strip.firstElementChild);
    [...strip.querySelectorAll(":scope > .product-strip-card")].forEach((item,index)=>{item.style.display=index<4?"":"none"});
  };

  const prioritizeUppDirect=()=>{const grid=document.querySelector(".direct-grid");if(!grid)return;const upp=grid.querySelector(".direct-upp-portabilidade");if(upp&&grid.firstElementChild!==upp)grid.insertBefore(upp,grid.firstElementChild)};

  const ensureGranExperience=()=>{
    const hero=document.querySelector(".learning-photo-hero:not(.crediti-gran-hero)");
    const partners=document.querySelector(".education-partner-carousel");
    if(!hero&&!partners)return;
    if(hero){let carousel=hero.closest(".crediti-learning-hero-carousel"),shell=hero.closest(".crediti-learning-hero-shell");if(!carousel){shell=document.createElement("div");shell.className="crediti-learning-hero-shell";carousel=document.createElement("div");carousel.className="crediti-learning-hero-carousel";hero.parentNode.insertBefore(shell,hero);shell.appendChild(carousel);carousel.appendChild(hero)}if(!shell){shell=document.createElement("div");shell.className="crediti-learning-hero-shell";carousel.parentNode.insertBefore(shell,carousel);shell.appendChild(carousel)}let gran=carousel.querySelector(".crediti-gran-hero");if(!gran){gran=document.createElement("section");gran.className="bank-photo-hero learning-photo-hero crediti-gran-hero";gran.innerHTML=`<div class="gran-hero-art"><img src="${GRAN_LOGO}" alt="Gran Cursos Online" loading="eager"></div><div class="gran-hero-copy"><span class="eyebrow">CONCURSOS PÚBLICOS</span><h1>Seu próximo cargo pode começar aqui.</h1><p>Prepare-se para concursos, OAB e carreiras públicas com o Gran.</p></div>`;gran.addEventListener("click",()=>openSafely(GRAN_URL));carousel.appendChild(gran)}let dots=shell.querySelector(".crediti-carousel-dots");if(!dots){dots=document.createElement("div");dots.className="crediti-carousel-dots";shell.appendChild(dots)}const slides=[...carousel.children].filter(el=>el.classList.contains("bank-photo-hero"));if(dots.children.length!==slides.length){dots.innerHTML="";slides.forEach((slide,i)=>{const dot=document.createElement("button");dot.type="button";if(i===0)dot.classList.add("active");dot.onclick=()=>carousel.scrollTo({left:slide.offsetLeft,behavior:"smooth"});dots.appendChild(dot)})}if(carousel.dataset.creditiHeroAuto!=="1"&&slides.length>1){carousel.dataset.creditiHeroAuto="1";let paused=0;const pause=()=>paused=Date.now()+9000;carousel.addEventListener("touchstart",pause,{passive:true});carousel.addEventListener("pointerdown",pause,{passive:true});setInterval(()=>{if(!document.body.contains(carousel)||Date.now()<paused)return;const ss=[...carousel.children].filter(el=>el.classList.contains("bank-photo-hero"));const idx=Math.round(carousel.scrollLeft/Math.max(carousel.clientWidth,1));const next=ss[(idx+1)%ss.length];if(next)carousel.scrollTo({left:next.offsetLeft,behavior:"smooth"})},5200)}}
    if(partners){let card=partners.querySelector(".crediti-gran-card");if(!card){card=document.createElement("button");card.type="button";card.className="career-card gran crediti-gran-card";card.innerHTML=`<div class="career-brand"><span class="career-logo-frame"><img src="${GRAN_LOGO}" alt="Gran Cursos Online" loading="eager"></span><b>Gran Cursos Online</b></div><div class="career-copy"><small>CONCURSOS, OAB E CARREIRAS PÚBLICAS</small><strong>Prepare-se para conquistar sua aprovação</strong><span>CONHECER CURSOS ›</span></div>`;card.addEventListener("click",()=>openSafely(GRAN_URL));partners.appendChild(card)}}
    boostLogos(document);
  };

  const keepShopLinksCorrect=()=>SHOP_LINKS.forEach(([selector,url,key])=>document.querySelectorAll(selector).forEach(button=>{if(button.dataset[key]==="1")return;button.dataset[key]="1";button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openSafely(url)})}));

  const syncCurrentScreen=()=>{
    const home=Boolean(document.querySelector(".modern-home"));
    document.documentElement.classList.toggle("crediti-home-visible",home);
    if(home)ensureUppHomeHighlight();
    if(document.querySelector(".direct-grid"))prioritizeUppDirect();
    if(document.querySelector(".learning-photo-hero,.education-partner-carousel"))ensureGranExperience();
    if(document.querySelector(".shop-real-page,.shop-page"))keepShopLinksCorrect();
    boostLogos(document);
  };

  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncCurrentScreen()})};
  installStyles();schedule();
  const root=document.getElementById("root");if(root)new MutationObserver(mutations=>{if(mutations.some(m=>m.type==="childList"&&m.addedNodes.length))schedule()}).observe(root,{childList:true,subtree:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  // stability marker: .home-personal-tools
})();