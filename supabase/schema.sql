-- ============================================================
-- Schema completo — Crisma Shalom Frequência 2026/2027
-- Execute no Supabase SQL Editor (ordem importa)
-- ============================================================

-- ── 1. TURMAS ──────────────────────────────────────────────
create table if not exists public.turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ano_inicio int not null,
  ano_fim int not null,
  ativa boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.turmas enable row level security;

create policy "Autenticados leem turmas"
  on public.turmas for select using (auth.role() = 'authenticated');

-- ── 2. USUÁRIOS ────────────────────────────────────────────
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  email text not null,
  tipo_acesso text not null check (tipo_acesso in ('nucleo', 'coordenador')),
  nucleo text,
  turma_id uuid references public.turmas(id),
  anamnese_completa boolean default false,
  onboarding_visto boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.usuarios enable row level security;

create policy "Usuarios podem ver seus proprios dados"
  on public.usuarios for select
  using (auth.uid() = id);

create policy "Usuarios podem atualizar seus proprios dados"
  on public.usuarios for update
  using (auth.uid() = id);

create policy "Usuarios autenticados podem inserir seu proprio registro"
  on public.usuarios for insert
  with check (auth.uid() = id);

-- ── 3. CONFIGURAÇÃO DA TURMA ───────────────────────────────
create table if not exists public.configuracao_turma (
  turma_id uuid primary key references public.turmas(id),
  dia_semana_crisma text not null,
  horario_inicio time not null,
  horario_fim time not null,
  updated_at timestamp with time zone default now()
);

alter table public.configuracao_turma enable row level security;

create policy "Autenticados leem configuracao"
  on public.configuracao_turma for select
  using (auth.role() = 'authenticated');

-- ── 4. CRISMANDOS ──────────────────────────────────────────
create table if not exists public.crismandos (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  data_nascimento date,
  responsavel_nome text,
  responsavel_telefone text,
  turma_id uuid references public.turmas(id) not null,
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.crismandos enable row level security;

create policy "Autenticados podem ler crismandos"
  on public.crismandos for select using (auth.role() = 'authenticated');

create policy "Autenticados podem inserir crismandos"
  on public.crismandos for insert with check (auth.role() = 'authenticated');

create policy "Autenticados podem atualizar crismandos"
  on public.crismandos for update using (auth.role() = 'authenticated');

-- ── 5. FREQUÊNCIA ──────────────────────────────────────────
create table if not exists public.frequencia (
  id uuid primary key default gen_random_uuid(),
  crismando_id uuid references public.crismandos(id) on delete cascade,
  turma_id uuid references public.turmas(id) not null,
  data_falta date not null,
  justificativa text,
  status_justificativa text default 'sem_justificativa'
    check (status_justificativa in ('sem_justificativa', 'pendente', 'aprovada', 'recusada')),
  registrado_por uuid references public.usuarios(id),
  created_at timestamp with time zone default now(),
  unique(crismando_id, data_falta)
);

alter table public.frequencia enable row level security;

create policy "Autenticados leem frequencia"
  on public.frequencia for select using (auth.role() = 'authenticated');

create policy "Autenticados inserem frequencia"
  on public.frequencia for insert with check (auth.role() = 'authenticated');

-- ── 6. PUSH SUBSCRIPTIONS ──────────────────────────────────
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete cascade,
  subscription_json jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Usuario gerencia sua subscription"
  on public.push_subscriptions for all
  using (auth.uid() = usuario_id);

-- ── 7. POLICIES QUE REFERENCIAM USUARIOS ──────────────────
-- (adicionadas após todas as tabelas existirem)

create policy "Coordenador gerencia turmas"
  on public.turmas for all
  using (
    exists (select 1 from public.usuarios where id = auth.uid() and tipo_acesso = 'coordenador')
  );

create policy "Coordenador gerencia configuracao"
  on public.configuracao_turma for all
  using (
    exists (select 1 from public.usuarios where id = auth.uid() and tipo_acesso = 'coordenador')
  );

create policy "Coordenador pode remover crismandos"
  on public.crismandos for delete
  using (
    exists (select 1 from public.usuarios where id = auth.uid() and tipo_acesso = 'coordenador')
  );

create policy "Apenas coordenador atualiza frequencia"
  on public.frequencia for update
  using (
    exists (select 1 from public.usuarios where id = auth.uid() and tipo_acesso = 'coordenador')
  );

create policy "Apenas coordenador remove frequencia"
  on public.frequencia for delete
  using (
    exists (select 1 from public.usuarios where id = auth.uid() and tipo_acesso = 'coordenador')
  );

-- ── 8. TRIGGER de status da justificativa ─────────────────
create or replace function public.set_status_justificativa()
returns trigger as $$
begin
  if new.justificativa is null or trim(new.justificativa) = '' then
    new.status_justificativa := 'sem_justificativa';
  else
    new.status_justificativa := 'pendente';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_status_justificativa on public.frequencia;
create trigger trg_status_justificativa
  before insert on public.frequencia
  for each row execute function public.set_status_justificativa();

-- ── 9. VIEW de saúde ───────────────────────────────────────
-- security_invoker garante que a view respeita as RLS policies
-- do usuário que consulta, não do dono da view (postgres)
create or replace view public.vw_saude_frequencia
with (security_invoker = on) as
select
  c.id as crismando_id,
  c.turma_id,
  c.nome_completo,
  count(f.id) filter (
    where f.status_justificativa in ('sem_justificativa', 'recusada')
  ) as faltas_nao_justificaveis,
  count(f.id) filter (
    where f.status_justificativa = 'aprovada'
  ) as faltas_justificadas,
  count(f.id) filter (
    where f.status_justificativa = 'pendente'
  ) as justificativas_pendentes,
  count(f.id) as total_faltas_registradas,
  case
    when count(f.id) filter (where f.status_justificativa in ('sem_justificativa','recusada')) >= 7
      then 'reprovado'
    when count(f.id) filter (where f.status_justificativa in ('sem_justificativa','recusada')) >= 5
      then 'atencao'
    else 'ok'
  end as status_saude
from public.crismandos c
left join public.frequencia f on f.crismando_id = c.id
where c.ativo = true
group by c.id, c.turma_id, c.nome_completo;

-- ── 10. TURMA PADRÃO ───────────────────────────────────────
insert into public.turmas (nome, ano_inicio, ano_fim, ativa)
values ('Crisma 2026/2027', 2026, 2027, true);

-- ── 11. CRON JOB (opcional) ────────────────────────────────
-- Habilite pg_cron e pg_net em: Dashboard > Database > Extensions
-- Depois rode:
--
-- select cron.schedule(
--   'lembrete-frequencia-horario',
--   '0 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<SEU_PROJETO>.supabase.co/functions/v1/enviar-lembrete-frequencia',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
--   );
--   $$
-- );
