create extension if not exists pgcrypto;

create table if not exists public.creator_ads_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.creator_ads_is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.creator_ads_admins a where a.user_id=auth.uid());
$$;

grant execute on function public.creator_ads_is_admin() to authenticated;

create table if not exists public.creator_ads_profiles (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null default gen_random_uuid() unique,
  nome text not null,
  whatsapp text not null,
  plataforma text not null check (plataforma in ('Instagram','TikTok','Kwai')),
  perfil text not null,
  pix_chave text not null,
  pix_tipo text not null,
  banco_instituicao text not null,
  status text not null default 'em_analise' check (status in ('em_analise','ativo','nao_elegivel','perfil_privado','cancelado_creator','desativado_crediti')),
  seguidores_verificados integer,
  perfil_publico_verificado boolean,
  termo_versao text not null default 'Creator Ads v1.0',
  termo_texto text not null,
  termo_aceito_em timestamptz not null default now(),
  adulto_confirmado boolean not null default false,
  perfil_publico_confirmado boolean not null default false,
  uso_imagem_confirmado boolean not null default false,
  tratamento_dados_confirmado boolean not null default false,
  cancelado_em timestamptz,
  motivo_desativacao text,
  observacao_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_ads_campaigns (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  briefing text not null,
  inicio timestamptz not null,
  fim timestamptz not null,
  premio numeric(12,2) not null check (premio >= 0),
  numero_vencedores integer not null default 1 check (numero_vencedores >= 1),
  bonus_ativo boolean not null default false,
  bonus_valor numeric(12,2),
  bonus_meta_views integer,
  bonus_prazo timestamptz,
  status text not null default 'rascunho' check (status in ('rascunho','ativa','encerrada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fim > inicio),
  check ((bonus_ativo=false) or (bonus_valor is not null and bonus_valor >= 0 and bonus_meta_views is not null and bonus_meta_views > 0))
);

create table if not exists public.creator_ads_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.creator_ads_profiles(id) on delete restrict,
  campaign_id uuid not null references public.creator_ads_campaigns(id) on delete restrict,
  upload_token uuid not null default gen_random_uuid() unique,
  video_path text,
  video_nome text,
  video_mime text,
  video_tamanho bigint,
  video_largura integer,
  video_altura integer,
  video_duracao numeric(10,2),
  status text not null default 'pendente' check (status in ('pendente','enviado','nao_enviado','em_analise','vencedor','nao_selecionado','publicado')),
  erro_upload text,
  views integer not null default 0,
  vencedor_em timestamptz,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, campaign_id)
);

create table if not exists public.creator_ads_payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.creator_ads_profiles(id) on delete restrict,
  campaign_id uuid not null references public.creator_ads_campaigns(id) on delete restrict,
  submission_id uuid references public.creator_ads_submissions(id) on delete restrict,
  premio numeric(12,2) not null default 0,
  bonus numeric(12,2) not null default 0,
  total numeric(12,2) generated always as (premio + bonus) stored,
  status text not null default 'pendente' check (status in ('pendente','pago')),
  pago_em timestamptz,
  comprovante_url text,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(submission_id)
);

create table if not exists public.creator_ads_audit (
  id bigint generated always as identity primary key,
  entidade text not null,
  entidade_id uuid,
  acao text not null,
  detalhes jsonb,
  admin_user uuid,
  created_at timestamptz not null default now()
);

create index if not exists creator_ads_profiles_status_idx on public.creator_ads_profiles(status);
create index if not exists creator_ads_campaigns_status_idx on public.creator_ads_campaigns(status);
create index if not exists creator_ads_submissions_status_idx on public.creator_ads_submissions(status);
create index if not exists creator_ads_submissions_campaign_idx on public.creator_ads_submissions(campaign_id);
create index if not exists creator_ads_payments_status_idx on public.creator_ads_payments(status);

create or replace function public.creator_ads_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;

