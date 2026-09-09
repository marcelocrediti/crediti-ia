(() => {
  const HOME_CLASS = 'crediti-home-visible';
  const CREATOR_ID = 'crediti-creator-ads-card';
  const LOJAS_REDE_URL = 'https://acesse.vc/Sai99P3i3v07';
  let scheduled = false;
  let observer = null;

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function firstVisible(selector) {
    return [...document.querySelectorAll(selector)].find(isVisible) || null;
  }

  function fixLojasRedeLink() {
    const button = document.querySelector('.lojasrede-store-card button');
    if (!button || button.dataset.creditiLojasRedeFixed === '1') return;

    button.dataset.creditiLojasRedeFixed = '1';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const opened = window.open(LOJAS_REDE_URL, '_blank', 'noopener,noreferrer');
      if (opened) opened.opener = null;
    });
  }

  function reconcile() {
    scheduled = false;

    const homeTools = firstVisible('.home-personal-tools');
    const serviceGroups = firstVisible('.service-groups');
    const creator = document.getElementById(CREATOR_ID);
    const homeVisible = !!homeTools;
    const servicesVisible = !!serviceGroups;

    document.documentElement.classList.toggle(HOME_CLASS, homeVisible);

    if (creator && homeTools?.parentNode) {
      const correctParent = homeTools.parentNode;
      const alreadyCorrect = creator.parentNode === correctParent && creator.previousElementSibling === homeTools;
      if (!alreadyCorrect) homeTools.insertAdjacentElement('afterend', creator);
    }

    fixLojasRedeLink();

    if (servicesVisible) {
      window.CreditiEmploymentOpportunities?.mount?.();
      window.CreditiSolidesPartnership?.mount?.();
    } else {
      window.CreditiEmploymentOpportunities?.unmount?.();
      window.CreditiSolidesPartnership?.unmount?.();
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(reconcile);
  }

  function start() {
    const root = document.getElementById('root');
    if (!root) return;

    observer?.disconnect();
    observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });

    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);
    window.addEventListener('pageshow', schedule);
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();