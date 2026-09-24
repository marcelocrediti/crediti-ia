(() => {
  const SELECTOR = ".education-partner-carousel";
  const INTERVAL_MS = 5000;
  const PAUSE_AFTER_TOUCH_MS = 5000;

  const ensureStyles = () => {
    if (document.getElementById("crediti-education-autoplay-styles")) return;
    const style = document.createElement("style");
    style.id = "crediti-education-autoplay-styles";
    style.textContent = `
      ${SELECTOR}{
        overflow-x:auto!important;
        scroll-snap-type:x mandatory!important;
        scroll-behavior:smooth!important;
        overscroll-behavior-x:contain!important;
        -webkit-overflow-scrolling:touch!important;
        scrollbar-width:none!important;
      }
      ${SELECTOR}::-webkit-scrollbar{display:none!important}
      ${SELECTOR}>.career-card{
        scroll-snap-align:start!important;
        scroll-snap-stop:always!important;
        flex:0 0 100%!important;
        max-width:100%!important;
      }
    `;
    document.head.appendChild(style);
  };

  const getCards = (carousel) =>
    [...carousel.children].filter((el) => el.classList.contains("career-card"));

  const getClosestIndex = (carousel, cards) => {
    if (!cards.length) return 0;
    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const goToCard = (carousel, card) => {
    if (!card) return;
    carousel.scrollTo({
      left: Math.max(0, card.offsetLeft - carousel.offsetLeft),
      behavior: "smooth"
    });
  };

  const install = (carousel) => {
    if (!carousel || carousel.dataset.creditiEducationAutoplay === "1") return;
    carousel.dataset.creditiEducationAutoplay = "1";
    ensureStyles();

    let pausedUntil = 0;
    let currentIndex = 0;
    let scrollRaf = 0;

    const syncIndex = () => {
      const cards = getCards(carousel);
      currentIndex = getClosestIndex(carousel, cards);
    };

    const pauseForInteraction = () => {
      pausedUntil = Date.now() + PAUSE_AFTER_TOUCH_MS;
      syncIndex();
    };

    carousel.addEventListener("pointerdown", pauseForInteraction, { passive: true });
    carousel.addEventListener("touchstart", pauseForInteraction, { passive: true });
    carousel.addEventListener("wheel", pauseForInteraction, { passive: true });
    carousel.addEventListener("scroll", () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(syncIndex);
    }, { passive: true });

    setInterval(() => {
      if (!document.body.contains(carousel)) return;
      if (document.visibilityState !== "visible") return;
      if (Date.now() < pausedUntil) return;

      const cards = getCards(carousel);
      if (cards.length < 2) return;

      currentIndex = getClosestIndex(carousel, cards);
      currentIndex = (currentIndex + 1) % cards.length;
      goToCard(carousel, cards[currentIndex]);
    }, INTERVAL_MS);
  };

  const scan = () => {
    document.querySelectorAll(SELECTOR).forEach(install);
  };

  scan();
  new MutationObserver(scan).observe(document.getElementById("root") || document.body, {
    childList: true,
    subtree: true
  });
})();