do $$ begin
  if not exists(select 1 from pg_trigger where tgname='creator_ads_profiles_touch') then create trigger creator_ads_profiles_touch before update on public.creator_ads_profiles for each row execute function public.creator_ads_touch_updated_at(); end if;
  if not exists(select 1 from pg_trigger where tgname='creator_ads_campaigns_touch') then create trigger creator_ads_campaigns_touch before update on public.creator_ads_campaigns for each row execute function public.creator_ads_touch_updated_at(); end if;
  if not exists(select 1 from pg_trigger where tgname='creator_ads_submissions_touch') then create trigger creator_ads_submissions_touch before update on public.creator_ads_submissions for each row execute function public.creator_ads_touch_updated_at(); end if;
  if not exists(select 1 from pg_trigger where tgname='creator_ads_payments_touch') then create trigger creator_ads_payments_touch before update on public.creator_ads_payments for each row execute function public.creator_ads_touch_updated_at(); end if;
end $$;

alter table public.creator_ads_admins enable row level security;
alter table public.creator_ads_profiles enable row level security;
alter table public.creator_ads_campaigns enable row level security;
alter table public.creator_ads_submissions enable row level security;
alter table public.creator_ads_payments enable row level security;
alter table public.creator_ads_audit enable row level security;

drop policy if exists "creator admin admins" on public.creator_ads_admins;
create policy "creator admin admins" on public.creator_ads_admins for select to authenticated using (public.creator_ads_is_admin());
drop policy if exists "creator admin profiles" on public.creator_ads_profiles;
create policy "creator admin profiles" on public.creator_ads_profiles for all to authenticated using (public.creator_ads_is_admin()) with check (public.creator_ads_is_admin());
drop policy if exists "creator admin campaigns" on public.creator_ads_campaigns;
create policy "creator admin campaigns" on public.creator_ads_campaigns for all to authenticated using (public.creator_ads_is_admin()) with check (public.creator_ads_is_admin());
drop policy if exists "creator admin submissions" on public.creator_ads_submissions;
create policy "creator admin submissions" on public.creator_ads_submissions for all to authenticated using (public.creator_ads_is_admin()) with check (public.creator_ads_is_admin());
drop policy if exists "creator admin payments" on public.creator_ads_payments;
create policy "creator admin payments" on public.creator_ads_payments for all to authenticated using (public.creator_ads_is_admin()) with check (public.creator_ads_is_admin());
drop policy if exists "creator admin audit" on public.creator_ads_audit;
create policy "creator admin audit" on public.creator_ads_audit for all to authenticated using (public.creator_ads_is_admin()) with check (public.creator_ads_is_admin());

grant select on public.creator_ads_admins to authenticated;
grant select,insert,update,delete on public.creator_ads_profiles to authenticated;
grant select,insert,update,delete on public.creator_ads_campaigns to authenticated;
grant select,insert,update,delete on public.creator_ads_submissions to authenticated;
grant select,insert,update,delete on public.creator_ads_payments to authenticated;
grant select,insert on public.creator_ads_audit to authenticated;
grant usage,select on sequence public.creator_ads_audit_id_seq to authenticated;

