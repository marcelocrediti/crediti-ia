(() => {
  const originalShowProfile = window.showProfile;
  if (typeof originalShowProfile !== 'function') return;

  function safeFileName(value) {
    return String(value || 'creator')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'creator';
  }

  function downloadTermPdf(profile) {
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) {
      alert('Não foi possível carregar o gerador de PDF agora. Atualize a página e tente novamente.');
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = 210;
    const usableWidth = pageWidth - margin * 2;
    let y = 20;

    const addWrapped = (text, size = 10, gap = 5, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(text || ''), usableWidth);
      for (const line of lines) {
        if (y > 279) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += size * 0.45;
      }
      y += gap;
    };

    addWrapped('CREDITI', 18, 2, true);
    addWrapped('Creator Ads Crediti | Termo aceito', 12, 8, true);
    addWrapped(`Participante: ${profile.nome}`, 10, 1);
    addWrapped(`Plataforma: ${profile.plataforma}`, 10, 1);
    addWrapped(`Perfil: ${profile.perfil}`, 10, 1);
    addWrapped(`Versão: ${profile.termo_versao || '-'}`, 10, 1);
    addWrapped(`Aceite: ${typeof fmtDate === 'function' ? fmtDate(profile.termo_aceito_em) : profile.termo_aceito_em}`, 10, 8);
    addWrapped('Termo registrado', 11, 4, true);
    addWrapped(profile.termo_texto || '', 10, 4);

    doc.save(`termo-creator-ads-${safeFileName(profile.nome)}.pdf`);
  }

  window.showProfile = function(id) {
    originalShowProfile(id);
    const profile = profiles.find(p => p.id === id);
    const detail = document.getElementById('profileDetail');
    if (!profile || !detail || detail.querySelector('[data-download-term-pdf]')) return;

    const actions = document.createElement('div');
    actions.className = 'card-actions creator-term-admin-actions';
    actions.innerHTML = '<button type="button" class="accent" data-download-term-pdf>Baixar termo em PDF</button>';
    detail.appendChild(actions);
    actions.querySelector('[data-download-term-pdf]').addEventListener('click', () => downloadTermPdf(profile));
  };
})();
