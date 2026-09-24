(() => {
  const LOGO = "/partners/consiga-mais.png?v=20260924-7";
  const AFFILIATE_URL = "https://apretailer.com.br/click/6aa4af912bfa8159945c68c9/184987/360419/crediti-app";
  const TYPOGRAPHY_CSS = "/crediti-typography.css?v=20260924-1";

  function ensureTypographyStylesheet() {
    let link = document.querySelector('link[data-crediti-typography="1"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.dataset.creditiTypography = "1";
      document.head.appendChild(link);
    }
    if (!link.href.endsWith(TYPOGRAPHY_CSS)) link.href = TYPOGRAPHY_CSS;
  }

  function applyLogo(frame) {
    if (!frame) return;

    frame.dataset.creditiConsiga = "1";
    frame.classList.remove("crediti-consiga-frame");
    frame.style.setProperty("background", "#4b2587", "important");
    frame.style.setProperty("border-color", "#4b2587", "important");
    frame.style.setProperty("display", "grid", "important");
    frame.style.setProperty("place-items", "center", "important");
    frame.style.setProperty("overflow", "hidden", "important");
    frame.style.setProperty("padding", "8px", "important");

    let img = frame.querySelector("img");
    if (!img || !img.src.includes("/partners/consiga-mais.png")) {
      frame.innerHTML = "";
      img = document.createElement("img");
      frame.appendChild(img);
    }

    img.src = LOGO;
    img.alt = "Consiga Mais";
    img.loading = "eager";
    img.decoding = "async";
    img.style.setProperty("display", "block", "important");
    img.style.setProperty("width", "92%", "important");
    img.style.setProperty("height", "92%", "important");
    img.style.setProperty("max-width", "92%", "important");
    img.style.setProperty("max-height", "92%", "important");
    img.style.setProperty("object-fit", "contain", "important");
    img.style.setProperty("object-position", "center", "important");
    img.style.setProperty("opacity", "1", "important");
    img.style.setProperty("visibility", "visible", "important");
    img.style.setProperty("filter", "none", "important");
    img.style.setProperty("mix-blend-mode", "normal", "important");
  }

  function run() {
    ensureTypographyStylesheet();

    document.querySelectorAll(".product-strip-card").forEach((card) => {
      const text = (card.textContent || "").toLowerCase();
      if (!text.includes("consignado inss")) return;
      card.classList.add("crediti-home-credit-card");
      card.dataset.credit = "inss";
      applyLogo(card.querySelector(".product-strip-logo"));
    });

    document.querySelectorAll(".direct-card").forEach((card) => {
      const text = (card.textContent || "").toLowerCase();
      if (!text.includes("consignado inss") && !text.includes("consiga mais")) return;
      card.classList.add("crediti-consiga-direct");
      applyLogo(card.querySelector(".direct-logo"));
    });

    document.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href") || "";
      if (href.includes("184987/360419") || href.includes("consigmais.com.br")) {
        anchor.href = AFFILIATE_URL;
      }
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  }

  run();
  const root = document.getElementById("root");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener("pageshow", schedule, { passive: true });
})();
