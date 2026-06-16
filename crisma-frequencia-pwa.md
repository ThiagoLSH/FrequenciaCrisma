# Sistema de Frequência — Crisma Shalom Jovem 2026/2027
## Especificação Técnica Completa (PWA) — Guia para VSCode

> **Stack:** HTML + JavaScript (Vanilla ou com pequenas libs de animação via CSS/Framer Motion-like usando GSAP) + Supabase (DB + Auth) + Vercel (Hosting)
> **Identidade visual:** Azul royal (#1E3A8A ou similar), Laranja (#F97316), Fonte Barlow Condensed

---

## 1. Visão Geral do Sistema

PWA (Progressive Web App) instalável no celular, com:
- Login/Cadastro (Núcleo e Coordenador com níveis de acesso diferentes)
- Anamnese inicial (dia/horário da Crisma)
- Cadastro de Crismandos
- Tela de Frequência (marcar faltas, justificativas, aprovação)
- Dashboard de saúde de frequência
- Notificações push (lembrete de envio de frequência)

---

## 2. Estrutura de Pastas do Projeto

```
crisma-frequencia/
├── index.html                  # Login/Cadastro
├── anamnese.html                # Perguntas iniciais (1ª vez)
├── dashboard.html                # Dashboard de frequência
├── frequencia.html               # Tela de marcação de frequência
├── crismandos.html                # Cadastro/lista de crismandos
├── aprovacoes.html                # Tela exclusiva do coordenador (justificativas pendentes)
├── manifest.json                  # Configuração PWA
├── service-worker.js              # Cache + Push Notifications
├── /css
│   ├── style.css                  # Estilos globais (identidade Shalom)
│   └── animations.css             # Transições e microanimações
├── /js
│   ├── supabaseClient.js          # Conexão com Supabase
│   ├── auth.js                    # Login, cadastro, validação senha coordenador
│   ├── anamnese.js                 # Lógica da anamnese
│   ├── crismandos.js               # CRUD de crismandos
│   ├── frequencia.js               # Lógica de marcação de faltas
│   ├── dashboard.js                 # Cálculos e gráficos
│   ├── aprovacoes.js                # Aprovar/recusar justificativas
│   ├── notifications.js             # Push notifications
│   └── utils.js                     # Helpers (datas, formatação, máscara senha coord.)
├── /assets
│   ├── icons/                       # Ícones PWA (192x192, 512x512)
│   └── logo-shalom.png
├── vercel.json
└── package.json (opcional, se usar bundler)
```

---

## 3. Identidade Visual — `css/style.css` (base)

```css
:root {
  --azul-royal: #1E3A8A;
  --azul-royal-dark: #152a63;
  --laranja: #F97316;
  --laranja-light: #FFB37C;
  --branco: #FFFFFF;
  --cinza-claro: #F3F4F6;
  --cinza-texto: #4B5563;
  --vermelho-alerta: #DC2626;
  --verde-ok: #16A34A;
  --amarelo-atencao: #FACC15;

  --font-principal: 'Barlow Condensed', sans-serif;

  --radius: 14px;
  --shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: var(--font-principal);
}

body {
  background: var(--cinza-claro);
  color: var(--azul-royal-dark);
  min-height: 100vh;
}

.btn-primary {
  background: var(--laranja);
  color: var(--branco);
  border: none;
  border-radius: var(--radius);
  padding: 14px 24px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: var(--shadow);
}

.btn-primary:hover {
  background: #ea580c;
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--branco);
  color: var(--azul-royal);
  border: 2px solid var(--azul-royal);
  border-radius: var(--radius);
  padding: 12px 22px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-secondary:hover {
  background: var(--azul-royal);
  color: var(--branco);
}

.card {
  background: var(--branco);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}

input, select, textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-size: 15px;
  margin-bottom: 14px;
  transition: border-color 0.2s ease;
  font-family: var(--font-principal);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--laranja);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.badge-verde { background: #DCFCE7; color: var(--verde-ok); }
.badge-amarelo { background: #FEF9C3; color: #A16207; }
.badge-vermelho { background: #FEE2E2; color: var(--vermelho-alerta); }
```

`css/animations.css` — microanimações suaves (fade, slide) para transição entre telas:

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in-up {
  animation: fadeInUp 0.4s ease forwards;
}

@keyframes pulse-orange {
  0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
  50% { box-shadow: 0 0 0 10px rgba(249,115,22,0); }
}

.pulse {
  animation: pulse-orange 1.6s infinite;
}

.skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

> **Nota sobre "C#":** para animações fluidas no navegador, C# não se aplica (é stack server-side/.NET). Para fluidez real, use **CSS transitions/keyframes** (acima) + opcionalmente **GSAP** (`gsap.min.js` via CDN) para animações mais ricas em JS. Isso cobre 100% do que normalmente se quer dizer com "animação fluida" em web/PWA.

---

## 4. Modelagem do Banco de Dados (Supabase / PostgreSQL)

### 4.1 Tabela `usuarios` (extensão de `auth.users` via tabela própria)

```sql
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  email text not null,
  tipo_acesso text not null check (tipo_acesso in ('nucleo', 'coordenador')),
  nucleo text, -- ex: 'Financeiro', 'Pregações', etc. (nullable para coordenador)
  anamnese_completa boolean default false,
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
```

> Para o **dashboard** e **frequência**, todos os usuários autenticados (núcleo + coordenador) precisam ler dados de crismandos/frequência — então as policies dessas tabelas serão mais abertas (qualquer autenticado pode `select`), mas `insert`/`update`/`delete` em registros sensíveis (remoção de faltas, aprovação) ficam restritos ao `tipo_acesso = 'coordenador'`.

### 4.2 Tabela `anamnese`

```sql
create table public.anamnese (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete cascade,
  dia_semana_crisma text not null, -- ex: 'Sábado'
  horario_inicio time not null,
  horario_fim time not null,
  created_at timestamp with time zone default now()
);

alter table public.anamnese enable row level security;

create policy "Usuario ve sua propria anamnese"
  on public.anamnese for select using (auth.uid() = usuario_id);

create policy "Usuario insere sua propria anamnese"
  on public.anamnese for insert with check (auth.uid() = usuario_id);
```

> Nota: a anamnese é "global" para a turma (todos os crismandos têm a mesma data/horário de Crisma), então na prática você pode salvar 1 registro por usuário que faz a configuração inicial, OU criar uma tabela `configuracao_turma` (1 linha única). Recomendo a segunda abordagem para evitar inconsistência:

```sql
create table public.configuracao_turma (
  id int primary key default 1,
  dia_semana_crisma text not null,
  horario_inicio time not null,
  horario_fim time not null,
  updated_at timestamp with time zone default now(),
  constraint single_row check (id = 1)
);

alter table public.configuracao_turma enable row level security;

create policy "Todos autenticados podem ler configuracao"
  on public.configuracao_turma for select
  using (auth.role() = 'authenticated');

create policy "Apenas coordenador atualiza configuracao"
  on public.configuracao_turma for all
  using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and tipo_acesso = 'coordenador'
    )
  );
```

### 4.3 Tabela `crismandos`

```sql
create table public.crismandos (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  data_nascimento date,
  responsavel_nome text,
  responsavel_telefone text,
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
```

### 4.4 Tabela `frequencia` (núcleo do sistema)

```sql
create table public.frequencia (
  id uuid primary key default gen_random_uuid(),
  crismando_id uuid references public.crismandos(id) on delete cascade,
  data_falta date not null,
  justificativa text, -- NULL ou vazio = falta não justificável
  status_justificativa text default 'sem_justificativa'
    check (status_justificativa in ('sem_justificativa', 'pendente', 'aprovada', 'recusada')),
  registrado_por uuid references public.usuarios(id),
  created_at timestamp with time zone default now()
);

alter table public.frequencia enable row level security;

-- Leitura: qualquer autenticado (dashboard precisa)
create policy "Autenticados leem frequencia"
  on public.frequencia for select using (auth.role() = 'authenticated');

-- Insert: qualquer autenticado pode adicionar falta
create policy "Autenticados inserem frequencia"
  on public.frequencia for insert with check (auth.role() = 'authenticated');

-- Update: apenas coordenador (aprovar/recusar justificativa, remover falta = soft delete via status)
create policy "Apenas coordenador atualiza frequencia"
  on public.frequencia for update
  using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and tipo_acesso = 'coordenador'
    )
  );

-- Delete: apenas coordenador (retirar falta)
create policy "Apenas coordenador remove frequencia"
  on public.frequencia for delete
  using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and tipo_acesso = 'coordenador'
    )
  );
```

**Lógica de status_justificativa (definida no `insert`, via trigger ou no JS):**
- Se `justificativa` estiver vazio/null → `status_justificativa = 'sem_justificativa'` → **conta como falta não justificável** desde já.
- Se `justificativa` tiver texto → `status_justificativa = 'pendente'` → **não conta** na contagem de faltas não justificáveis até decisão do coordenador.
  - Coordenador aprova → `status_justificativa = 'aprovada'` → **não conta** como falta não justificável (falta justificada).
  - Coordenador recusa → `status_justificativa = 'recusada'` → **passa a contar** como falta não justificável.

Trigger para garantir a regra automaticamente:

```sql
create or replace function public.set_status_justificativa()
returns trigger as $$
begin
  if new.justificativa is null or trim(new.justificativa) = '' then
    new.status_justificativa := 'sem_justificativa';
  elsif new.status_justificativa = 'sem_justificativa' then
    -- se foi inserido com justificativa preenchida e status default, vira pendente
    new.status_justificativa := 'pendente';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_status_justificativa
before insert on public.frequencia
for each row execute function public.set_status_justificativa();
```

### 4.5 View para o Dashboard — contagem de faltas não justificáveis

```sql
create or replace view public.vw_saude_frequencia as
select
  c.id as crismando_id,
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
group by c.id, c.nome_completo;
```

> Limite: **7 faltas não justificáveis = reprovado**. **5-6 = atenção** (zona de risco, aparece amarelo no dashboard). Abaixo de 5 = ok (verde).

### 4.6 Tabela de notificações (registro de push subscriptions)

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete cascade,
  subscription_json jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Usuario gerencia sua subscription"
  on public.push_subscriptions for all
  using (auth.uid() = usuario_id);
```

---

## 5. Autenticação e Níveis de Acesso

### 5.1 Fluxo Núcleo (padrão)
1. Cadastro via email/senha **ou** Google OAuth (Supabase Auth nativo)
2. Confirmação de cadastro via email (configurado no Supabase Auth → Email Templates)
3. Após confirmação → preenche `usuarios` com `tipo_acesso = 'nucleo'`
4. Redireciona para **Anamnese** (se ainda não respondida) → depois Dashboard

### 5.2 Fluxo Coordenador (acesso elevado)
Mesmo fluxo de cadastro, **+ campo extra**: "Senha de Coordenador".

**Regra de geração da senha de coordenador:**
```
[2 PRIMEIRAS INICIAIS DO NOME EM MAIÚSCULO] + CRI4SM4SH2026
```
Exemplo: Thiago → `TH` + `CRI4SM4SH2026` = `THCRI4SM4SH2026`

No formulário de cadastro, se o usuário marcar "Sou Coordenador":
- Exibe campo "Senha de Acesso Coordenador"
- Sistema calcula a senha esperada com base no nome digitado (2 primeiras letras + sufixo fixo) e compara
- Se correta → `tipo_acesso = 'coordenador'`
- Se incorreta → erro "Senha de coordenador inválida" e cadastro não conclui como coordenador (pode oferecer cadastrar como núcleo)

**`js/utils.js` — função de validação:**

```javascript
const SUFIXO_COORDENADOR = "CRI4SM4SH2026";

export function gerarSenhaCoordenador(nomeCompleto) {
  const iniciais = nomeCompleto.trim().slice(0, 2).toUpperCase();
  return iniciais + SUFIXO_COORDENADOR;
}

export function validarSenhaCoordenador(nomeCompleto, senhaDigitada) {
  return gerarSenhaCoordenador(nomeCompleto) === senhaDigitada.trim();
}
```

> ⚠️ **Observação de segurança importante**: essa senha é previsível (basta saber o nome da pessoa). Funciona como uma "chave de convite" simples, não como segurança forte. Para reforçar, recomendo:
> - Trocar `CRI4SM4SH2026` por um valor armazenado em variável de ambiente (não exposto no bundle JS público) — validar no backend (Supabase Edge Function) em vez do frontend.
> - Alternativa mais simples: criar os usuários coordenadores manualmente no Supabase (você já controla quem é coordenador) e pular essa lógica de senha — defina `tipo_acesso` direto na tabela.
>
> Vou manter a lógica como você pediu, mas **sugiro mover a validação para uma Edge Function** (ver seção 9) para não expor o segredo no código-fonte do frontend.

---

## 6. Telas Detalhadas

### 6.1 `index.html` — Login/Cadastro

**Elementos:**
- Logo Shalom (topo)
- Tabs: "Entrar" | "Criar Conta"
- **Entrar:** email + senha, botão "Entrar com Google", link "Esqueci minha senha"
- **Criar Conta:**
  - Nome completo
  - Email
  - Senha
  - Confirmar senha
  - Checkbox: "Sou Coordenador" → revela campo "Senha de Coordenador" (com animação slide-down)
  - Select "Núcleo" (visível apenas se NÃO marcar coordenador): Financeiro, Pregações, Outro...
  - Botão "Criar Conta" / Botão "Cadastrar com Google"

**Fluxo pós-cadastro:** Supabase envia email de confirmação → ao confirmar e logar pela 1ª vez → checa `anamnese_completa` na tabela `usuarios` (na prática, checa se `configuracao_turma` existe) → se não existe e usuário é coordenador → vai para `anamnese.html`. Se núcleo e config já existe → vai para `dashboard.html`.

### 6.2 `anamnese.html` — Configuração Inicial (1x, feita pelo coordenador)

**Perguntas:**
1. "Qual o dia da semana da Crisma?" (select: Segunda a Domingo)
2. "Que horas a Crisma começa?" (input type="time")
3. "Que horas a Crisma termina?" (input type="time")

Botão "Salvar e Continuar" → grava em `configuracao_turma` → redireciona para `dashboard.html`.

> Se um usuário **núcleo** logar e a config ainda não existir, mostrar tela "Aguardando configuração inicial pelo coordenador" (estado vazio amigável).

### 6.3 `crismandos.html` — Cadastro de Crismandos

**Elementos:**
- Botão flutuante "+ Novo Crismando" (canto inferior direito, estilo FAB laranja)
- Modal/formulário: Nome completo, Data de nascimento, Nome do responsável, Telefone do responsável
- Lista de crismandos cadastrados (cards com nome + badge de status de frequência, clicável → vai para histórico individual)
- Busca/filtro por nome
- Toggle ativo/inativo (soft delete)

Acesso: **Núcleo e Coordenador** (ambos podem cadastrar crismandos — não restrito, conforme você descreveu o acesso do núcleo cobrindo "frequência do crismando" que inclui o cadastro base).

### 6.4 `frequencia.html` — Marcação de Frequência

**Elementos principais:**
- Seletor de data (default: hoje, ou próxima data de Crisma calculada via `configuracao_turma`)
- Lista de crismandos com checkbox/toggle "Presente" / "Faltou"
- Ao marcar "Faltou" → expande card com:
  - Campo "Justificativa" (textarea, opcional)
  - Texto de ajuda: "Deixe em branco se for falta não justificável"
- Botão "Salvar Frequência do Dia"

**Contador visível por crismando:** badge mostrando "X/7 faltas não justificáveis"

**Para coordenador, botões extras por registro de falta:**
- "Remover falta" (delete)
- Se houver justificativa pendente: botões "Aprovar" / "Recusar" inline

### 6.5 `aprovacoes.html` — Justificativas Pendentes (exclusivo coordenador)

- Lista de todas as faltas com `status_justificativa = 'pendente'`
- Cada item: nome do crismando, data da falta, texto da justificativa, quem registrou
- Botões "Aprovar" (verde) / "Recusar" (vermelho)
- Ao decidir → atualiza `status_justificativa` → recalcula contagem (a view já faz isso automaticamente)

> Acesso a essa tela deve ser **bloqueado via JS + RLS** para `tipo_acesso != 'coordenador'` (redireciona para dashboard se núcleo tentar acessar diretamente pela URL).

### 6.6 `dashboard.html` — Saúde de Frequência

**Componentes:**
1. **Cards-resumo no topo** (4 cards):
   - Total de crismandos ativos
   - Crismandos em "atenção" (5-6 faltas não justificáveis) — amarelo
   - Crismandos "reprovados" (≥7 faltas) — vermelho
   - Justificativas pendentes (link rápido para `aprovacoes.html`, visível só pro coordenador)

2. **Tabela/Lista de crismandos** (ordenável por nº de faltas), cada linha:
   - Nome
   - Faltas não justificáveis (X/7) com badge de cor (verde <5, amarelo 5-6, vermelho ≥7)
   - Faltas justificadas (informativo)
   - Barra de progresso visual (% de faltas em relação ao limite de 7)

3. **Gráfico** (Chart.js via CDN): distribuição geral — donut com proporção ok/atenção/reprovado

Fonte de dados: `select * from vw_saude_frequencia order by faltas_nao_justificaveis desc`

---

## 7. PWA — `manifest.json`

```json
{
  "name": "Crisma Shalom — Frequência",
  "short_name": "Crisma Shalom",
  "description": "Sistema de controle de frequência da turma de Crisma Jovem Shalom Nova Parnamirim",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#1E3A8A",
  "theme_color": "#1E3A8A",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

No `<head>` de cada HTML:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1E3A8A">
```

---

## 8. Notificações Push — `service-worker.js` + `js/notifications.js`

### 8.1 Registro do Service Worker (em todas as páginas, antes de `</body>`)

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('SW registrado', reg))
    .catch(err => console.error('Erro SW', err));
}
```

### 8.2 `service-worker.js` (básico + push)

```javascript
const CACHE_NAME = 'crisma-shalom-v1';
const ASSETS = [
  '/', '/index.html', '/dashboard.html', '/frequencia.html',
  '/crismandos.html', '/css/style.css', '/css/animations.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// Recebe push do servidor
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    vibrate: [100, 50, 100]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/frequencia.html'));
});
```

### 8.3 Disparo da notificação — Estratégia

Push real requer um **servidor** que envie via Web Push Protocol (VAPID keys). Como o stack é Supabase + Vercel, a melhor abordagem é:

1. **Supabase Edge Function** (`enviar-lembrete-frequencia`) agendada via **Supabase Cron** (pg_cron + pg_net) para rodar no horário de término da Crisma (do `configuracao_turma.horario_fim`), apenas no dia da semana configurado.
2. A function busca todos em `push_subscriptions`, monta a mensagem:
   ```
   Olá [Nome], a crisma do dia [data] já está finalizando, lembre-se de enviar a frequência do dia.
   ```
3. Envia via `web-push` (lib npm) usando VAPID keys.

**Exemplo de SQL Cron (pg_cron) — roda todo dia, a function internamente checa se hoje = dia da Crisma:**

```sql
select cron.schedule(
  'lembrete-frequencia-diario',
  '0 * * * *', -- verifica a cada hora; a function decide se é a hora certa
  $$
  select net.http_post(
    url := 'https://<seu-projeto>.supabase.co/functions/v1/enviar-lembrete-frequencia',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
  );
  $$
);
```

**`supabase/functions/enviar-lembrete-frequencia/index.ts` (esqueleto):**

```typescript
import webpush from 'npm:web-push';

Deno.serve(async (req) => {
  const supabase = ... // client com service role

  const { data: config } = await supabase.from('configuracao_turma').select('*').single();

  const agora = new Date();
  const diaSemanaHoje = agora.toLocaleDateString('pt-BR', { weekday: 'long' });
  const horaAtual = agora.toTimeString().slice(0,5);

  // Só dispara se hoje for o dia da crisma e estiver dentro de uma janela próxima ao horario_fim
  if (diaSemanaHoje !== config.dia_semana_crisma) {
    return new Response('Hoje não é dia de crisma', { status: 200 });
  }

  if (horaAtual < config.horario_fim) {
    return new Response('Ainda não é hora', { status: 200 });
  }

  const { data: subs } = await supabase.from('push_subscriptions').select('*, usuarios(nome_completo)');

  const dataFormatada = agora.toLocaleDateString('pt-BR');

  for (const sub of subs) {
    const payload = JSON.stringify({
      title: 'Lembrete de Frequência',
      body: `Olá ${sub.usuarios.nome_completo}, a crisma do dia ${dataFormatada} já está finalizando, lembre-se de enviar a frequência do dia.`
    });

    await webpush.sendNotification(sub.subscription_json, payload, {
      vapidDetails: {
        subject: 'mailto:crismanpshalom@gmail.com',
        publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
        privateKey: Deno.env.get('VAPID_PRIVATE_KEY'),
      }
    });
  }

  return new Response('Notificações enviadas', { status: 200 });
});
```

### 8.4 `js/notifications.js` — Pedir permissão e salvar subscription

```javascript
import { supabase } from './supabaseClient.js';

const VAPID_PUBLIC_KEY = 'COLOQUE_SUA_CHAVE_PUBLICA_VAPID';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export async function ativarNotificacoes(usuarioId) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  await supabase.from('push_subscriptions').insert({
    usuario_id: usuarioId,
    subscription_json: subscription.toJSON()
  });
}
```

> Gerar VAPID keys: `npx web-push generate-vapid-keys` (rodar uma vez localmente, salvar public/private nas env vars do Supabase Edge Function e no frontend).

---

## 9. Edge Function para Validação da Senha de Coordenador (mais seguro)

```typescript
// supabase/functions/validar-senha-coordenador/index.ts
Deno.serve(async (req) => {
  const { nomeCompleto, senhaDigitada } = await req.json();
  const SUFIXO = Deno.env.get('SUFIXO_COORDENADOR'); // "CRI4SM4SH2026" guardado como secret

  const iniciais = nomeCompleto.trim().slice(0, 2).toUpperCase();
  const senhaEsperada = iniciais + SUFIXO;

  const valido = senhaEsperada === senhaDigitada.trim();

  return new Response(JSON.stringify({ valido }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

Frontend chama:
```javascript
const res = await fetch('https://<projeto>.supabase.co/functions/v1/validar-senha-coordenador', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nomeCompleto, senhaDigitada })
});
const { valido } = await res.json();
```

---

## 10. `js/supabaseClient.js`

```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## 11. Lógica Central — `js/frequencia.js` (resumo)

