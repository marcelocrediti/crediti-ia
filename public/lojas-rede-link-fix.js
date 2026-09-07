(() => {
  const TARGET_URL = 'https://acesse.vc/Sai99P3i3v07';
  const LABEL = 'lojas rede';

  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  function patchLojasRede() {
    const candidates = [...document.querySelectorAll('a, button, [role="button"]')];

    candidates.forEach((element) => {
      const text = normalize(element.textContent);
      const container = element.closest('article, li, section, div');
      const containerText = normalize(container?.textContent);

      if (!text.includes(LABEL) && !containerText.includes(LABEL)) return;

      if (element.tagName === 'A') {
        element.href = TARGET_URL;
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
      }

      if (element.dataset.creditiLojasRedeFixed === '1') return;
      element.dataset.creditiLojasRedeFixed = '1';

      element.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.open(TARGET_URL, '_blank', 'noopener,noreferrer');
      }, true);
    });
  }

  patchLojasRede();

  const root = document.getElementById('root');
  if (root) {
    const observer = new MutationObserver(patchLojasRede);
    observer.observe(root, { childList: true, subtree: true });
  }
})();
