# Bootstrap Checklist — Eita Promo

Estado do projeto após sessão de grilling + scaffold técnico.

## ✅ Concluído

### Arquitetura & Decisões
- [x] Sessão de grilling (3 rodadas) fechando stack, gateway, armazenamento, auth
- [x] `PLAN.md` — escopo MVP, Go-To-Market, stack, arquitetura pós-pagamento, riscos conhecidos
- [x] `CONTEXT.md` — glossário de domínio (Vitrine, Nicho, Template Visual, etc.)

### Infraestrutura
- [x] Next.js 16 (TypeScript, App Router, Tailwind CSS)
- [x] Linkado à Vercel (`bielfernandes-projects-projects/eita-promo`)
- [x] Supabase project criado (`rorlucaegorqgdtbqfeb`)
- [x] Credenciais Supabase configuradas (URL + ANON_KEY + SERVICE_ROLE_KEY)
- [x] MCP Supabase integrado ao projeto
- [x] MCP Cakto integrado ao projeto (com credenciais)

### Credenciais & Secrets
- [x] Shopee Affiliate APP_ID + APP_SECRET no `.env.local`
- [x] Supabase credenciais no `.env.local`
- [x] Domínio webhook definido: `https://eitapromo.gf.dev.br/api/webhooks/cakto`

> **Nenhum secret é versionado.** `.env.local` e `.mcp.json` estão no `.gitignore`;
> `.env.example` contém apenas placeholders. Para recriar os MCPs num clone novo:
>
> ```bash
> claude mcp add --scope project --transport http supabase \
>   "https://mcp.supabase.com/mcp?project_ref=<project-ref>&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
>
> claude mcp add --scope project --transport http cakto https://mcp.cakto.com.br \
>   --header "X-Cakto-Client-Id: <client-id>" \
>   --header "X-Cakto-Client-Secret: <client-secret>"
> ```

### Código Scaffold
- [x] Landing page pública (`src/app/page.tsx`)
- [x] Layout protegido por Supabase Auth (`src/app/app/layout.tsx`)
- [x] Rota webhook stub (`src/app/api/webhooks/cakto/route.ts`)
- [x] Clients Supabase (browser/server/admin)
- [x] Manifest PWA
- [x] `.env.example` com documentação

### Validação
- [x] `npm run build` passa sem erros
- [x] `npm run lint` limpo
- [x] Rota `/` respondeu 200
- [x] Estrutura de rotas e tipos TypeScript corretos

## 🔲 Pendentes

### Shopee API Validation
- [ ] Confirmar autenticação correta da API Shopee `productOfferV2`
  - Arquivo de teste: `scripts/test-shopee-api.ts`
  - Precisa: Bearer token OAuth ou API key específica do seu projeto Shopee
  - Validar se o campo de categoria existe (decidirá se precisa tagueador de Nicho)
  
### Cakto Webhook
- [ ] Criar webhook em https://app.cakto.com.br/settings/webhooks
  - URL: `https://eitapromo.gf.dev.br/api/webhooks/cakto`
  - Eventos: `purchase_completed`, `order_bump_accepted`
  - Gerar e registrar o `CAKTO_WEBHOOK_SECRET`
  - Implementar validação de assinatura em `src/app/api/webhooks/cakto/route.ts`

### Supabase Schema
- [ ] Criar tabelas no Supabase:
  - `produtos` (itemId, productName, price, commission, nicho, imageUrl, shopeeLink)
  - `compras` (userId, lifetime, ebook_turbinar, createdAt)
  - `usuarios` (email, metadata) — será criada automaticamente pelo Supabase Auth

### Domínio
- [ ] Configurar DNS (apontar `eitapromo.gf.dev.br` pra Vercel)
- [ ] Deploy de preview na Vercel pra testar webhook real

## Próximos Passos

1. **Shimmy time** — teste manual do webhook Cakto (com ngrok ou deploy preview)
2. **Validar Shopee API** — confirmar autenticação e presença de categoria
3. **Implementar features** — por ordem:
   - Vitrine (fetch + cache no Supabase)
   - Gerador de Copy (Spintax client-side)
   - Gerador de Imagens (HTML-to-Image)
   - Webhook Cakto (liberar acesso + magic link)
4. **Deploy production** → `eitapromo.gf.dev.br`
