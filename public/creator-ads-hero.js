(() => {
  const OVERLAY_ID = 'crediti-creator-ads-overlay';
  const STYLE_ID = 'crediti-creator-ads-hero-style';
  const HERO_ID = 'crediti-creator-ads-hero';
  const STEPS_ID = 'crediti-creator-ads-steps';
  const PHOTO = 'https://images.unsplash.com/photo-1776748665113-ca641e59508e?auto=format&fit=crop&fm=jpg&q=82&w=1200';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${OVERLAY_ID} .sheet{background:#f6f6f4;color:#111;scroll-behavior:auto}
#${OVERLAY_ID} .head{background:#fff;border-bottom:1px solid #ecece8;padding:15px 17px}
#${OVERLAY_ID} .head h2{font-size:20px;line-height:1.08;font-weight:900}
#${OVERLAY_ID} .head p{color:#666;font-size:12px;font-weight:600}
#${OVERLAY_ID} .close{background:#111;color:#fff;flex:0 0 40px;width:40px;height:40px}
#${OVERLAY_ID} .body{padding:16px}
#${OVERLAY_ID} .tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:0 0 16px}
#${OVERLAY_ID} .tabs button{min-width:0;min-height:44px;padding:8px 6px;border:1px solid #deded9;border-radius:12px;background:#fff;color:#252525;font-size:10px;line-height:1.15;font-weight:800;white-space:normal;box-shadow:none}
#${OVERLAY_ID} .tabs button[data-active="true"]{background:#FDCA01;color:#111;border-color:#FDCA01;box-shadow:0 5px 14px rgba(253,202,1,.18)}
#${OVERLAY_ID} .panel{scroll-margin-top:0}
#${OVERLAY_ID} .creator-hero{position:relative;margin:0 0 12px;border-radius:22px;background:#171717;color:#fff;overflow:hidden;min-height:245px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(130px,.85fr);isolation:isolate;box-shadow:0 10px 28px rgba(0,0,0,.12)}
#${OVERLAY_ID} .creator-hero:before{content:'$';position:absolute;left:52%;top:10px;color:#f28c28;font-size:46px;font-weight:900;opacity:.18;transform:rotate(-12deg);z-index:0}
#${OVERLAY_ID} .creator-hero:after{content:'$';position:absolute;right:8px;bottom:-16px;color:#f28c28;font-size:76px;font-weight:900;opacity:.13;transform:rotate(14deg);z-index:0}
#${OVERLAY_ID} .creator-hero-copy{position:relative;z-index:2;padding:20px 0 20px 20px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
#${OVERLAY_ID} .creator-hero-badge{display:inline-flex;align-items:center;min-height:25px;padding:0 9px;border-radius:999px;background:#FDCA01;color:#111;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.055em}
#${OVERLAY_ID} .creator-hero h3{margin:12px 0 7px;font-size:22px;line-height:1.05;font-weight:900;max-width:305px}
#${OVERLAY_ID} .creator-hero-sub{margin:0;color:rgba(255,255,255,.78);font-size:12px;line-height:1.47;max-width:310px}
#${OVERLAY_ID} .creator-hero-note{margin-top:13px;padding:9px 11px;border:1px solid rgba(242,140,40,.34);border-radius:12px;background:rgba(242,140,40,.10);color:#fff;font-size:11px;line-height:1.25;font-weight:800}
#${OVERLAY_ID} .creator-hero-media{position:relative;z-index:1;min-height:245px;overflow:hidden}
#${OVERLAY_ID} .creator-hero-media:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#171717 0%,rgba(23,23,23,.28) 30%,rgba(23,23,23,0) 70%)}
#${OVERLAY_ID} .creator-hero-media img{width:100%;height:100%;min-height:245px;object-fit:cover;object-position:center;display:block;filter:saturate(.92) contrast(1.02)}
#${OVERLAY_ID} .creator-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 14px}
#${OVERLAY_ID} .creator-step{min-width:0;padding:12px 10px;border:1px solid #e4e4df;border-radius:15px;background:#fff;text-align:left;box-sizing:border-box}
#${OVERLAY_ID} .creator-step-icon{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;margin-bottom:8px;background:#fff4e8;color:#d66f00;font-size:15px;font-weight:900}
#${OVERLAY_ID} .creator-step strong{display:block;font-size:11px;line-height:1.2;margin-bottom:4px;color:#111}
#${OVERLAY_ID} .creator-step span{display:block;font-size:10px;line-height:1.35;color:#686868}
#${OVERLAY_ID} .rules li,#${OVERLAY_ID} .campaign,#${OVERLAY_ID} .video,#${OVERLAY_ID} .term{background:#fff;border-color:#e4e4df}
#${OVERLAY_ID} .rules li:before{background:#fff2d0;color:#111}
#${OVERLAY_ID} .notice,#${OVERLAY_ID} .status{background:#fff7df;border:1px solid #f0dfaa}
#${OVERLAY_ID} .primary{background:#FDCA01}
#${OVERLAY_ID} .secondary{background:#fff}
@media(max-width:520px){
  #${OVERLAY_ID} .tabs{grid-template-columns:repeat(2,minmax(0,1fr))}
  #${OVERLAY_ID} .tabs button:last-child{grid-column:span 2}
  #${OVERLAY_ID} .creator-hero{grid-template-columns:minmax(0,1.22fr) minmax(112px,.78fr);min-height:225px}
  #${OVERLAY_ID} .creator-hero-copy{padding:17px 0 17px 16px}
  #${OVERLAY_ID} .creator-hero h3{font-size:19px;max-width:230px}
  #${OVERLAY_ID} .creator-hero-sub{font-size:11px;max-width:225px}
  #${OVERLAY_ID} .creator-hero-media,#${OVERLAY_ID} .creator-hero-media img{min-height:225px}
  #${OVERLAY_ID} .creator-steps{grid-template-columns:1fr}
  #${OVERLAY_ID} .creator-step{display:grid;grid-template-columns:34px 1fr;column-gap:9px;align-items:center;padding:10px 12px}
  #${OVERLAY_ID} .creator-step-icon{margin:0;grid-row:1/3}
}
@media(max-width:390px){#${OVERLAY_ID} .creator-hero{grid-template-columns:1fr}.creator-hero-media{display:none}}
`;
    document.head.appendChild(style);
  }

  function preserveTabScroll(overlay) {
    if (overlay.dataset.creatorScrollFix === 'true') return;
    overlay.dataset.creatorScrollFix = 'true';
    const sheet = overlay.querySelector('.sheet');
    overlay.querySelector('.tabs')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-tab]');
      if (!button || !sheet) return;
      const before = sheet.scrollTop;
      requestAnimationFrame(() => { sheet.scrollTop = before; });
      window.setTimeout(() => { sheet.scrollTop = before; }, 80);
      window.setTimeout(() => { sheet.scrollTop = before; }, 220);
    }, true);
  }

  function mountHero() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return false;
    const body = overlay.querySelector('.body');
    const tabs = overlay.querySelector('.tabs');
    if (!body || !tabs) return false;

    injectStyles();
    preserveTabScroll(overlay);

    let hero = document.getElementById(HERO_ID);
    if (!hero) {
      hero = document.createElement('section');
      hero.id = HERO_ID;
      hero.className = 'creator-hero';
      hero.setAttribute('aria-label', 'Creator Ads Crediti');
      hero.innerHTML = `
        <div class="creator-hero-copy">
          <span class="creator-hero-badge">Creator Ads Crediti</span>
          <h3>Crie conteúdo e fature com a Crediti</h3>
          <p class="creator-hero-sub">Participe das campanhas, envie seu vídeo e tenha a chance de ser o creator escolhido da vez.</p>
          <div class="creator-hero-note">Sua ideia pode virar campanha</div>
        </div>
        <div class="creator-hero-media">
          <img src="${PHOTO}" alt="Jovem criando conteúdo com um smartphone" loading="lazy" referrerpolicy="no-referrer">
        </div>`;
      body.insertBefore(hero, tabs);
    }

    let steps = document.getElementById(STEPS_ID);
    if (!steps) {
      steps = document.createElement('section');
      steps.id = STEPS_ID;
      steps.className = 'creator-steps';
      steps.setAttribute('aria-label', 'Como funciona o Creator Ads');
      steps.innerHTML = `
        <article class="creator-step"><span class="creator-step-icon">1</span><strong>Campanhas</strong><span>Veja o tema e o prêmio de cada oportunidade.</span></article>
        <article class="creator-step"><span class="creator-step-icon">2</span><strong>Criação</strong><span>Grave seu vídeo no formato pedido.</span></article>
        <article class="creator-step"><span class="creator-step-icon">3</span><strong>Envio</strong><span>Envie e acompanhe o resultado pelo app.</span></article>`;
      body.insertBefore(steps, tabs);
    }

    return true;
  }

  if (!mountHero()) {
    const observer = new MutationObserver(() => {
      if (mountHero()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