```javascript
import { supabase } from './supabaseClient.js';

export async function registrarFalta(crismandoId, dataFalta, justificativa, usuarioId) {
  const { data, error } = await supabase.from('frequencia').insert({
    crismando_id: crismandoId,
    data_falta: dataFalta,
    justificativa: justificativa?.trim() || null,
    registrado_por: usuarioId
  });
  return { data, error };
}

export async function removerFalta(faltaId) {
  // apenas coordenador (RLS garante)
  return await supabase.from('frequencia').delete().eq('id', faltaId);
}

export async function decidirJustificativa(faltaId, decisao) {
  // decisao: 'aprovada' | 'recusada'
  return await supabase
    .from('frequencia')
    .update({ status_justificativa: decisao })
    .eq('id', faltaId);
}

export async function buscarSaudeFrequencia() {
  return await supabase
    .from('vw_saude_frequencia')
    .select('*')
    .order('faltas_nao_justificaveis', { ascending: false });
}
```

---

## 12. Deploy — Vercel

`vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1" }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```

Passos:
1. `npm i -g vercel` (opcional, ou usar integração GitHub)
2. Subir projeto para repositório GitHub
3. Importar no Vercel → conectar repo → deploy automático
4. Variáveis de ambiente no Vercel (se usar build com env): `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## 13. Funcionalidades Adicionais Incorporadas ao Escopo

### 13.1 Multi-turma (`turma_id`) — Futureproofing

Para suportar 2027/2028 sem retrabalho, **toda tabela relevante recebe `turma_id`** desde já.

```sql
create table public.turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null, -- ex: 'Crisma 2026/2027'
  ano_inicio int not null,
  ano_fim int not null,
  ativa boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.turmas enable row level security;

