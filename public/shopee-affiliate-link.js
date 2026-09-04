(() => {
  const SHOPEE_AFFILIATE_URL = 'https://s.shopee.com.br/1BM5bJUfXF';

  function bindShopeeLink() {
    const card = document.querySelector('.shopee-store-card');
    if (!card) return;
    const button = [...card.querySelectorAll('button')].find((el) => /ABRIR SHOPEE/i.test(el.textContent || ''));
    if (!button || button.dataset.shopeeAffiliateBound === '1') return;
    button.dataset.shopeeAffiliateBound = '1';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.open(SHOPEE_AFFILIATE_URL, '_blank', 'noopener,noreferrer');
    }, true);
  }

  bindShopeeLink();
  new MutationObserver(bindShopeeLink).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
})();
