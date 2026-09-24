(() => {
  const UPP_URL = "https://apretailer.com.br/click/6ab43ae52bfa810f9a64b789/179925/360419/app-crediti";
  const GRAN_URL = "https://mais.app/IvPIAQ";
  const GRAN_LOGO = "https://www.grancursosonline.com.br/assets/img/email/logo-.png";

  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
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
      #root .app,
      #root .app button,
      #root .app input,
      #root .app select,
      #root .app textarea { font-weight: 400; }
      #root .app h1,
      #root .app h2,
      #root .app h3,
      #root .app strong,
      #root .app b { font-weight: 600 !important; }
      #root .app .eyebrow,
      #root .app button { font-weight: 600 !important; }

      .product-strip-card.product-strip-upp-portabilidade {
        border-left: 3px solid #FDCA01 !important;
        background: #fffdf3 !important;
      }
      .product-strip-upp-portabilidade .product-strip-brand {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        color: #171d2e !important;
        font-size: 17px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
      }

      .direct-card.direct-upp-portabilidade {
        border: 1px solid #dedfe2 !important;
        border-left: 4px solid #FDCA01 !important;
        background: #fff !important;
      }
      .direct-upp-portabilidade .direct-logo {
        min-width: 0 !important;
        overflow: hidden !important;
      }
      .direct-upp-portabilidade .direct-logo strong {
        max-width: 100% !important;
        font-size: 18px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }
      .direct-upp-portabilidade h2 {
        font-size: 18px !important;
        line-height: 1.18 !important;
      }
      .direct-upp-portabilidade .direct-card-copy {
        font-size: 11px !important;
        line-height: 1.42 !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions {
        width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        padding: 8px !important;
        overflow: hidden !important;
        border: 1px solid #e7e9ec !important;
        border-radius: 12px !important;
        background: #f7f8f9 !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions > small {
        display: block !important;
        margin: 0 0 6px !important;
        color: #6b7078 !important;
        font-size: 8px !important;
        line-height: 1.25 !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions > button {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 50px !important;
        margin-top: 6px !important;
        padding: 8px 9px !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 14px !important;
        align-items: center !important;
        gap: 7px !important;
        overflow: hidden !important;
        border: 1px solid #e2e4e7 !important;
        border-radius: 10px !important;
        background: #fff !important;
        color: #171d2e !important;
        text-align: left !important;
        white-space: normal !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions > button > span {
        min-width: 0 !important;
        display: grid !important;
        gap: 2px !important;
        overflow: hidden !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions strong {
        min-width: 0 !important;
        font-size: 11px !important;
        line-height: 1.2 !important;
        overflow-wrap: anywhere !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions button small {
        min-width: 0 !important;
        color: #686f78 !important;
        font-size: 9px !important;
        line-height: 1.28 !important;
        overflow-wrap: anywhere !important;
      }
      .direct-upp-portabilidade .direct-secondary-actions button b {
        justify-self: end !important;
        font-size: 16px !important;
      }

      .product-strip-logo img,
      .direct-logo img,
      .career-logo-frame img,
      .partner-notice-logo img {
        object-fit: contain !important;
        object-position: center !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }

      .crediti-gran-card {
        flex: 0 0 min(78vw, 316px) !important;
        width: min(78vw, 316px) !important;
        min-width: min(78vw, 316px) !important;
      }
      .crediti-gran-card .career-logo-frame {
        width: min(100%, 164px) !important;
        height: 44px !important;
      }
      .crediti-gran-card .career-brand > b { display: none !important; }
      .crediti-gran-card .career-logo-frame img {
        width: 100% !important;
        height: 36px !important;
        object-fit: contain !important;
      }
    `;
    document.head.appendChild(style);
  };

  const preloadVisibleLogos = () => {
    document.querySelectorAll(
      ".product-strip img, .direct-card img, .career-card img, .partner-notice-logo img"
    ).forEach((img) => {
      img.loading = "eager";
      img.decoding = "async";
      try { img.fetchPriority = "high"; } catch {}
    });
  };

  const ensureUppHomeHighlight = () => {
    const strip = document.querySelector(".product-strip");
    if (!strip) return;

    let card = strip.querySelector(".product-strip-upp-portabilidade");
    if (!card) {
      card = document.createElement("button");
      card.type = "button";
      card.className = "product-strip-card product-strip-upp-portabilidade";
      card.dataset.creditiInjected = "upp-home";
      card.innerHTML = `
        <div class="product-strip-logo"><span class="product-strip-brand">Up.p</span></div>
        <strong>Portabilidade CLT com troco</strong>
        <span class="product-strip-action">SIMULAR PORTABILIDADE ›</span>
      `;
      card.addEventListener("click", () => openSafely(UPP_URL));
    }

    if (strip.firstElementChild !== card) {
      strip.insertBefore(card, strip.firstElementChild);
    }

    const cards = [...strip.querySelectorAll(":scope > .product-strip-card")];
    cards.slice(4).forEach((item) => {
      if (item.dataset.creditiInjected === "upp-home") return;
      item.style.display = "none";
    });
  };

  const prioritizeUppDirect = () => {
    const grid = document.querySelector(".direct-grid");
    const upp = grid?.querySelector(".direct-upp-portabilidade");
    if (grid && upp && grid.firstElementChild !== upp) {
      grid.insertBefore(upp, grid.firstElementChild);
    }
  };

  const ensureGranCard = () => {
    const partners = document.querySelector(".education-partner-carousel");
    if (!partners || partners.querySelector(".crediti-gran-card")) return;

    const card = document.createElement("button");
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
      </div>
    `;
    card.addEventListener("click", () => openSafely(GRAN_URL));
    partners.appendChild(card);
  };

  const keepShopLinksCorrect = () => {
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
  };

  const applyFixes = () => {
    installStyles();
    document.documentElement.classList.toggle(
      "crediti-home-visible",
      Boolean(document.querySelector(".home-personal-tools"))
    );
    ensureUppHomeHighlight();
    prioritizeUppDirect();
    preloadVisibleLogos();
    ensureGranCard();
    keepShopLinksCorrect();
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyFixes();
    });
  };

  installStyles();
  schedule();

  const root = document.getElementById("root");
  if (root) {
    new MutationObserver(schedule).observe(root, {
      childList: true,
      subtree: true
    });
  }
})();