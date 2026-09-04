(() => {
  const ORIGINAL = window.patchCampaign;
  if (typeof ORIGINAL !== 'function') return;

  async function deleteStorageObject(path) {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    const response = await fetch(`${BASE}/storage/v1/object/creator-ads-videos/${encoded}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!response.ok && response.status !== 404) {
      const text = await response.text();
      throw new Error(text || 'Não foi possível remover um vídeo da campanha.');
    }
  }

  async function closeAndCleanCampaign(id) {
    const campaign = campaigns.find(c => c.id === id);
    const related = submissions.filter(s => s.campaign_id === id);
    const withFiles = related.filter(s => s.video_path);

    const warning = withFiles.length
      ? `Ao encerrar “${campaign?.titulo || 'esta campanha'}”, ${withFiles.length} arquivo(s) de vídeo serão apagados definitivamente do armazenamento. Os termos aceitos, cadastros, pagamentos e o histórico continuarão salvos.\n\nBaixe antes qualquer vídeo que ainda queira guardar. Deseja continuar?`
      : `Encerrar “${campaign?.titulo || 'esta campanha'}”? Os termos aceitos, cadastros, pagamentos e o histórico continuarão salvos.`;

    if (!confirm(warning)) return;

    for (const submission of withFiles) {
      await deleteStorageObject(submission.video_path);
      await rest(`creator_ads_submissions?id=eq.${submission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          video_path: null,
          arquivo_excluido_em: new Date().toISOString(),
          arquivo_excluido_motivo: 'Campanha encerrada: limpeza automática do arquivo original'
        })
      });
      await audit('submission', submission.id, 'arquivo_excluido_apos_encerramento', {
        campaign_id: id,
        video_nome: submission.video_nome,
        video_mime: submission.video_mime,
        video_tamanho: submission.video_tamanho
      });
    }

    await rest(`creator_ads_campaigns?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'encerrada',
        encerrada_em: new Date().toISOString()
      })
    });
    await audit('campaign', id, 'encerrada_com_limpeza_videos', { arquivos_excluidos: withFiles.length });
    await loadAll();
  }

  window.patchCampaign = async function(id, status) {
    if (status === 'encerrada') return closeAndCleanCampaign(id);
    return ORIGINAL(id, status);
  };
})();