create policy "Autenticados leem turmas"
  on public.turmas for select using (auth.role() = 'authenticated');
```

**Ajustes nas tabelas já definidas (seção 4):**

```sql
-- usuarios: vincula usuário a uma turma (núcleo/coordenador atua em 1 turma por vez)
alter table public.usuarios add column turma_id uuid references public.turmas(id);

-- configuracao_turma deixa de ser singleton — vira 1 config por turma
alter table public.configuracao_turma drop constraint single_row;
alter table public.configuracao_turma add column turma_id uuid references public.turmas(id);
alter table public.configuracao_turma drop constraint configuracao_turma_pkey;
alter table public.configuracao_turma add primary key (turma_id);
alter table public.configuracao_turma drop column id;

-- crismandos: cada crismando pertence a uma turma
alter table public.crismandos add column turma_id uuid references public.turmas(id) not null;

-- frequencia: herda turma indiretamente via crismando, mas duplicar facilita queries/filtros
alter table public.frequencia add column turma_id uuid references public.turmas(id) not null;
```

**View de saúde de frequência atualizada (filtrável por turma):**

```sql
create or replace view public.vw_saude_frequencia as
select
  c.id as crismando_id,
  c.turma_id,
  c.nome_completo,
  count(f.id) filter (where f.status_justificativa in ('sem_justificativa', 'recusada')) as faltas_nao_justificaveis,
  count(f.id) filter (where f.status_justificativa = 'aprovada') as faltas_justificadas,
  count(f.id) filter (where f.status_justificativa = 'pendente') as justificativas_pendentes,
  count(f.id) as total_faltas_registradas,
  case
    when count(f.id) filter (where f.status_justificativa in ('sem_justificativa','recusada')) >= 7 then 'reprovado'
    when count(f.id) filter (where f.status_justificativa in ('sem_justificativa','recusada')) >= 5 then 'atencao'
    else 'ok'
  end as status_saude
