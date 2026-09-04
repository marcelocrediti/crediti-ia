(() => {
  const PAGE_ID = 'crediti-creator-ads-page';
  const BOX_ID = 'creatorCampaigns';
  const STYLE_ID = 'creator-ads-campaign-organizer-style';
  const TOKEN_KEY = 'crediti_creator_ads_public_token_v1';
  const BASE = 'https://vgdtywdpywezrwlrsawq.supabase.co';
  const KEY = 'sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER';
  let busy = false;

  const esc = (v) => String(v ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const money = (v) => Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const dateOnly = (v) => {
    if (!v) return 'Não informado';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('pt-BR');
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
#${PAGE_ID} #${BOX_ID} .campaign.creator-organized{padding:0;overflow:hidden;border-radius:22px;background:#fff;border:1px solid #e5e5e1;box-shadow:0 8px 24px rgba(0,0,0,.05)}
#${PAGE_ID} .creator-campaign-head{padding:18px;background:linear-gradient(135deg,#fff0e4,#ffe1cb);border-bottom:1px solid #f1d9c7}
#${PAGE_ID} .creator-campaign-head small{display:block;margin-bottom:7px;font-size:10px;line-height:1;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#a84d25}
#${PAGE_ID} .creator-campaign-head h3{margin:0;color:#151515;font-size:21px;line-height:1.12;letter-spacing:-.02em}
#${PAGE_ID} .creator-campaign-body{padding:16px;display:grid;gap:14px}
#${PAGE_ID} .creator-campaign-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#${PAGE_ID} .creator-meta{min-width:0;padding:12px;border:1px solid #e8e8e3;border-radius:14px;background:#fafaf8}
#${PAGE_ID} .creator-meta span{display:block;margin-bottom:4px;color:#747474;font-size:9px;font-weight:900;letter-spacing:.05em;text-transform:uppercase}
#${PAGE_ID} .creator-meta strong{display:block;color:#151515;font-size:13px;line-height:1.3;word-break:break-word}
#${PAGE_ID} .creator-meta.prize{background:#fff7d7;border-color:#efd77b}
#${PAGE_ID} .creator-meta.total{background:#f7f7f5}
#${PAGE_ID} .creator-info{padding:14px;border:1px solid #e8e8e3;border-radius:16px;background:#fff}
#${PAGE_ID} .creator-info h4{margin:0 0 7px;color:#151515;font-size:13px;line-height:1.2}
#${PAGE_ID} .creator-info p{margin:0!important;color:#565656!important;font-size:13px!important;line-height:1.58!important;white-space:pre-wrap}
#${PAGE_ID} .creator-info.brief{background:#fafaf8}
#${PAGE_ID} .creator-info.brief h4{display:flex;align-items:center;gap:7px}
#${PAGE_ID} .creator-info.brief h4:before{content:'✓';width:22px;height:22px;flex:0 0 22px;display:grid;place-items:center;border-radius:50%;background:#FDCA01;color:#111;font-size:11px;font-weight:900}
#${PAGE_ID} .creator-organized .upload-box{margin:0 16px 16px;padding:14px;border:1px dashed #cfcfc9;border-radius:16px;background:#fff}
#${PAGE_ID} .creator-organized .upload-box>b{display:block;margin-bottom:4px;font-size:17px;line-height:1.2}
#${PAGE_ID} .creator-organized .upload-box>p{margin:0 0 10px!important;font-size:12px!important;line-height:1.45!important;color:#666!important}
@media(max-width:420px){
  #${PAGE_ID} .creator-campaign-head{padding:16px}
  #${PAGE_ID} .creator-campaign-head h3{font-size:19px}
  #${PAGE_ID} .creator-campaign-body{padding:14px;gap:11px}
  #${PAGE_ID} .creator-campaign-meta{grid-template-columns:1fr 1fr;gap:8px}
  #${PAGE_ID} .creator-meta{padding:10px}
  #${PAGE_ID} .creator-meta strong{font-size:12px}
  #${PAGE_ID} .creator-info{padding:12px}
  #${PAGE_ID} .creator-info p{font-size:12.5px!important}
}
`;
    document.head.appendChild(s);
  }

  async function getCampaigns() {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token) return [];
    const r = await fetch(`${BASE}/rest/v1/rpc/creator_ads_public_campaigns`, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_token: token })
    });
    if (!r.ok) return [];
    return await r.json();
  }

  function meta(label, value, cls='') {
    return `<div class="creator-meta ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  }

  function organizeCard(card, campaign) {
    if (!card || !campaign || card.dataset.organized === '1') return;
    const upload = card.querySelector('.upload-box');
    if (!upload) return;

    const winners = Math.max(1, Number(campaign.numero_vencedores || 1));
    const prizePerWinner = Number(campaign.premio || 0);
    const totalPrize = prizePerWinner * winners;
    const winnerLabel = winners === 1 ? '1 vencedor' : `${winners} vencedores`;
    const period = `${dateOnly(campaign.inicio)} até ${dateOnly(campaign.fim)}`;
    const bonus = campaign.bonus_ativo
      ? meta('Bônus', `${money(campaign.bonus_valor)}${campaign.bonus_meta_views ? ` por ${Number(campaign.bonus_meta_views).toLocaleString('pt-BR')} visualizações` : ''}`)
      : '';

    const description = campaign.descricao
      ? `<section class="creator-info"><h4>Descrição da campanha</h4><p>${esc(campaign.descricao)}</p></section>`
      : '';

    const briefing = campaign.briefing
      ? `<section class="creator-info brief"><h4>Briefing do vídeo</h4><p>${esc(campaign.briefing)}</p></section>`
      : '<section class="creator-info brief"><h4>Briefing do vídeo</h4><p>Leia as regras da campanha e produza o vídeo conforme o tema informado.</p></section>';

    const shell = document.createElement('div');
    shell.innerHTML = `
      <header class="creator-campaign-head">
        <small>Campanha Creator Ads</small>
        <h3>${esc(campaign.titulo || 'Campanha')}</h3>
      </header>
      <div class="creator-campaign-body">
        <div class="creator-campaign-meta">
          ${meta('Período', period)}
          ${meta('Prêmio por vencedor', money(prizePerWinner), 'prize')}
          ${meta('Vencedores', winnerLabel)}
          ${winners > 1 ? meta('Total da premiação', money(totalPrize), 'total') : ''}
          ${bonus}
        </div>
        ${description}
        ${briefing}
      </div>`;

    card.innerHTML = '';
    while (shell.firstChild) card.appendChild(shell.firstChild);
    card.appendChild(upload);
    card.classList.add('creator-organized');
    card.dataset.organized = '1';
  }

  async function organize() {
    if (busy) return;
    const box = document.getElementById(BOX_ID);
    if (!box) return;
    const cards = [...box.querySelectorAll('.campaign')];
    if (!cards.length || cards.every(c => c.dataset.organized === '1')) return;
    busy = true;
    try {
      const campaigns = await getCampaigns();
      cards.forEach((card, i) => organizeCard(card, campaigns[i]));
    } finally {
      busy = false;
    }
  }

  function init() {
    injectStyles();
    organize();
    new MutationObserver(() => window.requestAnimationFrame(organize))
      .observe(document.body, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
