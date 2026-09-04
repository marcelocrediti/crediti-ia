(() => {
  const FORM_ID = 'creatorForm';
  const BUTTON_TEXT = 'Enviar pré-cadastro';

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== FORM_ID) return;

    const button = form.querySelector('button[type="submit"]');
    if (form.dataset.submitting === 'true') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    form.dataset.submitting = 'true';
    if (button) {
      button.disabled = true;
      button.textContent = 'Enviando...';
      button.setAttribute('aria-busy', 'true');
      button.style.opacity = '0.72';
      button.style.cursor = 'wait';
    }

    window.setTimeout(() => {
      if (!document.body.contains(form)) return;
      if (localStorage.getItem('crediti_creator_ads_public_token_v1')) return;
      form.dataset.submitting = 'false';
      if (button) {
        button.disabled = false;
        button.textContent = BUTTON_TEXT;
        button.removeAttribute('aria-busy');
        button.style.opacity = '';
        button.style.cursor = '';
      }
    }, 12000);
  }, true);
})();
