(() => {
  const MAIN_ID = 'crediti-creator-ads-card';
  const MINI_ID = 'crediti-creator-ads-mini-card';
  const STYLE_ID = 'crediti-creator-ads-placement-style';
  const OVERLAY_ID = 'crediti-creator-ads-overlay';

  function isVisible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function openCreator() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.dataset.open = 'true';
    document.documentElement.style.overflow = 'hidden';
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${MAIN_ID}{position:relative!important;overflow:hidden!important;width:100%!important;min-height:210px!important;border:0!important;border-radius:24px!important;padding:24px 122px 24px 24px!important;margin:18px 0 6px!important;background:linear-gradient(135deg,#087CFF 0%,#3157FF 48%,#D91FEA 100%)!important;color:#fff!important;box-shadow:0 14px 34px rgba(65,63,210,.20)!important;display:grid!important;align-content:center!important;gap:9px!important;text-align:left!important}
#${MAIN_ID}:before{content:'🎬';position:absolute;right:22px;top:50%;transform:translateY(-50%);width:74px;height:74px;display:grid;place-items:center;border-radius:22px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.20);font-size:34px;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
#${MAIN_ID}:after{content:'';position:absolute;width:170px;height:170px;right:-65px;bottom:-90px;border-radius:50%;background:rgba(255,255,255,.08)}
#${MAIN_ID} .k,#${MAIN_ID} .creator-ca-card{display:none!important}
#${MAIN_ID} strong{position:relative;z-index:1;max-width:390px;color:#fff!important;font-size:clamp(23px,6vw,31px)!important;line-height:1.03!important;letter-spacing:-.025em!important;font-weight:900!important}
#${MAIN_ID} small{position:relative;z-index:1;max-width:395px;color:rgba(255,255,255,.88)!important;font-size:14px!important;line-height:1.48!important}
#${MAIN_ID} .a{position:relative;z-index:1;color:#FDCA01!important;font-size:15px!important;font-weight:900!important}
#${MINI_ID}{width:calc(100% - 32px);margin:14px 16px 4px;border:0;border-radius:18px;padding:14px 16px;background:linear-gradient(135deg,#087CFF 0%,#5753FF 55%,#E21EDB 100%);color:#fff;font:inherit;text-align:left;display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;box-sizing:border-box;box-shadow:0 9px 24px rgba(80,70,210,.16)}
#${MINI_ID} .copy{min-width:0}#${MINI_ID} strong{display:block;font-size:15px;line-height:1.2;font-weight:900;margin-bottom:3px}#${MINI_ID} small{display:block;color:rgba(255,255,255,.84);font-size:11px;line-height:1.35}#${MINI_ID} .cta{color:#FDCA01;font-size:12px;font-weight:900;white-space:nowrap}
@media(max-width:420px){#${MAIN_ID}{min-height:195px!important;padding:21px 98px 21px 20px!important}#${MAIN_ID}:before{right:16px;width:62px;height:62px;border-radius:18px;font-size:29px}#${MAIN_ID} strong{font-size:24px!important}#${MAIN_ID} small{font-size:13px!important}#${MINI_ID}{width:calc(100% - 24px);margin-left:12px;margin-right:12px;padding:13px 14px}}
`;
    document.head.appendChild(style);
  }

  function activeBottomLabel() {
    const candidates = [...document.querySelectorAll('button,a,[role="button"]')].filter(isVisible);
    const labels = ['Início','Crédito','Aprenda','Serviços','Shop'];
    for (const el of candidates) {
      const text = (el.textContent || '').trim();
      if (!labels.includes(text)) continue;
      const selected = el.getAttribute('aria-current') === 'page' || el.getAttribute('aria-selected') === 'true' || /active|selected|current/i.test(el.className || '');
      if (selected) return text;
    }
    const homeTools = document.querySelector('.home-personal-tools');
    if (isVisible(homeTools)) return 'Início';
    return '';
  }

  function removeMini() { document.getElementById(MINI_ID)?.remove(); }

  function mountMini(label) {
    if (!['Crédito','Aprenda','Serviços'].includes(label)) { removeMini(); return; }
    let mini = document.getElementById(MINI_ID);
    if (!mini) {
      mini = document.createElement('button');
      mini.id = MINI_ID;
      mini.type = 'button';
      mini.innerHTML = '<span class="copy"><strong>Quer faturar criando conteúdo?</strong><small>Conheça o Creator Ads da Crediti.</small></span><span class="cta">Ser Creator ›</span>';
      mini.addEventListener('click', openCreator);
    }
    const visibleHeadings = [...document.querySelectorAll('h1,h2,h3')].filter(isVisible);
    const heading = visibleHeadings.find(h => (h.textContent || '').trim().toLowerCase().startsWith(label.toLowerCase()));
    if (heading?.parentElement) { heading.insertAdjacentElement('afterend', mini); return; }
    const root = document.getElementById('root');
    const firstVisibleSection = root ? [...root.children].find(isVisible) : null;
    if (firstVisibleSection) firstVisibleSection.appendChild(mini); else if (root) root.appendChild(mini);
  }

  function sync() {
    injectStyles();
    const main = document.getElementById(MAIN_ID);
    const homeTools = document.querySelector('.home-personal-tools');
    const homeVisible = isVisible(homeTools);
    if (main) {
      main.style.setProperty('display', homeVisible ? 'grid' : 'none', 'important');
      main.setAttribute('aria-hidden', homeVisible ? 'false' : 'true');
    }
    const active = activeBottomLabel();
    if (homeVisible || active === 'Início' || active === 'Shop') removeMini(); else mountMini(active);
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