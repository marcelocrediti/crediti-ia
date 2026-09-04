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
#${MAIN_ID}{
  position:relative!important;
  overflow:hidden!important;
  width:100%!important;
  min-height:158px!important;
  border:0!important;
  border-radius:24px!important;
  padding:20px 20px!important;
  margin:18px 0 18px!important;
  background:linear-gradient(135deg,#087CFF 0%,#3157FF 48%,#D91FEA 100%)!important;
  color:#fff!important;
  box-shadow:0 12px 28px rgba(65,63,210,.18)!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:center!important;
  gap:16px!important;
  text-align:left!important;
}
#${MAIN_ID}:before{content:none!important;display:none!important}
#${MAIN_ID}:after{
  content:'';
  position:absolute;
  width:150px;
  height:150px;
  right:-62px;
  bottom:-92px;
  border-radius:50%;
  background:rgba(255,255,255,.07);
  pointer-events:none;
}
#${MAIN_ID} .k,#${MAIN_ID} .creator-ca-card{display:none!important}
#${MAIN_ID} .copy{position:relative;z-index:1;display:grid!important;gap:7px!important;min-width:0}
#${MAIN_ID} strong{
  position:relative;
  z-index:1;
  max-width:430px;
  color:#fff!important;
  font-size:clamp(20px,5.4vw,27px)!important;
  line-height:1.06!important;
  letter-spacing:-.025em!important;
  font-weight:900!important;
}
#${MAIN_ID} small{
  position:relative;
  z-index:1;
  max-width:430px;
  color:rgba(255,255,255,.88)!important;
  font-size:13px!important;
  line-height:1.42!important;
}
#${MAIN_ID} .a{
  position:relative;
  z-index:1;
  color:#FDCA01!important;
  font-size:14px!important;
  font-weight:900!important;
}
#${MAIN_ID} .film{
  position:relative!important;
  z-index:2!important;
  width:72px!important;
  height:72px!important;
  flex:0 0 72px!important;
  border-radius:20px!important;
  background:rgba(20,20,24,.78)!important;
  display:grid!important;
  place-items:center!important;
  align-self:center!important;
  color:#FDCA01!important;
  border:1px solid rgba(255,255,255,.12)!important;
}
#${MAIN_ID} .film svg{width:38px!important;height:38px!important}
#${MINI_ID}{display:none!important}
@media(max-width:420px){
  #${MAIN_ID}{min-height:150px!important;padding:18px!important;gap:13px!important;margin:16px 0!important}
  #${MAIN_ID} strong{font-size:22px!important}
  #${MAIN_ID} small{font-size:12px!important}
  #${MAIN_ID} .film{width:64px!important;height:64px!important;flex-basis:64px!important;border-radius:18px!important}
  #${MAIN_ID} .film svg{width:34px!important;height:34px!important}
}
`;
    document.head.appendChild(style);
  }

  function removeSecondaryCards() {
    document.querySelectorAll(`#${MINI_ID}`).forEach(el => el.remove());
  }

  function sync() {
    injectStyles();
    removeSecondaryCards();

    const main = document.getElementById(MAIN_ID);
    const homeTools = document.querySelector('.home-personal-tools');
    const homeVisible = isVisible(homeTools);

    if (!main) return;

    if (homeVisible) {
      main.style.setProperty('display', 'grid', 'important');
      main.setAttribute('aria-hidden', 'false');
      if (main.previousElementSibling !== homeTools) {
        homeTools.insertAdjacentElement('afterend', main);
      }
    } else {
      main.style.setProperty('display', 'none', 'important');
      main.setAttribute('aria-hidden', 'true');
    }
  }

  function init() {
    sync();
    const root = document.getElementById('root') || document.body;
    new MutationObserver(() => requestAnimationFrame(sync)).observe(root, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['class','style','aria-current','aria-selected']
    });
    document.addEventListener('click', () => setTimeout(sync, 50), true);
    window.addEventListener('popstate', sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();