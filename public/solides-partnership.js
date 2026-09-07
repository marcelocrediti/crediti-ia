(() => {
  const CARD_ID = 'crediti-solides-partnership';
  const STYLE_ID = 'crediti-solides-partnership-style';
  const TARGET_URL = 'https://indiquei.app/VOYKWVZ';

  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${CARD_ID}{margin:12px 0;padding:16px;border:1px solid #e5e5df;border-radius:18px;background:#fff;color:#171717;box-shadow:0 6px 18px rgba(0,0,0,.035)}
      #${CARD_ID} .solides-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
      #${CARD_ID} .solides-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:#f5f1f5;color:#7f137c;font-size:10.5px;font-weight:900;letter-spacing:.02em}
      #${CARD_ID} .solides-brand{font-size:12px;font-weight:800;color:#7f137c}
      #${CARD_ID} h3{margin:0 0 6px;font-size:18px;line-height:1.2}
      #${CARD_ID} p{margin:0 0 12px;font-size:12.5px;line-height:1.5;color:#5f5f5f}
      #${CARD_ID} .solides-points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px;padding:0;list-style:none}
      #${CARD_ID} .solides-points li{padding:9px 10px;border-radius:12px;background:#faf9f6;font-size:11px;line-height:1.35;font-weight:700;color:#333}
      #${CARD_ID} .solides-action{width:100%;border:0;border-radius:14px;background:#FDCA01;color:#111;padding:12px 14px;font:inherit;font-size:12px;font-weight:900;cursor:pointer}
      #${CARD_ID} .solides-note{display:block;margin-top:9px;font-size:9.8px;line-height:1.4;color:#777}
    `;
    document.head.appendChild(style);
  }

  function openPartner() {
    const opened = window.open(TARGET_URL, '_blank', 'noopener,noreferrer');
    if (opened) opened.opener = null;
  }

  function removeCard() {
    document.getElementById(CARD_ID)?.remove();
  }

  function findBusinessGroup(groups) {
    const candidates = [...groups.children];
    return candidates.find((node) => {
      const text = normalize(node.textContent);
      return text.includes('empresa') && text.includes('solu');
    }) || null;
  }

  function ensureCard() {
    const groups = document.querySelector('.service-groups');
    if (!groups || !groups.isConnected) {
      removeCard();
      return;
    }

    const targetGroup = findBusinessGroup(groups);
    if (!targetGroup || !targetGroup.isConnected) {
      removeCard();
      return;
    }

    const existing = document.getElementById(CARD_ID);
    if (existing && existing.parentNode === targetGroup) return;
    if (existing) existing.remove();

    injectStyles();

    const card = document.createElement('article');
    card.id = CARD_ID;
    card.innerHTML = `
      <div class="solides-top">
        <span class="solides-badge">GESTÃO DE PESSOAS E RH</span>
        <span class="solides-brand">Sólides</span>
      </div>
      <h3>Gestão de pessoas para sua empresa</h3>
      <p>Conheça soluções para RH e Departamento Pessoal, incluindo recrutamento, ponto digital, folha, benefícios e gestão de pessoas.</p>
      <ul class="solides-points">
        <li>RH e Departamento Pessoal</li>
        <li>Recrutamento e seleção</li>
        <li>Ponto e folha digital</li>
        <li>Benefícios corporativos</li>
      </ul>
      <button type="button" class="solides-action">CONHECER A SÓLIDES</button>
      <small class="solides-note">Você será direcionado para uma página externa da Sólides. Produtos, contratação, preços, suporte e condições são de responsabilidade da empresa parceira.</small>
    `;
    card.querySelector('.solides-action')?.addEventListener('click', openPartner);
    targetGroup.appendChild(card);
  }

  let scheduled = false;
  function scheduleEnsure() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      ensureCard();
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
  }
})();
