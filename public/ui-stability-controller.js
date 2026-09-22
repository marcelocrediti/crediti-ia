(() => {
  const SHOP_LINKS = [
    [".shopee-store-card button", "https://s.shopee.com.br/qjgbXOrmd", "creditiShopeeFixed"],
    [".lojasrede-store-card button", "https://acesse.vc/Sai99P3i3v07", "creditiLojasRedeFixed"],
    [".amokarite-store-card button", "https://compre.vc/aI5Y0gg8RE01", "creditiAmokariteFixed"]
  ];

  const EDUCATION_LOGOS = [
    "/education/estacio.png",
    "/education/wyden.png",
    "/education/uninter.png",
    "/education/unifatecie.png",
    "/education/idomed.png"
  ];

  const educationImageCache = [];

  const warmEducationLogos = () => {
    EDUCATION_LOGOS.forEach((src) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = "high";
      image.src = src;
      educationImageCache.push(image);
    });
  };

  const prioritizeVisibleLogos = () => {
    document.querySelectorAll(".career-logo-frame img").forEach((image) => {
      image.loading = "eager";
      image.fetchPriority = "high";
      image.decoding = "async";
    });
  };

  const openSafely = (url) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  };

  const keepShopLinksCorrect = () => {
    document.documentElement.classList.toggle(
      "crediti-home-visible",
      Boolean(document.querySelector(".home-personal-tools"))
    );

    prioritizeVisibleLogos();

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

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      keepShopLinksCorrect();
    });
  };

  warmEducationLogos();
  schedule();
  new MutationObserver(schedule).observe(document.getElementById("root") || document.body, {
    childList: true,
    subtree: true
  });
})();
