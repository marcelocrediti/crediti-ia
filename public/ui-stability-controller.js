(() => {
  const HOME_CLASS = 'crediti-home-visible';
  const CREATOR_ID = 'crediti-creator-ads-card';
  let scheduled = false;
  let observer = null;

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function placeCreatorCard(homeVisible) {
    const creator = document.getElementById(CREATOR_ID);
    const homeTools = document.querySelector('.home-personal-tools');

    if (!creator || !homeVisible || !homeTools || !homeTools.parentNode) {
      document.documentElement.classList.remove(HOME_CLASS);
      return;
    }

    const correctParent = homeTools.parentNode;
    const correctPrevious = homeTools;
    if (creator.parentNode !== correctParent || creator.previousElementSibling !== correctPrevious) {
      homeTools.insertAdjacentElement('afterend', creator);
    }

    document.documentElement.classList.add(HOME_CLASS);
  }

  function reconcile() {
    scheduled = false;

    const homeTools = document.querySelector('.home-personal-tools');
    const serviceGroups = document.querySelector('.service-groups');
    const homeVisible = isVisible(homeTools);
    const servicesVisible = isVisible(serviceGroups);

    placeCreatorCard(homeVisible);

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