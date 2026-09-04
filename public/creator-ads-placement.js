(() => {
  const MAIN_ID = 'crediti-creator-ads-card';
  const MINI_ID = 'crediti-creator-ads-mini-card';
  const STYLE_ID = 'crediti-creator-ads-placement-style';

  function isVisible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function injectStyles() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${MAIN_ID}{position:relative!important;overflow:hidden!important;width:100%!important;min-height:210px!important;border:0!important;border-radius:24px!important;padding:24px 24px 24px 24px!important;margin:18px 0 6px!important;background:linear-gradient(135deg,#087CFF 0%,#3157FF 48%,#D91FEA 100%)!important;color:#fff!important;box-shadow:0 14px 34px rgba(65,63,210,.20)!important;display:grid!important;grid-template-columns:1fr auto!important;align-items:center!important;gap:14px!important;text-align:left!important}
#${MAIN_ID}:before{content:none!important;display:none!important}
#${MAIN_ID}:after{content:'';position:absolute;width:170px;height:170px;right:-65px;bottom:-90px;border-radius:50%;background:rgba(255,255,255,.08)}
#${MAIN_ID} .k,#${MAIN_ID} .creator-ca-card{display:none!important}
#${MAIN_ID} .copy{position:relative;z-index:1;min-width:0}
#${MAIN_ID} .film{position:relative!important;z-index:2!important;display:grid!important;place-items:center!important;width:70px!important;height:70px!important;flex:0 0 70px!important;border-radius:20px!important;background:rgba(255,255,255,.16)!important;border:1px solid rgba(255,255,255,.20)!important;color:#fff!important;align-self:center!important}
#${MAIN_ID} .film svg{width:36px!important;height:36px!important}
#${MAIN_ID} strong{position:relative;z-index:1;display:block;max-width:390px;color:#fff!important;font-size:clamp(23px,6vw,31px)!important;line-height:1.03!important;letter-spacing:-.025em!important;font-weight:900!important}
#${MAIN_ID} small{position:relative;z-index:1;display:block;max-width:395px;margin-top:8px;color:rgba(255,255,255,.88)!important;font-size:14px!important;line-height:1.48!important}
#${MAIN_ID} .a{position:relative;z-index:1;display:block;margin-top:9px;color:#FDCA01!important;font-size:15px!important;font-weight:900!important}
#${MINI_ID}{display:none!important}
@media(max-width:420px){#${MAIN_ID}{min-height:195px!important;padding:21px 18px!important;grid-template-columns:1fr auto!important}#${MAIN_ID} .film{width:62px!important;height:62px!important;flex-basis:62px!important;border-radius:18px!important}#${MAIN_ID} .film svg{width:32px!important;height:32px!important}#${MAIN_ID} strong{font-size:24px!important}#${MAIN_ID} small{font-size:13px!important}}
`;
    document.head.appendChild(style);
  }

  function removeAllSecondaryCreatorCards() {
    document.querySelectorAll(`#${MINI_ID}, [data-creator-ads-secondary], .crediti-creator-ads-mini-card`).forEach(el => el.remove());
  }

  function sync() {
    injectStyles();
    removeAllSecondaryCreatorCards();
    const main = document.getElementById(MAIN_ID);
    const homeTools = document.querySelector('.home-personal-tools');
    const homeVisible = isVisible(homeTools);
    if (main) {
      main.style.setProperty('display', homeVisible ? 'grid' : 'none', 'important');
      main.setAttribute('aria-hidden', homeVisible ? 'false' : 'true');
    }
  }

  function init() {
    sync();
    const root = document.getElementById('root') || document.body;
    new MutationObserver(() => requestAnimationFrame(sync)).observe(root, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style','aria-current','aria-selected'] });
    document.addEventListener('click', () => setTimeout(sync, 40), true);
    window.addEventListener('popstate', sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();
