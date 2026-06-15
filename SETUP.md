# Setup — Crisma Shalom Frequência

## 1. Supabase

### 1.1 Criar projeto
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Anote a **Project URL** e a **anon key** (em Settings > API)

### 1.2 Executar o schema
1. Vá em **SQL Editor** no Supabase Dashboard
2. Cole e execute o conteúdo de `supabase/schema.sql`

### 1.3 Configurar variáveis no `js/supabaseClient.js`
```js
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';
```

### 1.4 Habilitar Google Auth (opcional)
- Supabase Dashboard > Authentication > Providers > Google
- Configure o OAuth no Google Cloud Console

### 1.5 Deploy das Edge Functions
```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase functions deploy validar-senha-coordenador
npx supabase functions deploy enviar-lembrete-frequencia
```

Secrets necessários (Supabase Dashboard > Edge Functions > Secrets):
- `SUFIXO_COORDENADOR` = `CRI4SM4SH2026`
- `VAPID_PUBLIC_KEY` = (gerar com `npx web-push generate-vapid-keys`)
- `VAPID_PRIVATE_KEY` = (gerado junto com a key acima)
- `VAPID_EMAIL` = seu email de contato

### 1.6 Atualizar VAPID key no frontend
Em `js/notifications.js`, substitua:
```js
const VAPID_PUBLIC_KEY = 'COLOQUE_SUA_CHAVE_PUBLICA_VAPID';
```

### 1.7 Habilitar cron job (opcional — lembretes push)
- Habilite pg_cron e pg_net em: Supabase Dashboard > Database > Extensions
- Execute o SQL de cron comentado no final do `supabase/schema.sql`

---

## 2. Ícones PWA

Crie ou coloque em `assets/icons/`:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

---

## 3. Deploy na Vercel

```bash
# Opção 1: CLI
npm i -g vercel
vercel --prod

# Opção 2: GitHub Integration
# 1. Suba o projeto para um repositório GitHub
# 2. Importe no vercel.com > Add New Project
# 3. Deploy automático em cada push para main
```

---

## 4. Primeiro uso

1. Acesse o sistema pelo browser e crie uma conta de **Coordenador**
   - Marque "Sou Coordenador" no cadastro
   - Senha = 2 primeiras letras do nome em maiúsculo + `CRI4SM4SH2026`
   - Exemplo: Thiago → `THCRI4SM4SH2026`
2. Confirme o e-mail (link enviado pelo Supabase)
3. Ao logar, o sistema pedirá a **configuração da turma** (dia e horário da Crisma)
4. Cadastre os crismandos em **Crismandos**
5. Comece a registrar frequência em **Frequência**

---

## 5. Regras de negócio

| Situação | Contagem |
|---|---|
| Falta sem justificativa | Conta como não justificável imediatamente |
| Falta com justificativa (pendente) | **Não conta** até decisão do coordenador |
| Justificativa aprovada | **Não conta** (falta justificada) |
| Justificativa recusada | **Passa a contar** como não justificável |
| 5–6 faltas não justificáveis | Zona de atenção (amarelo) |
| ≥7 faltas não justificáveis | Reprovado (vermelho) |
