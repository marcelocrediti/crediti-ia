(() => {
  const OVERLAY_ID = 'crediti-creator-ads-overlay';
  const STYLE_ID = 'crediti-creator-ads-hero-style';
  const HERO_ID = 'crediti-creator-ads-hero';
  const phrases = [
    'Aqui sua criatividade vale dinheiro',
    'Crie vídeos e transforme ideias em renda',
    'Seu conteúdo pode virar oportunidade',
    'Mostre seu talento e participe das campanhas',
    'Grave, envie e concorra',
    'A sua criatividade pode render de verdade',
    'Participe das campanhas e fature com a Crediti',
    'Seu vídeo pode ser o escolhido',
    'Quem cria também pode ganhar'
  ];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${OVERLAY_ID} .creator-hero{margin:0 0 16px;padding:18px;border-radius:20px;background:#111;color:#fff;overflow:hidden;position:relative}
#${OVERLAY_ID} .creator-hero:after{content:'';position:absolute;right:-34px;top:-34px;width:110px;height:110px;border-radius:50%;background:#FDCA01;opacity:.12}
#${OVERLAY_ID} .creator-hero-badge{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;background:#FDCA01;color:#111;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.03em}
#${OVERLAY_ID} .creator-hero h3{margin:12px 0 6px;font-size:21px;line-height:1.08;font-weight:900;max-width:400px}
#${OVERLAY_ID} .creator-hero-sub{margin:0;color:rgba(255,255,255,.82);font-size:12px;line-height:1.5;max-width:450px}
#${OVERLAY_ID} .creator-hero-rotator{margin-top:15px;min-height:62px;padding:13px 14px;border:1px solid rgba(255,255,255,.14);border-radius:15px;background:rgba(255,255,255,.07);display:flex;align-items:center}
#${OVERLAY_ID} .creator-hero-phrase{margin:0;font-size:15px;line-height:1.3;font-weight:800;transition:opacity .25s ease,transform .25s ease}
#${OVERLAY_ID} .creator-hero-phrase.is-changing{opacity:0;transform:translateY(4px)}
#${OVERLAY_ID} .creator-hero-dots{display:flex;gap:5px;margin-top:10px}
#${OVERLAY_ID} .creator-hero-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.28);transition:width .2s ease,background .2s ease}
#${OVERLAY_ID} .creator-hero-dot.is-active{width:18px;border-radius:99px;background:#FDCA01}
@media(max-width:480px){#${OVERLAY_ID} .creator-hero{padding:16px}#${OVERLAY_ID} .creator-hero h3{font-size:19px}#${OVERLAY_ID} .creator-hero-rotator{min-height:58px}}
@media(prefers-reduced-motion:reduce){#${OVERLAY_ID} .creator-hero-phrase{transition:none}}
`;
    document.head.appendChild(style);
  }

  function mountHero() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay || document.getElementById(HERO_ID)) return false;
    const body = overlay.querySelector('.body');
    const tabs = overlay.querySelector('.tabs');
    if (!body || !tabs) return false;

    injectStyles();
    const hero = document.createElement('section');
    hero.id = HERO_ID;
    hero.className = 'creator-hero';
    hero.setAttribute('aria-label', 'Oportunidade Creator Ads Crediti');
    hero.innerHTML = `
      <span class="creator-hero-badge">Creator Ads Crediti</span>
      <h3>Aqui sua criatividade vale dinheiro</h3>
      <p class="creator-hero-sub">Participe das campanhas da Crediti, envie seus vídeos e aproveite a chance de faturar com seu conteúdo.</p>
      <div class="creator-hero-rotator" aria-live="polite">
        <p class="creator-hero-phrase">${phrases[0]}</p>
      </div>
      <div class="creator-hero-dots" aria-hidden="true">${phrases.map((_,i)=>`<span class="creator-hero-dot${i===0?' is-active':''}"></span>`).join('')}</div>
    `;
    body.insertBefore(hero, tabs);

    const phrase = hero.querySelector('.creator-hero-phrase');
    const dots = [...hero.querySelectorAll('.creator-hero-dot')];
    let index = 0;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      window.setInterval(() => {
        if (!document.body.contains(hero)) return;
        phrase.classList.add('is-changing');
        window.setTimeout(() => {
          index = (index + 1) % phrases.length;
          phrase.textContent = phrases[index];
          dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
          phrase.classList.remove('is-changing');
        }, 230);
      }, 3600);
    }
    return true;
  }

  if (!mountHero()) {
    const observer = new MutationObserver(() => {
      if (mountHero()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
