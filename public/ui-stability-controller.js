(() => {
  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
  ];
  const GRAN_URL = "https://mais.app/IvPIAQ";
  const GRAN_LOGO = "https://www.grancursosonline.com.br/assets/images/logo-gran.svg";

  const openSafely = (url) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  };

  const addGranStyles = () => {
    if (document.getElementById("crediti-gran-styles")) return;
    const style = document.createElement("style");
    style.id = "crediti-gran-styles";
    style.textContent = `
      .crediti-learning-hero-carousel{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;margin-bottom:18px;overscroll-behavior-x:contain}.crediti-learning-hero-carousel::-webkit-scrollbar{display:none}.crediti-learning-hero-carousel>.bank-photo-hero{flex:0 0 100%;width:100%;margin-bottom:0;scroll-snap-align:start}.crediti-gran-hero{background:linear-gradient(135deg,#fff 0%,#f6f7f9 100%)!important;border:1px solid #e5e7eb!important}.crediti-gran-hero::after{background:linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.9) 62%,rgba(255,255,255,.35) 100%)!important}.crediti-gran-hero .gran-hero-art{position:absolute;right:18px;top:20px;z-index:2;width:126px;height:86px;border-radius:18px;background:#fff;display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.10);padding:14px}.crediti-gran-hero .gran-hero-art img{width:100%;height:100%;object-fit:contain}.crediti-gran-hero>div:not(.gran-hero-art){position:relative;z-index:3;width:min(70%,430px)}.crediti-gran-hero h1,.crediti-gran-hero p{color:#111!important}.crediti-gran-hero .eyebrow{color:#c91f2c!important}.crediti-gran-card .career-brand{background:#fff!important}.crediti-gran-logo{width:142px!important;min-width:142px!important;padding:12px!important}.crediti-gran-logo img{width:100%;height:100%;object-fit:contain;display:block}.crediti-gran-card .career-brand>b{display:none}.crediti-gran-card .career-copy small,.crediti-gran-card .career-copy span{color:#8d1720}.crediti-gran-card{border-left:4px solid #e5232f!important}@media(max-width:430px){.crediti-gran-hero .gran-hero-art{width:104px;height:72px;right:12px;top:16px;padding:10px}.crediti-gran-hero>div:not(.gran-hero-art){width:72%}}
    `;
    document.head.appendChild(style);
  };

  const addGranExperience = () => {
    const hero = document.querySelector(".learning-photo-hero:not(.crediti-gran-hero)");
    if (!hero) return;
    addGranStyles();

    let carousel = hero.closest(".crediti-learning-hero-carousel");
    if (!carousel) {
      carousel = document.createElement("div");
      carousel.className = "crediti-learning-hero-carousel";
      hero.parentNode.insertBefore(carousel, hero);
      carousel.appendChild(hero);
    }

    if (!carousel.querySelector(".crediti-gran-hero")) {
      const granHero = document.createElement("section");
      granHero.className = "bank-photo-hero learning-photo-hero crediti-gran-hero";
      granHero.innerHTML = `<div class="gran-hero-art"><img src="${GRAN_LOGO}" alt="Gran" decoding="async"></div><div><span class="eyebrow">CONCURSOS PÚBLICOS</span><h1>Seu próximo cargo pode começar aqui.</h1><p>Prepare-se para concursos, OAB e carreiras públicas com o Gran.</p></div>`;
      granHero.addEventListener("click", () => openSafely(GRAN_URL));
      carousel.appendChild(granHero);
    }

    const partners = document.querySelector(".education-partner-carousel");
    if (partners && !partners.querySelector(".crediti-gran-card")) {
      const card = document.createElement("button");
      card.className = "career-card gran crediti-gran-card";
      card.innerHTML = `<div class="career-brand"><span class="career-logo-frame crediti-gran-logo"><img src="${GRAN_LOGO}" alt="Gran" decoding="async"></span><b>Gran</b></div><div class="career-copy"><small>CONCURSOS, OAB E CARREIRAS PÚBLICAS</small><strong>Estude para transformar aprovação em conquista</strong><span>CONHECER CURSOS ›</span></div>`;
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
    document.documentElement.classList.toggle("crediti-home-visible", Boolean(document.querySelector(".home-personal-tools")));
    SHOP_LINKS.forEach(([selector, url, key]) => {
      document.querySelectorAll(selector).forEach((button) => {
        if (button.dataset[key] === "1") return;
        button.dataset[key] = "1";
        button.addEventListener("click", (event) => {
          event.preventDefault(); event.stopPropagation(); openSafely(url);
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
    requestAnimationFrame(() => { queued = false; keepShopLinksCorrect(); });
  };
  schedule();
  new MutationObserver(schedule).observe(document.getElementById("root") || document.body, { childList:true, subtree:true });
})();
