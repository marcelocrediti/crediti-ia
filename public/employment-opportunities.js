(() => {
  const SECTION_ID = 'crediti-employment-opportunities';
  const STYLE_ID = 'crediti-employment-opportunities-style';
  const DESENROLA_CARD_ID = 'crediti-desenrola-brasil';
  const DESENROLA_URL = 'https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/renegociacao-de-dividas';
  const LINKS = [
    {
      title: 'Vagas e oportunidades 2',
      description: 'Entre no grupo e veja novas oportunidades de trabalho pelo WhatsApp.',
      url: 'https://chat.whatsapp.com/GZemMLWmnhiCKJH4VtdoR4?s=sw&p=a&mlu=4&ilr=4'
    }
  ];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${SECTION_ID}{margin:26px 0 8px;padding:20px;border:1px solid #e7e7e2;border-radius:22px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.04)}
      #${SECTION_ID} .employment-head{display:grid;gap:6px;margin-bottom:14px}
      #${SECTION_ID} .employment-head small{font-size:10px;font-weight:900;letter-spacing:.05em;color:#7c6410}
      #${SECTION_ID} .employment-head h2{margin:0;font-size:24px;line-height:1.12;color:#171717}
      #${SECTION_ID} .employment-head p{margin:0;color:#5b5b5b;font-size:13px;line-height:1.5}
      #${SECTION_ID} .employment-list{display:grid;gap:10px}
      #${SECTION_ID} .employment-card{width:100%;display:grid;grid-template-columns:46px 1fr auto;align-items:center;gap:11px;padding:13px;border:1px solid #e3e3de;border-radius:16px;background:#fafaf8;color:#171717;text-align:left;font:inherit;cursor:pointer}
      #${SECTION_ID} .employment-icon{width:46px;height:46px;border-radius:14px;background:#FDCA01;display:grid;place-items:center;font-weight:900;font-size:20px}
      #${SECTION_ID} .employment-copy{display:grid;gap:3px;min-width:0}
      #${SECTION_ID} .employment-copy strong{font-size:13px}
      #${SECTION_ID} .employment-copy small{font-size:11px;line-height:1.4;color:#666}
      #${SECTION_ID} .employment-arrow{font-size:24px;font-weight:800}
      #${SECTION_ID} .employment-note{margin:12px 0 0;font-size:10.5px;line-height:1.45;color:#777}
    `;
    document.head.appendChild(style);
  }

  function openExternal(url) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) opened.opener = null;
  }

  function unmount() {
    document.getElementById(SECTION_ID)?.remove();
  }

  function mount() {
    const groups = document.querySelector('.service-groups');
    if (!groups || !groups.isConnected || !groups.parentNode?.isConnected) {
      unmount();
      return false;
    }

    const parent = groups.parentNode;
    const existing = document.getElementById(SECTION_ID);
    if (existing?.parentNode === parent) return true;
    existing?.remove();

    injectStyles();
    const section = document.createElement('section');
    section.id = SECTION_ID;
    section.innerHTML = `
      <div class="employment-head">
        <small>TRABALHO E OPORTUNIDADES</small>
        <h2>Encontre seu emprego</h2>
        <p>Acesse grupos e canais com vagas disponíveis e encontre novas oportunidades de trabalho.</p>
      </div>
      <div class="employment-list"></div>
      <p class="employment-note">As vagas são divulgadas por terceiros nos grupos do WhatsApp. A Crediti apenas facilita o acesso aos canais e não participa dos processos seletivos.</p>
    `;

    const list = section.querySelector('.employment-list');
    LINKS.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'employment-card';
      button.innerHTML = `
        <span class="employment-icon" aria-hidden="true">↗</span>
        <span class="employment-copy">
          <strong>${item.title}</strong>
          <small>${item.description}</small>
        </span>
        <span class="employment-arrow" aria-hidden="true">›</span>
      `;
      button.addEventListener('click', () => openExternal(item.url));
      list.appendChild(button);
    });

    parent.insertBefore(section, groups);
    return true;
  }

  function getConsumerGrid() {
    const groups = Array.from(document.querySelectorAll('.service-group'));
    const consumerGroup = groups.find((group) => {
      const title = group.querySelector('h2')?.textContent?.trim().toLowerCase();
      return title === 'consumidor';
    });
    return consumerGroup?.querySelector('.service-grid') || null;
  }

  function mountDesenrola() {
    const grid = getConsumerGrid();
    const existing = document.getElementById(DESENROLA_CARD_ID);

    if (!grid || !grid.isConnected) {
      existing?.remove();
      return false;
    }

    if (existing?.parentNode === grid) return true;

    const alreadyNative = Array.from(grid.querySelectorAll('.service-card strong')).some((title) =>
      /desenrola brasil/i.test(title.textContent || '')
    );
    if (alreadyNative) {
      existing?.remove();
      return true;
    }

    existing?.remove();

    const button = document.createElement('button');
    button.type = 'button';
    button.id = DESENROLA_CARD_ID;
    button.className = 'service-card';
    button.setAttribute('data-search-key', 'service-desenrola-brasil');
    button.setAttribute('aria-label', 'Acessar Desenrola Brasil');
    button.innerHTML = `
      <strong>Desenrola Brasil</strong>
      <small>Consulte as regras e os canais oficiais para renegociar dívidas.</small>
      <span>ACESSAR ›</span>
    `;
    button.addEventListener('click', () => openExternal(DESENROLA_URL));
    grid.appendChild(button);
    return true;
  }

  let desenrolaFrame = 0;
  function scheduleDesenrola() {
    if (desenrolaFrame) return;
    desenrolaFrame = requestAnimationFrame(() => {
      desenrolaFrame = 0;
      mountDesenrola();
    });
  }

  const desenrolaObserver = new MutationObserver(scheduleDesenrola);
  desenrolaObserver.observe(document.documentElement, { childList: true, subtree: true });
  scheduleDesenrola();

  window.CreditiEmploymentOpportunities = { mount, unmount };
  window.CreditiDesenrolaBrasil = { mount: mountDesenrola };
})();