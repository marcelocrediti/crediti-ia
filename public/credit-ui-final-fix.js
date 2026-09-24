(() => {
  const FINANZERO_URL = "https://apretailer.com.br/click/6ab281112bfa816a66278004/180635/360419/crediti-app";
  const CONSIGA_URL = "https://apretailer.com.br/click/6aa4af912bfa8159945c68c9/184987/360419/crediti-app";

  function openExternal(url) {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  }

  function fixFinanzero() {
    document.querySelectorAll(".finanzero-alternative").forEach((card) => {
      card.classList.add("crediti-finanzero-clean");
      card.style.setProperty("display", "grid", "important");
      card.style.setProperty("grid-template-columns", "112px minmax(0,1fr)", "important");
      card.style.setProperty("grid-template-areas", '"logo copy" "cta cta"', "important");
      card.style.setProperty("gap", "12px 14px", "important");
      card.style.setProperty("align-items", "center", "important");
      card.style.setProperty("width", "100%", "important");
      card.style.setProperty("height", "auto", "important");
      card.style.setProperty("min-height", "0", "important");
      card.style.setProperty("max-height", "none", "important");
      card.style.setProperty("padding", "14px", "important");
      card.style.setProperty("overflow", "hidden", "important");
      card.style.setProperty("box-sizing", "border-box", "important");
      card.style.setProperty("background", "#fff", "important");

      const logo = card.querySelector(".finanzero-alternative-logo");
      const copy = card.querySelector(".finanzero-alternative-copy");
      let button = card.querySelector(":scope > button");

      if (logo) {
        logo.style.setProperty("grid-area", "logo", "important");
        logo.style.setProperty("width", "112px", "important");
        logo.style.setProperty("height", "58px", "important");
        logo.style.setProperty("min-height", "58px", "important");
        logo.style.setProperty("background", "#fff", "important");
      }
      if (copy) {
        copy.style.setProperty("grid-area", "copy", "important");
        copy.style.setProperty("height", "auto", "important");
        copy.style.setProperty("min-height", "0", "important");
      }
      if (button) {
        button.style.setProperty("grid-area", "cta", "important");
        button.style.setProperty("justify-self", "start", "important");
        button.style.setProperty("width", "auto", "important");
        button.style.setProperty("min-height", "38px", "important");
        button.style.setProperty("padding", "9px 14px", "important");
        button.style.setProperty("background", "#008f6a", "important");
        button.style.setProperty("color", "#fff", "important");
        if (!button.dataset.creditiFinanzeroBound) {
          button.dataset.creditiFinanzeroBound = "1";
          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openExternal(FINANZERO_URL);
          });
        }
      }
    });
  }

  function markConsigaCards() {
    document.querySelectorAll(".product-strip-card").forEach((card) => {
      const text = (card.textContent || "").toLowerCase();
      if (!text.includes("consignado inss")) return;
      card.classList.add("crediti-home-credit-card");
      card.dataset.credit = "inss";
    });

    document.querySelectorAll(".direct-card").forEach((card) => {
      const text = (card.textContent || "").toLowerCase();
      if (!text.includes("consignado inss") && !text.includes("consiga mais")) return;
      card.classList.add("crediti-consiga-direct");
    });

    document.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href") || "";
      if (href.includes("184987/360419") || href.includes("consigmais.com.br")) {
        anchor.setAttribute("href", CONSIGA_URL);
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function isConsigaTarget(target) {
    if (!target) return false;
    const card = target.closest('.crediti-home-credit-card[data-credit="inss"], .direct-card.crediti-consiga-direct');
    if (card) return true;
    const clickable = target.closest("button,a");
    if (!clickable) return false;
    const text = (clickable.textContent || "").toLowerCase();
    return text.includes("consignado inss") || text.includes("consiga mais");
  }

  function interceptConsiga(event) {
    if (!isConsigaTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openExternal(CONSIGA_URL);
  }

  const nativeOpen = window.open.bind(window);
  window.open = function(url, ...args) {
    const value = String(url || "");
    if (value.includes("184987/360419") || value.includes("consigmais.com.br")) {
      return nativeOpen(CONSIGA_URL, ...args);
    }
    return nativeOpen(url, ...args);
  };

  function run() {
    fixFinanzero();
    markConsigaCards();
  }

  document.addEventListener("click", interceptConsiga, true);
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  };

  run();
  const root = document.getElementById("root");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener("pageshow", schedule, { passive: true });
})();
