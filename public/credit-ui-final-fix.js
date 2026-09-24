(() => {
  const FINANZERO_URL = "https://apretailer.com.br/click/6ab281112bfa816a66278004/180635/360419/crediti-app";
  const CONSIGA_URL = "https://www.consigmais.com.br/";
  const STYLE_ID = "crediti-credit-ui-final-fix";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .finanzero-alternative.crediti-finanzero-clean {
        position: relative !important;
        display: grid !important;
        grid-template-columns: 112px minmax(0, 1fr) !important;
        grid-template-areas: "logo copy" "cta cta" !important;
        align-items: center !important;
        gap: 12px 14px !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 18px 0 10px !important;
        padding: 14px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        border: 1px solid #e1e5e8 !important;
        border-radius: 15px !important;
        background: #fff !important;
        box-shadow: none !important;
      }
      .finanzero-alternative.crediti-finanzero-clean::before,
      .finanzero-alternative.crediti-finanzero-clean::after { content: none !important; display: none !important; }
      .finanzero-alternative.crediti-finanzero-clean > * {
        position: static !important;
        float: none !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
      .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-logo {
        grid-area: logo !important;
        width: 112px !important;
        min-width: 112px !important;
        height: 58px !important;
        min-height: 58px !important;
        padding: 10px !important;
        display: grid !important;
        place-items: center !important;
        border: 1px solid #e3e5e8 !important;
        border-radius: 11px !important;
        background: #fff !important;
        overflow: hidden !important;
      }
      .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-logo img {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
      }
      .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-copy {
        grid-area: copy !important;
        width: auto !important;
        min-width: 0 !important;
        height: auto !important;
      }
      .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-copy small {
        display: block !important;
        margin: 0 0 3px !important;
        color: #687078 !important;
        font-size: 8px !important;
        font-weight: 700 !important;
        letter-spacing: .08em !important;
      }
      .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-copy h2 {
        margin: 0 0 4px !important;
        color: #171d2e !important;
        font-size: 17px !important;
        line-height: 1.15 !important;
      }
      .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-copy p {
        margin: 0 !important;
        color: #686d75 !important;
        font-size: 10px !important;
        line-height: 1.4 !important;
      }
      .finanzero-alternative.crediti-finanzero-clean > button {
        grid-area: cta !important;
        justify-self: start !important;
        width: auto !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: 38px !important;
        padding: 9px 14px !important;
        border: 0 !important;
        border-radius: 10px !important;
        background: #008f6a !important;
        color: #fff !important;
        font-size: 9px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        box-shadow: none !important;
      }
      .crediti-consiga-frame {
        display: grid !important;
        place-items: center !important;
        overflow: hidden !important;
        background: #4b2587 !important;
        border-color: #4b2587 !important;
      }
      .crediti-consiga-wordmark {
        display: inline-flex !important;
        align-items: baseline !important;
        gap: 1px !important;
        color: #fff !important;
        font-family: Montserrat, Arial, sans-serif !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }
      .crediti-consiga-wordmark span {
        font-size: 12px !important;
        font-weight: 600 !important;
        letter-spacing: -.5px !important;
      }
      .crediti-consiga-wordmark b {
        font-size: 9px !important;
        font-weight: 700 !important;
      }
      .crediti-home-credit-card[data-credit="inss"] .product-strip-action {
        color: #4b2587 !important;
      }
      .direct-card.crediti-consiga-direct .primary-action {
        background: #4b2587 !important;
        color: #fff !important;
        border-color: #4b2587 !important;
      }
      @media (max-width: 620px) {
        .finanzero-alternative.crediti-finanzero-clean {
          grid-template-columns: 88px minmax(0, 1fr) !important;
          gap: 10px 11px !important;
          padding: 12px !important;
        }
        .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-logo {
          width: 88px !important;
          min-width: 88px !important;
          height: 50px !important;
          min-height: 50px !important;
          padding: 9px !important;
        }
        .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-copy h2 { font-size: 14px !important; }
        .finanzero-alternative.crediti-finanzero-clean .finanzero-alternative-copy p { font-size: 9px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildFinanzero(card) {
    if (!card) return;
    const wrongStructure =
      card.children.length !== 3 ||
      !card.querySelector(":scope > .finanzero-alternative-logo") ||
      !card.querySelector(":scope > .finanzero-alternative-copy") ||
      !card.querySelector(":scope > button");

    if (wrongStructure || card.dataset.creditiFinal !== "1") {
      card.innerHTML = `
        <div class="finanzero-alternative-logo">
          <img src="/partners/finanzero.svg" alt="FinanZero" loading="eager" decoding="async">
        </div>
        <div class="finanzero-alternative-copy">
          <small>OUTRAS POSSIBILIDADES</small>
          <h2>Compare ofertas com a FinanZero</h2>
          <p>Uma única simulação para consultar opções de diferentes instituições.</p>
        </div>
        <button type="button">COMPARAR OFERTAS</button>
      `;
      card.dataset.creditiFinal = "1";
    }
    card.classList.add("crediti-finanzero-clean");

    const button = card.querySelector(":scope > button");
    if (button && !button.dataset.creditiBound) {
      button.dataset.creditiBound = "1";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const opened = window.open(FINANZERO_URL, "_blank", "noopener,noreferrer");
        if (opened) opened.opener = null;
      });
    }
  }

  function setConsigaBrand(frame) {
    if (!frame) return;
    if (frame.dataset.creditiConsiga === "1") return;
    frame.dataset.creditiConsiga = "1";
    frame.classList.add("crediti-consiga-frame");
    frame.innerHTML = `<div class="crediti-consiga-wordmark" aria-label="Consiga Mais"><span>consig</span><b>mais</b></div>`;
  }

  function fixConsiga() {
    const home = document.querySelector('.crediti-home-credit-card[data-credit="inss"]');
    if (home) {
      setConsigaBrand(home.querySelector(".product-strip-logo"));
    }

    document.querySelectorAll(".direct-card").forEach((card) => {
      const text = (card.textContent || "").toLowerCase();
      if (!text.includes("consignado inss") && !text.includes("consiga mais")) return;
      card.classList.add("crediti-consiga-direct");
      setConsigaBrand(card.querySelector(".direct-logo"));
    });
  }

  function interceptConsiga(event) {
    const target = event.target.closest('button,a,.crediti-home-credit-card');
    if (!target) return;
    const card = target.closest('.crediti-home-credit-card[data-credit="inss"],.direct-card.crediti-consiga-direct');
    if (!card) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const opened = window.open(CONSIGA_URL, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  }

  function run() {
    installStyles();
    document.querySelectorAll(".finanzero-alternative").forEach(buildFinanzero);
    fixConsiga();
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