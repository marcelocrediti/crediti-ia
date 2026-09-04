(() => {
  const PAGE_ID = 'crediti-creator-ads-page';
  const STYLE_ID = 'crediti-creator-ads-live-polish-style';
  const PHOTO = 'https://images.unsplash.com/photo-1776748665113-ca641e59508e?auto=format&fit=crop&fm=jpg&q=82&w=1200';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${PAGE_ID}{background:#f6f6f4}
#${PAGE_ID} .top{background:rgba(255,255,255,.97);border-bottom:1px solid #e9e9e5;padding:13px 16px}
#${PAGE_ID} .back{background:#fff;border:1px solid #deded9;color:#222;border-radius:11px;padding:9px 11px;font-size:11px;white-space:nowrap}
#${PAGE_ID} .wrap{padding:14px 16px 22px}
#${PAGE_ID} .hero{position:relative;min-height:250px;padding:0;border:0;border-radius:24px;background:#171717;color:#fff;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.14fr) minmax(180px,.86fr);gap:0;box-shadow:0 10px 28px rgba(0,0,0,.12)}
#${PAGE_ID} .hero:before{content:'$';position:absolute;left:51%;top:8px;color:#f28c28;font-size:52px;font-weight:900;opacity:.16;transform:rotate(-12deg);z-index:0}
#${PAGE_ID} .hero:after{content:'$';position:absolute;right:8px;bottom:-20px;color:#f28c28;font-size:84px;font-weight:900;opacity:.12;transform:rotate(13deg);z-index:0}
#${PAGE_ID} .hero>div:first-child{position:relative;z-index:2;padding:22px 8px 22px 20px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
#${PAGE_ID} .pill{background:#FDCA01;color:#111;padding:6px 10px;font-size:9px;letter-spacing:.05em}
#${PAGE_ID} h1{margin:12px 0 8px;color:#fff;font-size:clamp(24px,7vw,38px);line-height:1.03;letter-spacing:-.035em;max-width:360px}
#${PAGE_ID} .hero p{color:rgba(255,255,255,.76);font-size:12px;line-height:1.48;max-width:350px}
#${PAGE_ID} .rotator{margin-top:14px;min-height:auto;padding:9px 11px;background:rgba(242,140,40,.10);border:1px solid rgba(242,140,40,.34);color:#fff;border-radius:12px;font-size:11px;font-weight:800}
#${PAGE_ID} .hero-art{position:relative;min-height:250px;display:block;overflow:hidden}
#${PAGE_ID} .hero-art .bubble{display:none!important}
#${PAGE_ID} .hero-art:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#171717 0%,rgba(23,23,23,.30) 30%,rgba(23,23,23,0) 72%);z-index:1}
#${PAGE_ID} .hero-art img{position:absolute;inset:0;width:100%;height:100%;max-width:none!important;object-fit:cover;object-position:center;filter:saturate(.92) contrast(1.03);z-index:0}
#${PAGE_ID} .cinema-row{gap:8px;margin:12px 0 15px}
#${PAGE_ID} .cinema-item{min-width:0;padding:12px 10px;border-radius:15px;border-color:#e3e3df;background:#fff;box-shadow:none}
#${PAGE_ID} .cinema-item .ico{width:32px;height:32px;border-radius:10px;background:#fff1e6;color:#d76b00}
#${PAGE_ID} .cinema-item svg{width:18px;height:18px}
#${PAGE_ID} .cinema-item b{font-size:11px}
#${PAGE_ID} .cinema-item small{font-size:10px;color:#686868}
#${PAGE_ID} .tabs{grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:10px 0 16px}
#${PAGE_ID} .tabs button{min-width:0;min-height:44px;padding:8px 5px;border:1px solid #deded9;border-radius:12px;background:#fff;color:#252525;font-size:10px;line-height:1.15;white-space:normal;box-shadow:none}
#${PAGE_ID} .tabs button.active{background:#FDCA01;border-color:#FDCA01;color:#111;box-shadow:0 5px 14px rgba(253,202,1,.18)}
#${PAGE_ID} .rule i{background:#fff2d0}
#${PAGE_ID} .notice,#${PAGE_ID} .status{background:#fff7df}
#${PAGE_ID} .campaign-visual{background:linear-gradient(135deg,#fff0e4,#ffe0c8);border:1px solid #f2d7c0}
@media(max-width:560px){
  #${PAGE_ID} .hero{grid-template-columns:minmax(0,1.22fr) minmax(118px,.78fr);min-height:225px}
  #${PAGE_ID} .hero>div:first-child{padding:18px 0 18px 16px}
  #${PAGE_ID} h1{font-size:21px;max-width:235px}
  #${PAGE_ID} .hero p{font-size:11px;max-width:230px}
  #${PAGE_ID} .hero-art{min-height:225px}
  #${PAGE_ID} .cinema-row{grid-template-columns:1fr}
  #${PAGE_ID} .cinema-item{display:grid;grid-template-columns:34px 1fr;column-gap:9px;align-items:center}
  #${PAGE_ID} .cinema-item .ico{grid-row:1/3}
  #${PAGE_ID} .tabs{grid-template-columns:1fr 1fr}
  #${PAGE_ID} .tabs button:last-child{grid-column:span 2}
}
@media(max-width:380px){#${PAGE_ID} .hero{grid-template-columns:1fr}.hero-art{display:none!important}}
`;
    document.head.appendChild(style);
  }

  function patchPage(page) {
    if (!page || page.dataset.creatorLivePolished === 'true') return;
    page.dataset.creatorLivePolished = 'true';

    const hero = page.querySelector('.hero');
    if (hero) {
      const title = hero.querySelector('h1');
      const subtitle = hero.querySelector('p');
      const rotator = hero.querySelector('.rotator');
      const image = hero.querySelector('.hero-art img');
      if (title) title.textContent = 'Crie conteúdo e fature com a Crediti';
      if (subtitle) subtitle.textContent = 'Participe das campanhas, envie seu vídeo e tenha a chance de ser o creator escolhido da vez.';
      if (rotator) rotator.textContent = 'Sua ideia pode virar campanha';
      if (image) {
        image.src = PHOTO;
        image.alt = 'Jovem criando conteúdo com um smartphone';
        image.referrerPolicy = 'no-referrer';
      }
    }

    const back = page.querySelector('#creatorBack');
    if (back) back.textContent = '← Voltar ao app';

    const tabs = page.querySelector('.tabs');
    if (tabs) {
      tabs.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        const y = window.scrollY;
        requestAnimationFrame(() => window.scrollTo(0, y));
        setTimeout(() => window.scrollTo(0, y), 80);
        setTimeout(() => window.scrollTo(0, y), 220);
      }, true);
    }
  }

  function run() {
    injectStyles();
    patchPage(document.getElementById(PAGE_ID));
  }

  run();
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
})();
