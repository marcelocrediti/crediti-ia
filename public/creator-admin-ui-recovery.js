(() => {
  const TOKEN_KEY = 'crediti_creator_admin_token';

  function recoverLoginIfNeeded() {
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    if (!loginView || !appView) return;

    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const appHidden = appView.classList.contains('hidden');
    const loginHidden = loginView.classList.contains('hidden');

    // Nunca permita que as duas telas fiquem ocultas. Se a sessão foi
    // descartada durante uma falha de carregamento, o login volta na hora.
    if (appHidden && (loginHidden || !hasToken)) {
      loginView.classList.remove('hidden');
    }
  }

  function start() {
    const appView = document.getElementById('appView');
    if (!appView) return;

    recoverLoginIfNeeded();

    // Observa somente a classe da tela administrativa. Não observa o DOM global.
    const observer = new MutationObserver(recoverLoginIfNeeded);
    observer.observe(appView, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('pageshow', recoverLoginIfNeeded);
    window.addEventListener('storage', event => {
      if (event.key === TOKEN_KEY) recoverLoginIfNeeded();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
