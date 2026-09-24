(() => {
  const UPP_URL = "https://apretailer.com.br/click/6ab43ae52bfa810f9a64b789/179925/360419/app-crediti";
  const GRAN_URL = "https://mais.app/IvPIAQ";
  const GRAN_LOGO = "https://www.grancursosonline.com.br/assets/img/email/logo-.png";
  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
  ];

  const HOME_CREDITS = [
    { id: "upp-refinanciamento", name: "Refinanciamento CLT com troco", partner: "Up.p", logoText: "Up.p", action: "SIMULAR REFINANCIAMENTO", url: UPP_URL },
    { id: "grandino-clt", name: "Consignado CLT", partner: "Grandino Bank", logo: "/partners/grandino.png", action: "SIMULAR CRÉDITO CLT", url: "https://crediti.startcapital.app/credit/cltctps" },
    { id: "inss", name: "Consignado INSS", partner: "Consig Mais", logo: "/partners/consiga-mais.png", action: "SIMULAR CONSIGNADO", url: "https://apretailer.com.br/click/6aa4af912bfa8159945c68c9/184987/360419/app_crediti" },
    { id: "emprestimo-pessoal", name: "Empréstimo pessoal", partner: "SuperSim", logo: "/partners/supersim.webp", action: "SIMULAR MEU EMPRÉSTIMO", url: "https://apretailer.com.br/click/6aa4af912bfa816ab47e8c90/184363/360419/app_crediti" },
    { id: "grandino-fgts", name: "Antecipação do FGTS", partner: "Grandino Bank", logo: "/partners/grandino.png", action: "SIMULAR FGTS", url: "https://crediti.startcapital.app/credit/fgts" },
    { id: "bpc", name: "Consignado BPC / LOAS", partner: "Banco BRB", logo: "/partners/brb.jpeg", action: "SIMULAR SEU CRÉDITO", url: "https://solution.consig360.com.br/self-hire/EkCwaEb" },
    { id: "cartao", name: "Empréstimo no cartão de crédito", partner: "GYROO SaaS", logo: "/partners/gyroo.png", action: "SIMULAR SEU CRÉDITO", url: "https://crediti.emprestimodisponivel.com.br/?l=EW9XMSWNPMR8&u=uCwu5cFx4n6t" },
    { id: "energia", name: "Crédito na conta de luz", partner: "Crefaz", logo: "/partners/crefaz.jpeg", action: "SIMULAR SEU CRÉDITO", url: "https://crediti.startcapital.app/credit/cdccontadeluz" },
    { id: "cartao-credito", name: "Cartão de crédito", partner: "Consumidor Positivo", logo: "/partners/consumidor-positivo.svg", action: "SOLICITAR CARTÃO", url: "https://apretailer.com.br/click/6aa4af922bfa816ac97f6e34/185301/360419/app_crediti" },
    { id: "pravaler", name: "Financiamento estudantil", partner: "Pravaler", logo: "/partners/pravaler.svg", action: "SIMULAR FINANCIAMENTO", url: "https://afiliado.saberemrede.net/checkout-pravaler/313855?sponsor=805324&e=1" }
  ];

  const openSafely = (url) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  };

  const installStyles = () => {
    if (document.getElementById("crediti-structure-fix-style")) return;
    const style = document.createElement("style");
    style.id = "crediti-structure-fix-style";
    style.textContent = `
      .direct-card.direct-upp-portabilidade{width:100%!important;min-width:0!important;box-sizing:border-box!important;border:1px solid #dedfe2!important;border-left:4px solid #FDCA01!important;background:#fff!important;overflow:visible!important}
      .direct-upp-portabilidade .direct-secondary-actions{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:12px 0 4px!important;padding:10px!important;border:1px solid #e7e9ec!important;border-radius:12px!important;background:#f5f6f8!important}
      .direct-upp-portabilidade .direct-secondary-actions>small{display:block!important;margin:0!important;font-size:9px!important;line-height:1.25!important;color:#68707b!important}
      .direct-upp-portabilidade .direct-secondary-actions>button{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;width:100%!important;min-width:0!important;min-height:58px!important;box-sizing:border-box!important;margin:0!important;padding:10px 12px!important;border:1px solid #dfe2e6!important;border-radius:10px!important;background:#fff!important;color:#171d2e!important;text-align:left!important;white-space:normal!important;overflow:visible!important}
      .direct-upp-portabilidade .direct-secondary-actions>button>span{display:grid!important;gap:3px!important;min-width:0!important;flex:1 1 auto!important}
      .direct-upp-portabilidade .direct-secondary-actions strong{font-size:12px!important;line-height:1.2!important;overflow-wrap:normal!important;word-break:normal!important}
      .direct-upp-portabilidade .direct-secondary-actions button small{font-size:9px!important;line-height:1.3!important;color:#686f78!important;overflow-wrap:normal!important;word-break:normal!important}
      .direct-upp-portabilidade .direct-secondary-actions button b{flex:0 0 auto!important;font-size:18px!important}
      .direct-grid .favorite-toggle,.direct-grid .compare-select,.compare-tray{display:none!important}
      .product-strip-logo img,.direct-logo img,.career-logo-frame img,.partner-notice-logo img{display:block!important;object-fit:contain!important;object-position:center!important;max-width:100%!important;max-height:100%!important}
      .home-credit-section .product-strip.crediti-source-strip{display:grid!important}
      .crediti-home-credit-carousel{display:none!important;height:0!important;overflow:hidden;border:1px solid #e1e4e8;border-radius:15px;background:#fff;touch-action:pan-x;position:relative}
      .crediti-home-credit-track{width:100%;transform:translateY(0);will-change:transform}
      .crediti-home-credit-track.crediti-moving{transition:transform .42s cubic-bezier(.22,.61,.36,1)}
      .crediti-home-credit-card{appearance:none;width:100%;height:92px;min-height:92px;padding:9px 11px;display:grid;grid-template-columns:66px minmax(0,1fr);grid-template-rows:auto auto;gap:1px 10px;align-items:center;border:0;border-bottom:1px solid #eceef1;border-radius:0;background:#fff;color:#171d2e;text-align:left;box-sizing:border-box}
      .crediti-home-credit-card .product-strip-logo{grid-row:1/3;width:66px;height:58px;padding:7px;display:grid;place-items:center;border:1px solid #eceef1;border-radius:11px;background:#fff;overflow:hidden;box-sizing:border-box}
      .crediti-home-credit-card .product-strip-logo img{width:100%;height:100%;object-fit:contain;display:block}
      .crediti-home-credit-card .product-strip-brand{font-size:20px;font-weight:600;letter-spacing:-.04em;color:#111}
      .crediti-home-credit-card>strong{align-self:end;color:#171d2e;font-size:13px;font-weight:600;line-height:1.18;overflow-wrap:anywhere}
      .crediti-home-credit-card .product-strip-action{grid-column:2;justify-self:start;align-self:start;margin-top:3px;color:#665800;font-size:8px;font-weight:600;line-height:1.15;text-transform:uppercase}
      .crediti-home-credit-card[data-credit="inss"] .product-strip-logo{background:#4b2587;border-color:#4b2587}
      .crediti-grandino-direct-grid{margin-top:12px}
      .crediti-grandino-direct-grid .direct-card{border:1px solid #e3e5e8!important;background:#fff!important}
      .crediti-grandino-direct-grid .direct-logo{background:#fff!important}
      .crediti-grandino-direct-grid .primary-action{background:#FDCA01!important;color:#111!important}
      .crediti-learning-hero-shell{position:relative;margin-bottom:22px}
      .crediti-learning-hero-carousel{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;overscroll-behavior-x:contain;margin-bottom:0}
      .crediti-learning-hero-carousel::-webkit-scrollbar{display:none}
      .crediti-learning-hero-carousel>.bank-photo-hero{flex:0 0 100%;width:100%;margin-bottom:0;scroll-snap-align:start;scroll-snap-stop:always}
      .crediti-carousel-dots{display:flex;justify-content:center;gap:7px;padding-top:10px}
      .crediti-carousel-dots button{appearance:none;border:0;padding:0;width:7px;height:7px;border-radius:999px;background:#d3d3ce}
      .crediti-carousel-dots button.active{width:22px;background:#FDCA01}
      .crediti-gran-hero{position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,#fff 0%,#f6f7f9 100%)!important;border:1px solid #e5e7eb!important;cursor:pointer}
      .crediti-gran-hero:after{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(90deg,rgba(255,255,255,.99),rgba(255,255,255,.9) 62%,rgba(255,255,255,.45))!important;z-index:1!important}
      .crediti-gran-hero .gran-hero-art{position:absolute;right:18px;top:20px;z-index:3;width:152px;height:92px;border-radius:18px;background:#fff;display:grid;place-items:center;padding:12px}
      .crediti-gran-hero .gran-hero-art img{width:100%;height:100%;object-fit:contain;display:block}
      .crediti-gran-hero .gran-hero-copy{position:relative;z-index:4;width:min(69%,430px)}
      .crediti-gran-card{border-left:4px solid #e5232f!important}
      .crediti-gran-card .career-brand{background:#fff!important}.crediti-gran-card .career-brand>b{display:none!important}
      .crediti-gran-card .career-logo-frame{width:min(100%,180px)!important;height:48px!important;padding:8px!important;background:#fff!important}
      @media(max-width:430px){.crediti-gran-hero .gran-hero-art{width:122px;height:76px;right:12px;top:16px;padding:9px}.crediti-gran-hero .gran-hero-copy{width:70%}.direct-upp-portabilidade .direct-secondary-actions>button{min-height:62px!important;padding:10px!important}.direct-upp-portabilidade .direct-secondary-actions strong{font-size:11px!important}.direct-upp-portabilidade .direct-secondary-actions button small{font-size:8.5px!important}.crediti-home-credit-carousel{height:352px}.crediti-home-credit-card{height:88px;min-height:88px}.crediti-home-credit-card .product-strip-logo{height:54px}}
    `;
    document.head.appendChild(style);
  };

  const boostLogos = (scope = document) => scope.querySelectorAll(".product-strip img,.direct-card img,.career-card img,.partner-notice-logo img,.finanzero-alternative img,.crediti-home-credit-carousel img").forEach((img) => {
    img.loading = "eager";
    img.decoding = "async";
    try { img.fetchPriority = "high"; } catch {}
  });

  let homeCarouselTimer = 0;
  let homeCarouselPausedUntil = 0;
  let homeSwipeStartY = null;
  let homeSwipeMoved = false;

  const makeHomeCreditCard = (item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "crediti-home-credit-card product-strip-card";
    button.dataset.credit = item.id;
    button.innerHTML = `<div class="product-strip-logo">${item.logo ? `<img src="${item.logo}" alt="${item.partner}" loading="eager">` : `<span class="product-strip-brand">${item.logoText || item.partner}</span>`}</div><strong>${item.name}</strong><span class="product-strip-action">${item.action} ›</span>`;
    button.addEventListener("click", (event) => {
      if (homeSwipeMoved) {
        event.preventDefault();
        homeSwipeMoved = false;
        return;
      }
      openSafely(item.url);
    });
    return button;
  };

  const getCreditTrack = () => document.querySelector(".crediti-home-credit-track");

  const rotateHomeCreditsNext = () => {
    const track = getCreditTrack();
    if (!track || track.dataset.moving === "1" || track.children.length < 2) return;
    const first = track.firstElementChild;
    const rowHeight = first?.getBoundingClientRect().height || 92;
    track.dataset.moving = "1";
    track.classList.add("crediti-moving");
    track.style.transform = `translateY(-${rowHeight}px)`;
    window.setTimeout(() => {
      if (!track.isConnected || !first) return;
      track.classList.remove("crediti-moving");
      track.style.transform = "translateY(0)";
      track.appendChild(first);
      track.dataset.moving = "0";
    }, 440);
  };

  const rotateHomeCreditsPrev = () => {
    const track = getCreditTrack();
    if (!track || track.dataset.moving === "1" || track.children.length < 2) return;
    const last = track.lastElementChild;
    const rowHeight = last?.getBoundingClientRect().height || 92;
    track.dataset.moving = "1";
    track.classList.remove("crediti-moving");
    track.insertBefore(last, track.firstElementChild);
    track.style.transform = `translateY(-${rowHeight}px)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      track.classList.add("crediti-moving");
      track.style.transform = "translateY(0)";
      window.setTimeout(() => {
        track.classList.remove("crediti-moving");
        track.dataset.moving = "0";
      }, 440);
    }));
  };

  const startHomeCreditAutoplay = () => {
    if (homeCarouselTimer) window.clearInterval(homeCarouselTimer);
    homeCarouselTimer = window.setInterval(() => {
      const carousel = document.querySelector(".crediti-home-credit-carousel");
      if (!carousel || Date.now() < homeCarouselPausedUntil) return;
      rotateHomeCreditsNext();
    }, 5000);
  };

  const ensureHomeCreditCarousel = () => {
    const section = document.querySelector(".modern-home .home-credit-section");
    const sourceStrip = section?.querySelector(".product-strip:not(.crediti-home-credit-carousel)");
    if (!section || !sourceStrip) return;
    sourceStrip.classList.add("crediti-source-strip");
    let carousel = section.querySelector(".crediti-home-credit-carousel");
    if (!carousel) {
      carousel = document.createElement("div");
      carousel.className = "crediti-home-credit-carousel";
      carousel.setAttribute("aria-label", "Créditos em destaque. Deslize para cima ou para baixo.");
      const track = document.createElement("div");
      track.className = "crediti-home-credit-track";
      HOME_CREDITS.forEach((item) => track.appendChild(makeHomeCreditCard(item)));
      carousel.appendChild(track);
      sourceStrip.insertAdjacentElement("afterend", carousel);
      carousel.addEventListener("touchstart", (event) => {
        homeSwipeStartY = event.touches?.[0]?.clientY ?? null;
        homeSwipeMoved = false;
        homeCarouselPausedUntil = Date.now() + 7000;
      }, { passive: true });
      carousel.addEventListener("touchmove", (event) => {
        if (homeSwipeStartY === null) return;
        const currentY = event.touches?.[0]?.clientY;
        if (typeof currentY === "number" && Math.abs(currentY - homeSwipeStartY) > 12) homeSwipeMoved = true;
      }, { passive: true });
      carousel.addEventListener("touchend", (event) => {
        if (homeSwipeStartY === null) return;
        const endY = event.changedTouches?.[0]?.clientY ?? homeSwipeStartY;
        const delta = endY - homeSwipeStartY;
        homeSwipeStartY = null;
        if (Math.abs(delta) < 28) return;
        homeCarouselPausedUntil = Date.now() + 7000;
        if (delta < 0) rotateHomeCreditsNext(); else rotateHomeCreditsPrev();
      }, { passive: true });
      startHomeCreditAutoplay();
    }
    boostLogos(carousel);
  };

  const syncUppDirectCard = () => {
    const card = document.querySelector(".direct-card.direct-upp-portabilidade");
    if (!card) return;
    const title = card.querySelector("h2");
    const copy = card.querySelector(".direct-card-copy");
    const action = card.querySelector(".primary-action");
    if (title) title.textContent = "Refinanciamento CLT com troco";
    if (copy) copy.textContent = "Já tem Consignado CLT ativo na Up.p? A partir da 1ª parcela paga, consulte novas condições e veja se há troco disponível.";
    if (action) action.textContent = "SIMULAR REFINANCIAMENTO";
  };

  const makeGrandinoDirectCard = (id, name, url, buttonText) => {
    const article = document.createElement("article");
    article.className = `direct-card crediti-grandino-${id}`;
    article.dataset.creditiInjected = "grandino-direct";
    article.innerHTML = `<div class="direct-logo"><img src="/partners/grandino.png" alt="Grandino Bank" loading="eager"></div><div><small>Grandino Bank</small><h2>${name}</h2></div><p class="direct-card-copy">Consulte as condições disponíveis e continue no ambiente da instituição responsável.</p><button class="primary-action" type="button">${buttonText}</button>`;
    article.querySelector(".primary-action")?.addEventListener("click", () => openSafely(url));
    return article;
  };

  const ensureGrandinoDirectProducts = () => {
    const main = document.querySelector("main.modern-page");
    const grid = main?.querySelector(".direct-grid");
    if (!main || !grid) return;
    const activeFilter = (main.querySelector(".credit-filter-bar button.active")?.textContent || "Todos").trim().toLowerCase();
    const shouldShow = activeFilter === "todos" || activeFilter === "trabalhador";
    let extra = main.querySelector(".crediti-grandino-direct-grid");
    if (!shouldShow) {
      if (extra) extra.style.display = "none";
      return;
    }
    if (!extra) {
      extra = document.createElement("div");
      extra.className = "direct-grid crediti-grandino-direct-grid";
      extra.dataset.creditiInjected = "grandino-direct";
      extra.appendChild(makeGrandinoDirectCard("clt", "Consignado CLT", "https://crediti.startcapital.app/credit/cltctps", "SIMULAR CRÉDITO CLT"));
      extra.appendChild(makeGrandinoDirectCard("fgts", "Antecipação do FGTS", "https://crediti.startcapital.app/credit/fgts", "SIMULAR FGTS"));
      grid.insertAdjacentElement("afterend", extra);
    }
    extra.style.display = "grid";
    boostLogos(extra);
  };

  const ensureGranExperience = () => {
    const hero = document.querySelector(".learning-photo-hero:not(.crediti-gran-hero)");
    const partners = document.querySelector(".education-partner-carousel");
    if (!hero && !partners) return;
    if (hero) {
      let carousel = hero.closest(".crediti-learning-hero-carousel");
      let shell = hero.closest(".crediti-learning-hero-shell");
      if (!carousel) {
        shell = document.createElement("div");
        shell.className = "crediti-learning-hero-shell";
        carousel = document.createElement("div");
        carousel.className = "crediti-learning-hero-carousel";
        hero.parentNode.insertBefore(shell, hero);
        shell.appendChild(carousel);
        carousel.appendChild(hero);
      }
      if (!shell) {
        shell = document.createElement("div");
        shell.className = "crediti-learning-hero-shell";
        carousel.parentNode.insertBefore(shell, carousel);
        shell.appendChild(carousel);
      }
      let gran = carousel.querySelector(".crediti-gran-hero");
      if (!gran) {
        gran = document.createElement("section");
        gran.className = "bank-photo-hero learning-photo-hero crediti-gran-hero";
        gran.innerHTML = `<div class="gran-hero-art"><img src="${GRAN_LOGO}" alt="Gran Cursos Online" loading="eager"></div><div class="gran-hero-copy"><span class="eyebrow">CONCURSOS PÚBLICOS</span><h1>Seu próximo cargo pode começar aqui.</h1><p>Prepare-se para concursos, OAB e carreiras públicas com o Gran.</p></div>`;
        gran.addEventListener("click", () => openSafely(GRAN_URL));
        carousel.appendChild(gran);
      }
      let dots = shell.querySelector(".crediti-carousel-dots");
      if (!dots) {
        dots = document.createElement("div");
        dots.className = "crediti-carousel-dots";
        shell.appendChild(dots);
      }
      const slides = [...carousel.children].filter((el) => el.classList.contains("bank-photo-hero"));
      if (dots.children.length !== slides.length) {
        dots.innerHTML = "";
        slides.forEach((slide, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          if (index === 0) dot.classList.add("active");
          dot.onclick = () => carousel.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
          dots.appendChild(dot);
        });
      }
      if (carousel.dataset.creditiHeroAuto !== "1" && slides.length > 1) {
        carousel.dataset.creditiHeroAuto = "1";
        let paused = 0;
        const pause = () => { paused = Date.now() + 9000; };
        carousel.addEventListener("touchstart", pause, { passive: true });
        carousel.addEventListener("pointerdown", pause, { passive: true });
        window.setInterval(() => {
          if (!document.body.contains(carousel) || Date.now() < paused) return;
          const currentSlides = [...carousel.children].filter((el) => el.classList.contains("bank-photo-hero"));
          const index = Math.round(carousel.scrollLeft / Math.max(carousel.clientWidth, 1));
          const next = currentSlides[(index + 1) % currentSlides.length];
          if (next) carousel.scrollTo({ left: next.offsetLeft, behavior: "smooth" });
        }, 5200);
      }
    }
    if (partners) {
      let card = partners.querySelector(".crediti-gran-card");
      if (!card) {
        card = document.createElement("button");
        card.type = "button";
        card.className = "career-card gran crediti-gran-card";
        card.innerHTML = `<div class="career-brand"><span class="career-logo-frame"><img src="${GRAN_LOGO}" alt="Gran Cursos Online" loading="eager"></span><b>Gran Cursos Online</b></div><div class="career-copy"><small>CONCURSOS, OAB E CARREIRAS PÚBLICAS</small><strong>Prepare-se para conquistar sua aprovação</strong><span>CONHECER CURSOS ›</span></div>`;
        card.addEventListener("click", () => openSafely(GRAN_URL));
        partners.appendChild(card);
      }
    }
    boostLogos(document);
  };

  const keepShopLinksCorrect = () => SHOP_LINKS.forEach(([selector, url, key]) => document.querySelectorAll(selector).forEach((button) => {
    if (button.dataset[key] === "1") return;
    button.dataset[key] = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openSafely(url);
    });
  }));

  const syncCurrentScreen = () => {
    const home = Boolean(document.querySelector(".modern-home"));
    document.documentElement.classList.toggle("crediti-home-visible", home);
    if (home) ensureHomeCreditCarousel();
    if (document.querySelector(".direct-grid")) {
      syncUppDirectCard();
      document.querySelectorAll(".crediti-grandino-direct-grid").forEach((element) => element.remove());
    }
    if (document.querySelector(".learning-photo-hero,.education-partner-carousel")) ensureGranExperience();
    if (document.querySelector(".shop-real-page,.shop-page")) keepShopLinksCorrect();
    boostLogos(document);
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncCurrentScreen();
    });
  };

  installStyles();
  schedule();
  const root = document.getElementById("root");
  if (root) new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === "childList" && mutation.addedNodes.length)) schedule();
  }).observe(root, { childList: true, subtree: true });
  window.addEventListener("pageshow", schedule, { passive: true });
  // stability marker: .home-personal-tools
})();