from public.crismandos c
left join public.frequencia f on f.crismando_id = c.id
where c.ativo = true
group by c.id, c.turma_id, c.nome_completo;
```

**Impacto no frontend:**
- `usuarios.turma_id` é definido no cadastro (select "Turma atual", populado a partir de `turmas` onde `ativa = true`)
- Todas as queries (`crismandos`, `frequencia`, `configuracao_turma`, `vw_saude_frequencia`) passam a incluir `.eq('turma_id', turmaIdDoUsuario)`
- Dashboard pode futuramente ganhar um seletor de turma para coordenadores que acompanham múltiplas turmas

---

### 13.2 Histórico Individual do Crismando — `crismando-detalhe.html`

Acessado ao clicar em um card na lista de `crismandos.html` ou na linha do `dashboard.html`.

**Elementos:**
- Cabeçalho: nome, data de nascimento, responsável + telefone
- **Resumo de saúde** (cards): faltas não justificáveis (X/7), faltas justificadas, pendentes — mesmas cores do dashboard (verde/amarelo/vermelho)
- **Linha do tempo** (timeline vertical, mais recente no topo): cada item mostra:
  - Data
  - Status: "Presente" (ícone check verde) / "Falta não justificada" (ícone X vermelho) / "Falta justificada — aprovada" (ícone check amarelo) / "Justificativa pendente" (ícone relógio cinza) / "Justificativa recusada" (ícone X laranja)
  - Texto da justificativa (se houver), expansível
  - Para coordenador: botão "Remover" em cada item de falta + botões "Aprovar/Recusar" se pendente
- Botão "Editar dados do crismando" (abre modal de edição)

**Query base:**
```javascript
export async function buscarHistoricoCrismando(crismandoId) {
  return await supabase
    .from('frequencia')
    .select('*')
    .eq('crismando_id', crismandoId)
    .order('data_falta', { ascending: false });
}
```

> Nota: para montar a timeline completa (incluindo dias de presença, não só faltas), é preciso cruzar com as datas de Crisma já ocorridas. Sugestão: gerar a lista de datas de Crisma com base em `configuracao_turma.dia_semana_crisma` (todas as ocorrências daquele dia da semana entre o início e hoje) e marcar como "Presente" qualquer data que não tenha registro em `frequencia` para aquele crismando.

```javascript
export function gerarDatasCrismaAteHoje(diaSemanaCrisma, dataInicioTurma) {
  const diasSemana = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const targetDia = diasSemana.indexOf(diaSemanaCrisma.toLowerCase());
  const datas = [];
  let atual = new Date(dataInicioTurma);

  while (atual <= new Date()) {
    if (atual.getDay() === targetDia) {
      datas.push(new Date(atual));
    }
    atual.setDate(atual.getDate() + 1);
  }
  return datas;
}
```

CSS da timeline (adicionar em `animations.css`):
```css
.timeline {
  position: relative;
  padding-left: 28px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #E5E7EB;
}

