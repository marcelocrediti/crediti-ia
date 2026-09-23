(() => {
  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
  ];

  const GRAN_URL = "https://mais.app/IvPIAQ";
  const GRAN_LOGO = "https://www.grancursosonline.com.br/assets/img/email/logo-.png";

  const openSafely = (url) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  };

  const addGranStyles = () => {
    if (document.getElementById("crediti-gran-styles")) return;

    const style = document.createElement("style");
    style.id = "crediti-gran-styles";
    style.textContent = `
      .crediti-learning-hero-shell{position:relative;margin-bottom:22px}
      .crediti-learning-hero-carousel{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;overscroll-behavior-x:contain;margin-bottom:0}
      .crediti-learning-hero-carousel::-webkit-scrollbar{display:none}
      .crediti-learning-hero-carousel>.bank-photo-hero{flex:0 0 100%;width:100%;margin-bottom:0;scroll-snap-align:start;scroll-snap-stop:always}
      .crediti-carousel-dots{display:flex;justify-content:center;gap:7px;padding-top:10px}
      .crediti-carousel-dots button{appearance:none;border:0;padding:0;width:7px;height:7px;border-radius:999px;background:#d3d3ce;transition:width .2s ease,background .2s ease}
      .crediti-carousel-dots button.active{width:22px;background:#FDCA01}
      .crediti-gran-hero{position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,#fff 0%,#f6f7f9 100%)!important;border:1px solid #e5e7eb!important;cursor:pointer}
      .crediti-gran-hero::after{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(90deg,rgba(255,255,255,.99) 0%,rgba(255,255,255,.92) 62%,rgba(255,255,255,.45) 100%)!important;z-index:1!important}
      .crediti-gran-hero .gran-hero-art{position:absolute;right:18px;top:20px;z-index:3;width:152px;height:92px;border-radius:18px;background:#fff;display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.10);padding:12px}
      .crediti-gran-hero .gran-hero-art img{width:100%;height:100%;object-fit:contain;display:block}
      .crediti-gran-hero .gran-hero-copy{position:relative;z-index:4;width:min(69%,430px)}
      .crediti-gran-hero h1,.crediti-gran-hero p{color:#111!important}
      .crediti-gran-hero .eyebrow{color:#c91f2c!important}
      .crediti-gran-card{border-left:4px solid #e5232f!important}
      .crediti-gran-card .career-brand{background:#fff!important}
      .crediti-gran-card .career-logo-frame{width:180px!important;min-width:180px!important;max-width:180px!important;padding:12px!important;background:#fff!important}
      .crediti-gran-card .career-logo-frame img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important}
      .crediti-gran-card .career-brand>b{display:none!important}
      .crediti-gran-card .career-copy small,.crediti-gran-card .career-copy span{color:#8d1720!important}
      @media(max-width:430px){
        .crediti-gran-hero .gran-hero-art{width:122px;height:76px;right:12px;top:16px;padding:9px}
        .crediti-gran-hero .gran-hero-copy{width:70%}
        .crediti-gran-card .career-logo-frame{width:160px!important;min-width:160px!important;max-width:160px!important}
      }
    `;
    document.head.appendChild(style);
  };

  const ensureLogoLoads = (img) => {
    if (!img || img.dataset.creditiGranLogoReady === "1") return;
    img.dataset.creditiGranLogoReady = "1";
    img.loading = "eager";
    img.decoding = "async";
    try { img.fetchPriority = "high"; } catch {}
    img.addEventListener("error", () => {
      img.removeAttribute("src");
      img.alt = "Gran Cursos Online";
      img.parentElement?.classList.add("gran-logo-fallback");
      if (img.parentElement) img.parentElement.textContent = "GRAN CURSOS ONLINE";
    }, { once: true });
  };

  const installCarouselDots = (shell, carousel) => {
    let dots = shell.querySelector(".crediti-carousel-dots");
    if (!dots) {
      dots = document.createElement("div");
      dots.className = "crediti-carousel-dots";
      dots.setAttribute("aria-label", "Navegação do carrossel de formação");
      shell.appendChild(dots);
    }

    const slides = [...carousel.children].filter((el) => el.classList.contains("bank-photo-hero"));
    dots.innerHTML = "";
    slides.forEach((slide, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", index === 0 ? "Ver faculdades" : "Ver concursos públicos");
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        carousel.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      });
      dots.appendChild(dot);
    });

    const updateDots = () => {
      const index = Math.round(carousel.scrollLeft / Math.max(carousel.clientWidth, 1));
      [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === index));
    };
    carousel.addEventListener("scroll", updateDots, { passive: true });

    if (carousel.dataset.creditiAutoCarousel !== "1" && slides.length > 1) {
      carousel.dataset.creditiAutoCarousel = "1";
      let index = 0;
      let pausedUntil = 0;
      const pause = () => { pausedUntil = Date.now() + 9000; };
      carousel.addEventListener("pointerdown", pause, { passive: true });
      carousel.addEventListener("touchstart", pause, { passive: true });
      setInterval(() => {
        if (!document.body.contains(carousel) || Date.now() < pausedUntil) return;
        const currentSlides = [...carousel.children].filter((el) => el.classList.contains("bank-photo-hero"));
        if (currentSlides.length < 2) return;
        index = (index + 1) % currentSlides.length;
        carousel.scrollTo({ left: currentSlides[index].offsetLeft, behavior: "smooth" });
      }, 5200);
    }
  };

  const addGranExperience = () => {
    const hero = document.querySelector(".learning-photo-hero:not(.crediti-gran-hero)");
    if (!hero) return;

    addGranStyles();

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

    let granHero = carousel.querySelector(".crediti-gran-hero");
    if (!granHero) {
      granHero = document.createElement("section");
      granHero.className = "bank-photo-hero learning-photo-hero crediti-gran-hero";
      granHero.innerHTML = `
        <div class="gran-hero-art"><img src="${GRAN_LOGO}" alt="Gran Cursos Online"></div>
        <div class="gran-hero-copy">
          <span class="eyebrow">CONCURSOS PÚBLICOS</span>
          <h1>Seu próximo cargo pode começar aqui.</h1>
          <p>Prepare-se para concursos, OAB e carreiras públicas com o Gran.</p>
        </div>`;
      granHero.addEventListener("click", () => openSafely(GRAN_URL));
      carousel.appendChild(granHero);
    }
    ensureLogoLoads(granHero.querySelector("img"));
    installCarouselDots(shell, carousel);

    const partners = document.querySelector(".education-partner-carousel");
    if (partners) {
      let card = partners.querySelector(".crediti-gran-card");
      if (!card) {
        card = document.createElement("button");
        card.type = "button";
        card.className = "career-card gran crediti-gran-card";
        card.innerHTML = `
          <div class="career-brand">
            <span class="career-logo-frame"><img src="${GRAN_LOGO}" alt="Gran Cursos Online"></span>
            <b>Gran Cursos Online</b>
          </div>
          <div class="career-copy">
            <small>CONCURSOS, OAB E CARREIRAS PÚBLICAS</small>
            <strong>Prepare-se para conquistar sua aprovação</strong>
            <span>CONHECER CURSOS ›</span>
          </div>`;
        card.addEventListener("click", () => openSafely(GRAN_URL));
        partners.appendChild(card);
      }
      ensureLogoLoads(card.querySelector("img"));
    }
  };

  const moveCreditinScoreTip = () => {
    const tip = document.querySelector(".score-feature-card");
    const heading = document.querySelector(".financial-learning-heading");
    if (!tip || !heading || tip.dataset.creditiScoreMoved === "1") return;
    heading.insertAdjacentElement("afterend", tip);
    tip.dataset.creditiScoreMoved = "1";
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
