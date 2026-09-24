(() => {
  const LOGO = "/partners/consiga-mais.png?v=20260924-6";

  function applyLogo(frame) {
    if (!frame) return;

    frame.dataset.creditiConsiga = "1";
    frame.classList.remove("crediti-consiga-frame");
    frame.style.setProperty("background", "#fff", "important");
    frame.style.setProperty("border-color", "#e3e5e8", "important");
    frame.style.setProperty("display", "grid", "important");
    frame.style.setProperty("place-items", "center", "important");
    frame.style.setProperty("overflow", "hidden", "important");

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
    img.style.setProperty("width", "100%", "important");
    img.style.setProperty("height", "100%", "important");
    img.style.setProperty("max-width", "100%", "important");
    img.style.setProperty("max-height", "100%", "important");
    img.style.setProperty("object-fit", "contain", "important");
    img.style.setProperty("object-position", "center", "important");
    img.style.setProperty("opacity", "1", "important");
    img.style.setProperty("filter", "none", "important");
    img.style.setProperty("mix-blend-mode", "normal", "important");
  }

  function run() {
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
      applyLogo(card.querySelector(".direct-logo"));
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