.timeline-item {
  position: relative;
  margin-bottom: 18px;
  animation: fadeInUp 0.35s ease forwards;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid var(--branco);
  box-shadow: 0 0 0 2px currentColor;
}

.timeline-item.presente { color: var(--verde-ok); }
.timeline-item.falta-nao-justificada { color: var(--vermelho-alerta); }
.timeline-item.falta-aprovada { color: var(--amarelo-atencao); }
.timeline-item.pendente { color: var(--cinza-texto); }
.timeline-item.recusada { color: var(--laranja); }
```

---

### 13.3 Onboarding Visual — `onboarding.html`

Exibido **apenas no primeiro acesso** (flag salva em `localStorage` e/ou `usuarios.onboarding_visto`).

```sql
alter table public.usuarios add column onboarding_visto boolean default false;
```

**Estrutura: 3 slides em carrossel (swipe ou botões "Próximo")**

| Slide | Conteúdo | Ícone/Ilustração |
|---|---|---|
| 1 | "Bem-vindo ao Crisma Shalom! Acompanhe a frequência da sua turma de forma simples e rápida." | Ilustração de check-list |
| 2 | "Marque presenças e faltas em segundos. Justificativas ficam pendentes até aprovação da coordenação." | Ilustração de calendário |
| 3 | "Acompanhe a saúde da turma no Dashboard e receba lembretes automáticos no dia da Crisma." | Ilustração de gráfico + sino |

**Markup base (`onboarding.html`):**

```html
<div class="onboarding-container">
  <div class="onboarding-slides" id="slides">
    <div class="slide active fade-in-up">
      <div class="slide-icon">📋</div>
      <h2>Bem-vindo ao Crisma Shalom!</h2>
      <p>Acompanhe a frequência da sua turma de forma simples e rápida.</p>
    </div>
    <div class="slide">
      <div class="slide-icon">📅</div>
      <h2>Marque em segundos</h2>
      <p>Marque presenças e faltas rapidamente. Justificativas ficam pendentes até aprovação da coordenação.</p>
    </div>
    <div class="slide">
      <div class="slide-icon">📊</div>
      <h2>Acompanhe a saúde da turma</h2>
      <p>Veja o dashboard completo e receba lembretes automáticos no dia da Crisma.</p>
    </div>
  </div>

  <div class="onboarding-dots">
    <span class="dot active"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </div>

  <button class="btn-primary" id="btnProximo">Próximo</button>
  <button class="btn-secondary" id="btnPular">Pular</button>
