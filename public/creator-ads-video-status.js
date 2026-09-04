(() => {
  const OVERLAY_ID = 'crediti-creator-ads-overlay';

  function normalize() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    overlay.querySelectorAll('.upload-progress').forEach((el) => {
      const text = el.textContent || '';
      if (text.startsWith('Pendente:')) el.textContent = text.replace(/^Pendente:/, 'Enviando:');
    });

    overlay.querySelectorAll('#creatorVideos .video p').forEach((el) => {
      const text = (el.textContent || '').trim();
      if (/^Status:\s*Pendente$/i.test(text)) el.innerHTML = 'Status: <b>Enviando</b>';
      if (/^Status:\s*Em análise$/i.test(text)) el.innerHTML = 'Status: <b>Em análise</b><br><span>Aguarde a decisão da equipe Crediti.</span>';
    });
  }

  const observer = new MutationObserver(normalize);
  observer.observe(document.documentElement, {childList:true, subtree:true, characterData:true});
  normalize();
})();
