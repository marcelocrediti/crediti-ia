(() => {
  const clean = () => {
    const card = document.getElementById('crediti-creator-ads-card');
    if (!card) return;
    card.querySelector('.k')?.remove();
  };
  document.addEventListener('DOMContentLoaded', clean, { once: true });
  new MutationObserver(clean).observe(document.documentElement, { childList: true, subtree: true });
  clean();
})();