</div>
```

**`js/onboarding.js`:**

```javascript
import { supabase } from './supabaseClient.js';

let slideAtual = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const btnProximo = document.getElementById('btnProximo');
const btnPular = document.getElementById('btnPular');

function mostrarSlide(index) {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

btnProximo.addEventListener('click', async () => {
  if (slideAtual < slides.length - 1) {
    slideAtual++;
    mostrarSlide(slideAtual);
    if (slideAtual === slides.length - 1) {
      btnProximo.textContent = 'Começar';
    }
  } else {
    await finalizarOnboarding();
  }
});

btnPular.addEventListener('click', finalizarOnboarding);

async function finalizarOnboarding() {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('usuarios').update({ onboarding_visto: true }).eq('id', user.id);
  localStorage.setItem('onboarding_visto', 'true');
  window.location.href = '/dashboard.html';
}
```

**CSS adicional (`animations.css`):**

```css
.onboarding-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 32px;
  text-align: center;
  background: linear-gradient(160deg, var(--azul-royal) 0%, var(--azul-royal-dark) 100%);
  color: var(--branco);
}

.slide {
  display: none;
  max-width: 320px;
}

.slide.active {
  display: block;
  animation: fadeInUp 0.4s ease forwards;
}

.slide-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.slide h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.slide p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.onboarding-dots {
  display: flex;
  gap: 8px;
  margin: 24px 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: var(--laranja);
  width: 24px;
  border-radius: 4px;
}

