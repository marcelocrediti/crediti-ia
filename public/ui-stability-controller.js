(() => {
  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
  ];

  const GRAN_URL = "https://mais.app/IvPIAQ";

  const openSafely = (url) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  };

  const addGranStyles = () => {
    if (document.getElementById("crediti-gran-styles")) return;
    const style = document.createElement("style");
    style.id = "crediti-gran-styles";
    style.textContent = `
      .crediti-learning-hero-carousel{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;margin-bottom:18px}.crediti-learning-hero-carousel::-webkit-scrollbar{display:none}.crediti-learning-hero-carousel>.bank-photo-hero{min-width:100%;margin-bottom:0;scroll-snap-align:start}.crediti-gran-hero{background:linear-gradient(135deg,#0b1627,#173861)!important}.crediti-gran-hero::after{background:linear-gradient(90deg,rgba(5,12,24,.96) 0%,rgba(5,12,24,.76) 56%,rgba(5,12,24,.22) 100%)!important}.crediti-gran-hero .gran-hero-art{position:absolute;right:18px;top:20px;z-index:1;width:112px;height:112px;border-radius:24px;background:#fff;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.24)}.crediti-gran-hero .gran-hero-art svg{width:86px;height:auto}.crediti-gran-hero>div:not(.gran-hero-art){width:min(72%,430px)}.crediti-gran-card .career-brand{background:#fff!important}.crediti-gran-logo{width:142px!important;min-width:142px!important}.crediti-gran-logo svg{width:100%;height:100%;display:block}.crediti-gran-card .career-brand>b{display:none}.crediti-gran-card .career-copy small,.crediti-gran-card .career-copy span{color:#665500}.crediti-gran-card{border-left:4px solid #fdca01!important}@media(max-width:430px){.crediti-gran-hero .gran-hero-art{width:88px;height:88px;right:14px;top:16px}.crediti-gran-hero .gran-hero-art svg{width:68px}.crediti-gran-hero>div:not(.gran-hero-art){width:76%}}
    `;
    document.head.appendChild(style);
  };

  const granLogoSvg = () => `
    <svg viewBox="0 0 220 72" role="img" aria-label="Gran Cursos Online">
      <rect width="220" height="72" rx="12" fill="#ffffff"/>
      <g transform="translate(12 12)">
        <path d="M5 24C5 11 15 2 29 2c8 0 14 3 19 8l-8 8c-3-3-6-5-11-5-7 0-12 5-12 12s5 12 13 12c3 0 6-.7 8-2v-5H28V20h22v22c-6 4-13 6-21 6C15 48 5 38 5 24Z" fill="#e5232f"/>
        <path d="M57 13h11v5c3-4 7-6 12-6v11c-1-.2-2-.3-3-.3-4 0-7 1.5-9 4V47H57V13Zm28 0h11v4c3-3 7-5 12-5 9 0 15 6 15 16v19h-11V30c0-5-2-8-7-8-4 0-7 2-9 5v20H85V13Zm44 0h11v4c3-3 7-5 12-5 9 0 15 6 15 16v19h-11V30c0-5-2-8-7-8-4 0-7 2-9 5v20h-11V13Z" fill="#182b49"/>
        <text x="171" y="28" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#182b49">CURSOS</text>
        <text x="171" y="41" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#e5232f">ONLINE</text>
      </g>
    </svg>`;

  const addGranExperience = () => {
    const hero = document.querySelector(".learning-photo-hero");
    if (!hero || document.querySelector(".crediti-gran-card")) return;

    addGranStyles();

    const carousel = document.createElement("div");
    carousel.className = "crediti-learning-hero-carousel";
    hero.parentNode.insertBefore(carousel, hero);
    carousel.appendChild(hero);

    const granHero = document.createElement("section");
    granHero.className = "bank-photo-hero learning-photo-hero crediti-gran-hero";
    granHero.innerHTML = `<div class="gran-hero-art">${granLogoSvg()}</div><div><span class="eyebrow">SEU PRÓXIMO OBJETIVO</span><h1>Seu concurso também pode começar aqui.</h1><p>Na Crediti você encontra preparação para transformar estudo em oportunidade.</p></div>`;
    granHero.addEventListener("click", () => openSafely(GRAN_URL));
    carousel.appendChild(granHero);

    const partners = document.querySelector(".education-partner-carousel");
    if (partners) {
      const card = document.createElement("button");
      card.className = "career-card gran crediti-gran-card";
      card.innerHTML = `<div class="career-brand"><span class="career-logo-frame crediti-gran-logo">${granLogoSvg()}</span><b>Gran Cursos Online</b></div><div class="career-copy"><small>CONCURSOS, OAB E PREPARATÓRIOS</small><strong>Prepare-se para conquistar sua aprovação</strong><span>CONHECER CURSOS ›</span></div>`;
      card.addEventListener("click", () => openSafely(GRAN_URL));
      partners.appendChild(card);
    }
  };

  const moveCreditinScoreTip = () => {
    const all = [...document.querySelectorAll("section,article,div")];
    const tip = all.find((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      return text.includes("DICA DO CREDITIN") && text.includes("Score baixo") && text.includes("MONTAR MEU PLANO");
    });
    if (!tip || tip.dataset.creditiScoreMoved === "1") return;

    let card = tip;
    while (card.parentElement && card.parentElement !== document.body) {
      const text = (card.textContent || "").replace(/\s+/g, " ").trim();
      if (text.includes("DICA DO CREDITIN") && text.includes("MONTAR MEU PLANO") && card.children.length <= 8) break;
      card = card.parentElement;
    }

    const headings = [...document.querySelectorAll("h1,h2,h3,h4,strong")];
    const financialHeading = headings.find((el) => /educa[cç][aã]o financeira/i.test(el.textContent || ""));
    const target = financialHeading?.closest("section,article,div") || financialHeading?.parentElement;
    if (!target || !target.parentElement || card === target || card.contains(target)) return;

    target.parentElement.insertBefore(card, target);
    card.dataset.creditiScoreMoved = "1";
  };

  const keepShopLinksCorrect = () => {
    document.documentElement.classList.toggle(
      "crediti-home-visible",
      Boolean(document.querySelector(".home-personal-tools"))
    );

    SHOP_LINKS.forEach(([selector, url, key]) => {
      document.querySelectorAll(selector).forEach((button) => {
        if (button.dataset[key] === "1") return;
        button.dataset[key] = "1";
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openSafely(url);
        });
      });
    });

    addGranExperience();
    moveCreditinScoreTip();
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      keepShopLinksCorrect();
    });
  };

  schedule();
  new MutationObserver(schedule).observe(document.getElementById("root") || document.body, {
    childList: true,
    subtree: true
  });
})();