create or replace function public.creator_ads_register(
  p_nome text,p_whatsapp text,p_plataforma text,p_perfil text,p_pix_chave text,p_pix_tipo text,p_banco text,
  p_adulto boolean,p_perfil_publico boolean,p_uso_imagem boolean,p_tratamento_dados boolean
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v public.creator_ads_profiles; v_termo text;
begin
  if coalesce(length(trim(p_nome)),0)<5 or position(' ' in trim(p_nome))=0 then raise exception 'Informe nome completo'; end if;
  if coalesce(length(regexp_replace(p_whatsapp,'\D','','g')),0)<10 then raise exception 'WhatsApp inválido'; end if;
  if p_plataforma not in ('Instagram','TikTok','Kwai') then raise exception 'Plataforma inválida'; end if;
  if not (p_adulto and p_perfil_publico and p_uso_imagem and p_tratamento_dados) then raise exception 'Todos os consentimentos obrigatórios precisam ser aceitos'; end if;
  v_termo := 'TERMO DE PARTICIPAÇÃO, USO DE IMAGEM E TRATAMENTO DE DADOS\n\nDeclaro que tenho 18 anos ou mais. Autorizo a Crediti Soluções Financeiras a utilizar minha imagem, voz, nome, nome de perfil e conteúdo audiovisual enviado nas campanhas Creator Ads Crediti. Concordo com o tratamento dos dados necessários ao cadastro, análise, contato, participação, publicação e eventual pagamento. O envio de conteúdo não garante seleção, publicação ou pagamento. Cada campanha possui regras, prazo, prêmio e eventual bônus próprios. O Creator pode cancelar sua participação a qualquer momento e a Crediti pode desativar a participação a seu critério, preservando os registros históricos necessários.';
  insert into public.creator_ads_profiles(nome,whatsapp,plataforma,perfil,pix_chave,pix_tipo,banco_instituicao,adulto_confirmado,perfil_publico_confirmado,uso_imagem_confirmado,tratamento_dados_confirmado,termo_texto)
  values(trim(p_nome),trim(p_whatsapp),p_plataforma,trim(p_perfil),trim(p_pix_chave),trim(p_pix_tipo),trim(p_banco),p_adulto,p_perfil_publico,p_uso_imagem,p_tratamento_dados,v_termo)
  returning * into v;
  return jsonb_build_object('id',v.id,'public_token',v.public_token,'status',v.status,'term_version',v.termo_versao,'accepted_at',v.termo_aceito_em);
end $$;

grant execute on function public.creator_ads_register(text,text,text,text,text,text,text,boolean,boolean,boolean,boolean) to anon,authenticated;

create or replace function public.creator_ads_get_me(p_token uuid)
returns jsonb language sql security definer set search_path=public as $$
  select coalesce(jsonb_build_object('id',p.id,'nome',p.nome,'plataforma',p.plataforma,'perfil',p.perfil,'status',p.status,'seguidores_verificados',p.seguidores_verificados,'perfil_publico_verificado',p.perfil_publico_verificado,'term_version',p.termo_versao,'term_text',p.termo_texto,'accepted_at',p.termo_aceito_em), '{}'::jsonb)
  from public.creator_ads_profiles p where p.public_token=p_token limit 1;
$$;
grant execute on function public.creator_ads_get_me(uuid) to anon,authenticated;

create or replace function public.creator_ads_cancel_me(p_token uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  update public.creator_ads_profiles set status='cancelado_creator',cancelado_em=now(),motivo_desativacao='Cancelado pelo Creator' where public_token=p_token and status in ('em_analise','ativo','perfil_privado') returning id into v_id;
  if v_id is null then raise exception 'Cadastro não encontrado ou já encerrado'; end if;
  return jsonb_build_object('status','cancelado_creator');
end $$;
grant execute on function public.creator_ads_cancel_me(uuid) to anon,authenticated;

create or replace function public.creator_ads_public_campaigns(p_token uuid)
returns table(id uuid,titulo text,descricao text,briefing text,inicio timestamptz,fim timestamptz,premio numeric,numero_vencedores integer,bonus_ativo boolean,bonus_valor numeric,bonus_meta_views integer,bonus_prazo timestamptz)
language sql security definer set search_path=public as $$
  select c.id,c.titulo,c.descricao,c.briefing,c.inicio,c.fim,c.premio,c.numero_vencedores,c.bonus_ativo,c.bonus_valor,c.bonus_meta_views,c.bonus_prazo
  from public.creator_ads_campaigns c
  where c.status='ativa' and now() between c.inicio and c.fim
    and exists(select 1 from public.creator_ads_profiles p where p.public_token=p_token and p.status='ativo')
  order by c.fim asc;
$$;
grant execute on function public.creator_ads_public_campaigns(uuid) to anon,authenticated;

create or replace function public.creator_ads_my_submissions(p_token uuid)
returns table(id uuid,campaign_id uuid,video_nome text,video_mime text,video_tamanho bigint,video_largura integer,video_altura integer,video_duracao numeric,status text,erro_upload text,views integer,created_at timestamptz)
language sql security definer set search_path=public as $$
  select s.id,s.campaign_id,s.video_nome,s.video_mime,s.video_tamanho,s.video_largura,s.video_altura,s.video_duracao,s.status,s.erro_upload,s.views,s.created_at
  from public.creator_ads_submissions s join public.creator_ads_profiles p on p.id=s.profile_id
  where p.public_token=p_token order by s.created_at desc;
$$;
grant execute on function public.creator_ads_my_submissions(uuid) to anon,authenticated;

create or replace function public.creator_ads_begin_upload(p_token uuid,p_campaign uuid,p_video_nome text,p_video_mime text,p_video_tamanho bigint,p_video_largura integer,p_video_altura integer,p_video_duracao numeric)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_profile uuid; v_status text; v_id uuid; v_upload uuid;
begin
  select id,status into v_profile,v_status from public.creator_ads_profiles where public_token=p_token;
  if v_profile is null then raise exception 'Cadastro não encontrado'; end if;
  if v_status<>'ativo' then raise exception 'Seu cadastro não está ativo'; end if;
  if not exists(select 1 from public.creator_ads_campaigns where id=p_campaign and status='ativa' and now() between inicio and fim) then raise exception 'Campanha indisponível'; end if;
  insert into public.creator_ads_submissions(profile_id,campaign_id,video_nome,video_mime,video_tamanho,video_largura,video_altura,video_duracao,status)
  values(v_profile,p_campaign,p_video_nome,p_video_mime,p_video_tamanho,p_video_largura,p_video_altura,p_video_duracao,'pendente')
  on conflict(profile_id,campaign_id) do update set video_nome=excluded.video_nome,video_mime=excluded.video_mime,video_tamanho=excluded.video_tamanho,video_largura=excluded.video_largura,video_altura=excluded.video_altura,video_duracao=excluded.video_duracao,status='pendente',erro_upload=null,video_path=null,upload_token=gen_random_uuid(),updated_at=now()
  returning id,upload_token into v_id,v_upload;
  return jsonb_build_object('submission_id',v_id,'upload_token',v_upload,'path',p_token::text||'/'||v_id::text||'/'||v_upload::text||'-'||regexp_replace(p_video_nome,'[^a-zA-Z0-9._-]','_','g'));
end $$;
grant execute on function public.creator_ads_begin_upload(uuid,uuid,text,text,bigint,integer,integer,numeric) to anon,authenticated;

create or replace function public.creator_ads_finish_upload(p_token uuid,p_submission uuid,p_upload_token uuid,p_video_path text,p_ok boolean,p_error text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  update public.creator_ads_submissions s set video_path=case when p_ok then p_video_path else null end,status=case when p_ok then 'enviado' else 'nao_enviado' end,erro_upload=case when p_ok then null else left(coalesce(p_error,'Falha no envio'),500) end
  from public.creator_ads_profiles p where s.id=p_submission and s.profile_id=p.id and p.public_token=p_token and s.upload_token=p_upload_token;
  get diagnostics v_count=row_count;
  if v_count=0 then raise exception 'Envio não encontrado'; end if;
  return jsonb_build_object('status',case when p_ok then 'enviado' else 'nao_enviado' end);
end $$;
grant execute on function public.creator_ads_finish_upload(uuid,uuid,uuid,text,boolean,text) to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('creator-ads-videos','creator-ads-videos',false,157286400,array['video/mp4','video/quicktime','video/webm'])
on conflict(id) do update set public=false,file_size_limit=157286400,allowed_mime_types=array['video/mp4','video/quicktime','video/webm'];

drop policy if exists "creator anon upload video" on storage.objects;
create policy "creator anon upload video" on storage.objects for insert to anon with check(bucket_id='creator-ads-videos' and exists(select 1 from public.creator_ads_submissions s join public.creator_ads_profiles p on p.id=s.profile_id where s.status='pendente' and name like p.public_token::text||'/'||s.id::text||'/'||s.upload_token::text||'-%'));
drop policy if exists "creator admin videos" on storage.objects;
create policy "creator admin videos" on storage.objects for all to authenticated using(bucket_id='creator-ads-videos' and public.creator_ads_is_admin()) with check(bucket_id='creator-ads-videos' and public.creator_ads_is_admin());

-- Depois de criar seu usuário no Supabase Auth, adicione SOMENTE o seu UUID aqui:
-- insert into public.creator_ads_admins(user_id) values ('SEU-UUID-AQUI');
