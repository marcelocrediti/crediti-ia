-- Complemento de retenção do Creator Ads
-- Objetivo: ao encerrar uma campanha, remover os arquivos de vídeo do Storage
-- sem apagar cadastro, termo aceito, histórico, pagamentos ou metadados da participação.

alter table if exists public.creator_ads_campaigns
  add column if not exists encerrada_em timestamptz;

alter table if exists public.creator_ads_submissions
  add column if not exists arquivo_excluido_em timestamptz,
  add column if not exists arquivo_excluido_motivo text;

create index if not exists creator_ads_submissions_cleanup_idx
  on public.creator_ads_submissions(campaign_id, arquivo_excluido_em);

-- O termo permanece no cadastro do Creator mesmo após cancelamento/desativação.
-- Não há cascade delete de campanhas para profiles e submissions usam ON DELETE RESTRICT.
-- A exclusão de arquivos físicos é feita pela área administrativa via Storage API,
-- depois os metadados abaixo registram a limpeza.
