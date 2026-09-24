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
      const button = card.querySelector(":scope > button");
      if (!button) return;
      button.textContent = "CONFERIR OFERTAS";
      if (!button.dataset.creditiFinanzeroBound) {
        button.dataset.creditiFinanzeroBound = "1";
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openExternal(FINANZERO_URL);
        });
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
