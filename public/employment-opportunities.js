(() => {
  const SECTION_ID = 'crediti-employment-opportunities';
  const STYLE_ID = 'crediti-employment-opportunities-style';
  const LINKS = [
    {
      title: 'Vagas e oportunidades 1',
      description: 'Acesse o grupo e acompanhe vagas compartilhadas no WhatsApp.',
      url: 'https://chat.whatsapp.com/K5dgwoZuUob6ezkbTkeJWb'
    },
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
    try {
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (opened) opened.opener = null;
    } catch {
      window.location.href = url;
    }
  }

  function removeSection() {
    document.getElementById(SECTION_ID)?.remove();
  }

  function ensureSection() {
    const groups = document.querySelector('.service-groups');
    const existing = document.getElementById(SECTION_ID);

    if (!groups || !groups.isConnected) {
      if (existing) existing.remove();
      return;
    }

    const parent = groups.parentNode;
    if (!parent || !parent.isConnected) {
      if (existing) existing.remove();
      return;
    }

    if (existing) {
      if (existing.parentNode !== parent) {
        existing.remove();
      } else {
        return;
      }
    }

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
  }

  let scheduled = false;
  function scheduleEnsure() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      ensureSection();
    });
  }

  scheduleEnsure();
  window.addEventListener('popstate', scheduleEnsure);
  window.addEventListener('hashchange', scheduleEnsure);
  window.addEventListener('pageshow', scheduleEnsure);

  const root = document.getElementById('root');
  if (root) {
    const observer = new MutationObserver(scheduleEnsure);
    observer.observe(root, { childList: true, subtree: true });
  } else {
    removeSection();
  }
})();
