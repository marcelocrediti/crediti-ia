-- Permite que Creator ativo veja e envie vídeo para campanhas marcadas como ativas,
-- inclusive antes do horário de início, desde que a campanha ainda não tenha terminado.

create or replace function public.creator_ads_public_campaigns(p_token uuid)
returns table(id uuid,titulo text,descricao text,briefing text,inicio timestamptz,fim timestamptz,premio numeric,numero_vencedores integer,bonus_ativo boolean,bonus_valor numeric,bonus_meta_views integer,bonus_prazo timestamptz)
language sql security definer set search_path=public as $$
  select c.id,c.titulo,c.descricao,c.briefing,c.inicio,c.fim,c.premio,c.numero_vencedores,c.bonus_ativo,c.bonus_valor,c.bonus_meta_views,c.bonus_prazo
  from public.creator_ads_campaigns c
  where c.status='ativa'
    and now() <= c.fim
    and exists(select 1 from public.creator_ads_profiles p where p.public_token=p_token and p.status='ativo')
  order by c.inicio asc, c.fim asc;
$$;

grant execute on function public.creator_ads_public_campaigns(uuid) to anon,authenticated;

create or replace function public.creator_ads_begin_upload(p_token uuid,p_campaign uuid,p_video_nome text,p_video_mime text,p_video_tamanho bigint,p_video_largura integer,p_video_altura integer,p_video_duracao numeric)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_profile uuid; v_status text; v_id uuid; v_upload uuid;
begin
  select id,status into v_profile,v_status from public.creator_ads_profiles where public_token=p_token;
  if v_profile is null then raise exception 'Cadastro não encontrado'; end if;
  if v_status<>'ativo' then raise exception 'Seu cadastro não está ativo'; end if;
  if not exists(select 1 from public.creator_ads_campaigns where id=p_campaign and status='ativa' and now() <= fim) then raise exception 'Campanha indisponível'; end if;
  insert into public.creator_ads_submissions(profile_id,campaign_id,video_nome,video_mime,video_tamanho,video_largura,video_altura,video_duracao,status)
  values(v_profile,p_campaign,p_video_nome,p_video_mime,p_video_tamanho,p_video_largura,p_video_altura,p_video_duracao,'pendente')
  on conflict(profile_id,campaign_id) do update set video_nome=excluded.video_nome,video_mime=excluded.video_mime,video_tamanho=excluded.video_tamanho,video_largura=excluded.video_largura,video_altura=excluded.video_altura,video_duracao=excluded.video_duracao,status='pendente',erro_upload=null,video_path=null,upload_token=gen_random_uuid(),updated_at=now()
  returning id,upload_token into v_id,v_upload;
  return jsonb_build_object('submission_id',v_id,'upload_token',v_upload,'path',p_token::text||'/'||v_id::text||'/'||v_upload::text||'-'||regexp_replace(p_video_nome,'[^a-zA-Z0-9._-]','_','g'));
end $$;

grant execute on function public.creator_ads_begin_upload(uuid,uuid,text,text,bigint,integer,integer,numeric) to anon,authenticated;
