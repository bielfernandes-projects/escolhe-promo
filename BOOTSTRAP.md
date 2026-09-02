# Bootstrap Checklist — Escolhe Promo

Checklist de setup inicial. **Todo item abaixo está concluído** — o projeto
está em produção. Pra estado atual e próximos passos, ver `PLAN.md` (seções
"Estado atual" e "Roadmap combinado com o dono do produto").

## ✅ Concluído

### Arquitetura & Decisões
- [x] Sessão de grilling (3 rodadas) fechando stack, gateway, armazenamento, auth
- [x] `PLAN.md` — escopo MVP, Go-To-Market, stack, arquitetura pós-pagamento, riscos conhecidos, estado atual e roadmap
- [x] `CONTEXT.md` — glossário de domínio (Vitrine, Nicho, Template Visual, etc.)

### Infraestrutura
- [x] Next.js 16 (TypeScript, App Router, Tailwind CSS)
- [x] Vercel: projeto `escolhe-promo`, deploy automático a cada push no `main`
- [x] Domínio de produção: `https://www.escolhepromo.com.br` (DNS gerenciado pela Vercel)
- [x] Repositório GitHub privado: `github.com/bielfernandes-projects/escolhe-promo`
- [x] Supabase project (`rorlucaegorqgdtbqfeb`) com todas as tabelas e RLS
- [x] SMTP próprio (Resend) configurado no Supabase Auth — o provedor padrão
      tem limite de envio baixo demais pra tráfego pago
- [x] Vercel Analytics ligado

### Credenciais & Secrets
- [x] Todas as env vars configuradas local (`.env.local`) e produção (Vercel)
- [x] `ENCRYPTION_KEY` pra cifrar credenciais de terceiros salvas pelo usuário

> **Nenhum secret é versionado.** `.env.local` e `.mcp.json` estão no
> `.gitignore`; `.env.example` documenta todas as chaves necessárias (sem
> valores). Pra recriar os MCPs num clone novo:
>
> ```bash
> claude mcp add --scope project --transport http supabase \
>   "https://mcp.supabase.com/mcp?project_ref=<project-ref>&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
>
> claude mcp add --scope project --transport http cakto https://mcp.cakto.com.br \
>   --header "X-Cakto-Client-Id: <client-id>" \
>   --header "X-Cakto-Client-Secret: <client-secret>"
>
> claude mcp add --transport http resend https://mcp.resend.com/mcp \
>   --header "Authorization: Bearer <resend-api-key>"
> ```

### Código & Features
- [x] Landing, login (senha + magic link), Vitrine (filtro + ordenação),
      gerador de copy, gerador de imagem, Configurações (senha + API Shopee
      própria), webhook Cakto, cron diário de sincronização
- [x] Termos de Uso e Política de Privacidade (`/termos`, `/privacidade`) —
      rascunho informado por LGPD/CDC, **não é revisão jurídica**
- [x] Meta Pixel + Conversions API — código pronto, em no-op até as env vars
      `NEXT_PUBLIC_META_PIXEL_ID` / `META_PIXEL_ID` / `META_CONVERSIONS_API_TOKEN`
      serem preenchidas
- [x] Testes automatizados (Vitest — `npm run test`)
- [x] Rate limit em login e confirmação de magic link

### Validação
- [x] `npm run build`, `npm run lint`, `npm run test` — todos limpos
- [x] Fluxo completo testado no navegador: login, Vitrine, geração de copy/
      imagem, compartilhamento
- [x] Deploy de produção testado ponta a ponta (rotas, auth, cron)

## Pendências que só o dono do produto resolve

- [ ] `[RAZÃO SOCIAL / CNPJ / CIDADE-UF]` nos Termos/Privacidade — hoje são
      placeholders
- [ ] `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, `META_CONVERSIONS_API_TOKEN`
      — pegar no Gerenciador de Eventos do Meta Business Manager
- [ ] Ver `PLAN.md` → "Roadmap combinado" pras próximas fases (Canva, logo,
      copy/criativo, campanha)