.onboarding-container .btn-secondary {
  background: transparent;
  border-color: rgba(255,255,255,0.5);
  color: var(--branco);
  margin-top: 12px;
}
```

**Fluxo de roteamento atualizado:**
```
Login/Cadastro confirmado
   → onboarding_visto = false? → onboarding.html
   → onboarding_visto = true E anamnese (configuracao_turma) não existe E é coordenador? → anamnese.html
   → caso contrário → dashboard.html
```

---

## 14. Resumo de Regras de Negócio (checklist)

- [x] Limite de faltas não justificáveis: **7**
- [x] Faixa de atenção: **5-6 faltas** (amarelo no dashboard)
- [x] Falta sem justificativa = conta imediatamente como não justificável
- [x] Falta com justificativa = fica `pendente` até decisão do coordenador
- [x] Justificativa recusada = volta a contar como não justificável
- [x] Núcleo: cadastro/login (email/senha ou Google), frequência (adicionar faltas), dashboard
- [x] Coordenador: tudo do núcleo + remover faltas + aprovar/recusar justificativas + senha extra no cadastro
- [x] Senha coordenador = 2 iniciais maiúsculas + `CRI4SM4SH2026`
- [x] Anamnese inicial: dia da semana + horário início/fim da Crisma (feita 1x pelo coordenador)
- [x] Notificação push no horário de término da Crisma, no dia configurado
- [x] Multi-turma via `turma_id` em todas as tabelas (futureproofing 2027/2028)
- [x] Histórico individual do crismando com timeline de presenças/faltas
- [x] Onboarding visual de 3 telas no primeiro acesso

---

## 15. Próximos Passos Sugeridos (fora do escopo imediato, mas de alto valor)

1. **Exportar relatório PDF** mensal de frequência (usando a lib `jsPDF`)
2. **Seletor de turma** no dashboard para coordenadores que acompanham múltiplas turmas simultaneamente

---

*Documento gerado para uso no VSCode — pronto para iniciar o scaffolding do projeto.*
