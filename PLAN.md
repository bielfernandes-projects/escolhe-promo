# Eita Promo — Copiou, postou, vendeu

Micro SaaS B2C que resolve a dor operacional de afiliados iniciantes da Shopee (ex.: donas de casa buscando renda extra), automatizando a criação de copy persuasiva e de imagens (posts/stories) pra divulgação de produtos no WhatsApp e Instagram — sem depender de LLMs caros, pra preservar a margem de um Lifetime Deal de baixo ticket.

## Go-To-Market & Monetização

- **Canal de aquisição**: tráfego pago (Meta Ads / TikTok Ads).
- **Oferta principal**: Lifetime Deal, acesso vitalício, preço entre R$ 47 e R$ 67.
- **Order Bump**: e-book "como usar o botão Turbinar do Instagram", R$ 27, adicionado no carrinho.
- **Gateway de pagamento**: Cakto — escolhida sobre Kiwify após comparação de taxas: Kiwify cobra 8,99% + R$ 2,49 por venda (igual em cartão/Pix/boleto); a Cakto zera a taxa percentual no Pix, que deve ser o método dominante nesse ticket médio. Ambas suportam Order Bump nativamente.

## Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Padrão do dono do produto para todos os apps. |
| Deploy | Vercel | Unifica front-end e as poucas rotas de API necessárias; Vercel Cron cuida do job diário. |
| Estilo | Tailwind CSS | Agiliza os Templates Visuais. |
| Dados da Vitrine | Supabase (Postgres, tabela `produtos`) | Atualização diária sem redeploy. |
| Auth / acesso pós-pagamento | Supabase Auth, magic link | Público iniciante não deveria lidar com senha; o e-mail já vem do webhook da Cakto. |
| Storage de imagens | Supabase Storage | Mesmo projeto de produtos/auth. |
| Fonte de dados de produto | Shopee Affiliate Open API (`productOfferV2`) | Acesso já aprovado; evita risco de scraping/ToS. |
| Job diário de catálogo | Vercel Cron Job | Mesma plataforma do deploy. |
| Geração de imagem | `html2canvas` (client-side) | Zero custo de servidor. |
| PWA | Instalável + cache básico de assets estáticos | Sem exigência de uso 100% offline no MVP. |

## Core Features (MVP 1.0)

1. **Vitrine** — lista de Top Produtos (foto, título, preço, comissão) com **filtro por Nicho** (Casa, Beleza, Eletrônicos, Moda, Bebê & Infantil, Pet, Esporte & Fitness, Cozinha, Outros).
   - ✅ **Resolvido via chamada real à API** (o item de ação pendente): a documentação pública estava incompleta. O `productOfferV2` **expõe sim** a categoria, no campo `productCatIds: [Int!]` — a trilha hierárquica de categorias da Shopee (`[nível1, nível2, nível3]`), coerente com os filtros `categoryLv1Id/Lv2Id/Lv3Id` do `conversionReport`. **O tagueador por palavra-chave foi descartado**: o Nicho é derivado dos IDs de categoria da própria Shopee, o que é determinístico e não quebra com variação de título.
   - A query `productOfferV2` também aceita `productCatId: Int` como argumento, permitindo buscar direto por categoria.
   - Mapeamento em `src/lib/shopee/niches.ts`, derivado de uma amostra real de 500 produtos (21 categorias raiz). A categoria raiz `100636` concentrava ~30% do inventário e foi subdividida pelo nível 2 para separar Cozinha (potes, marmitas, talheres) de Casa (cama, decoração, móveis).
2. **Gerador de Copy via Spintax** — templates como dados estruturados por slot (arrays tipados: Abertura, Benefício, Urgência, Fechamento). Um sorteador genérico itera sobre os slots e monta a copy com o link de afiliado colado pelo usuário. 100% client-side, sem LLM.
3. **Gerador de Imagens (HTML-to-Image)** — 3 a 5 Templates Visuais (Feed/Story) em HTML/CSS, populados com foto (pré-baixada e re-hospedada no Supabase Storage, sem problema de CORS) e preço do produto, renderizados no client, download direto.
4. **Double-Dip** — cliques na Vitrine sem link próprio do usuário caem no link de afiliado do dono do app.

## Arquitetura Pós-Pagamento (Cakto → acesso liberado)

1. Cakto dispara webhook (`/api/webhooks/cakto`) na confirmação de pagamento, com o(s) item(ns) comprados (Lifetime Deal e, opcionalmente, o Order Bump do e-book) e o e-mail do comprador.
2. A rota do webhook valida a assinatura/segredo da Cakto e usa a Supabase Admin API para: (a) criar ou localizar o usuário pelo e-mail, (b) gravar um registro na tabela `compras` com os itens liberados (`lifetime: true`, `ebook_turbinar: true/false`), (c) disparar o magic link de acesso (`signInWithOtp`).
3. O layout de `/app/**` (ver `src/app/app/layout.tsx`) protege as rotas checando a sessão Supabase; a seção do e-book só renderiza se `compras.ebook_turbinar = true` pro usuário logado.
4. Não existe cadastro/self-signup — a única porta de entrada é o webhook pós-pagamento.
5. A landing page de vendas mora na rota pública `/`; o botão de compra leva ao checkout hospedado da Cakto.

## Riscos Técnicos Conhecidos

- **Download de imagem no iOS Safari (PWA)**: `html2canvas` gera um blob PNG, mas iOS Safari não dispara "salvar na galeria" de forma confiável a partir de um link de download programático dentro de uma PWA instalada. Mitigação: `navigator.share` com o arquivo (abre a folha nativa de compartilhar/salvar do iOS), com fallback pra abrir a imagem numa nova aba (usuário salva por long-press).
- **Fontes customizadas no `html2canvas`**: aguardar `document.fonts.ready` antes de capturar o canvas, senão o texto sai com a fonte padrão do sistema em vez da fonte do Template Visual.

## Backlog / Futuro

- Suporte a outras plataformas de afiliação (AliExpress, Magalu).
- Vídeo tutorial embutido (GIFs ensinando a pegar links e recortar fotos da Shopee).
- ~~**Integração de Afiliado Própria**~~ — **Implementado.** Em Configurações (`src/app/app/configuracoes/`), o usuário salva App ID/Secret da própria conta Shopee; `src/app/app/vitrine/link-afiliado.ts` gera o link pessoal via mutation `generateShortLink`, com fallback silencioso pro link da casa (Double-Dip) se não houver credencial ou a chamada falhar. O App Secret é criptografado em repouso (AES-256-GCM, `src/lib/seguranca/criptografia.ts`) — nunca passa em texto puro do browser pro banco, a escrita acontece via server action (`src/app/app/configuracoes/acoes.ts`).

## Estado atual (31/08/2026)

Em produção: `https://eitapromo.bf.dev.br` (Vercel, deploy automático a cada push no `main`). Repo: `github.com/bielfernandes-projects/eita-promo` (privado).

**Shipped nesta sessão, além do MVP inicial:**
- Login com senha + magic link, ordenação da Vitrine (padrão "Mais vendidos"), aba de Configurações, botões de compartilhamento direto (WhatsApp / Web Share API).
- SMTP próprio (Resend) pro e-mail de acesso — o provedor padrão do Supabase tem limite de envio baixo demais pra tráfego pago.
- Vercel Analytics ligado.
- **Fase 1 (legal + Pixel + segurança da credencial)**: Termos de Uso e Política de Privacidade (`/termos`, `/privacidade` — conteúdo é rascunho informado por LGPD/CDC, **não é revisão jurídica**; falta preencher razão social/CNPJ real). Meta Pixel client-side (`src/lib/meta/pixel.tsx`) + evento `Purchase` server-side via Conversions API (`src/lib/meta/conversions.ts`, disparado no webhook da Cakto) — ambos em no-op até `NEXT_PUBLIC_META_PIXEL_ID` / `META_PIXEL_ID` / `META_CONVERSIONS_API_TOKEN` serem configurados. Credencial Shopee do usuário criptografada (item acima).
- **Fase 2 (robustez técnica)**:
  - Retry com backoff exponencial em `queryShopee` (único ponto por onde toda chamada à Shopee passa — cobre tanto o cron diário quanto a geração de link pessoal) pra falha transitória (5xx/429); erro definitivo (4xx, credencial ausente) continua falhando na hora.
  - Rate limit de tentativas de login: `signInWithPassword` foi movido pra uma server action (`src/app/login/acoes.ts`) porque a chamada direta do browser pro Supabase nunca passava pelo nosso servidor — um limite no `proxy.ts` teria sido decorativo. Limitador em memória por instância (`src/lib/seguranca/limite-tentativas.ts`), 5 tentativas/5min por e-mail; `/auth/confirm` limitado por IP. **Ceiling conhecido**: não é distribuído (não sobrevive a cold start nem se compartilha entre instâncias/regiões da Vercel) — upgrade pra Postgres (Supabase, já é dependência) ou Upstash Redis quando o tráfego justificar.
  - Testes automatizados (Vitest, `npm run test`): gerador de copy (invariante de não-repetição consecutiva em 300 gerações) e validação de assinatura/payload do webhook da Cakto — os dois pontos que, se quebrarem, ninguém compra ou ninguém recebe acesso.
  - Monitoramento de erro: decidido **não** adicionar Sentry por ora — a Vercel já expõe erros de runtime agregados (usei `get_runtime_errors` da integração Vercel pra confirmar que funciona, zero erros nas últimas 24h). Sentry fica como upgrade quando volume de tráfego justificar alerta proativo (push) em vez de consulta sob demanda.

## Sessão 31/08/2026 — melhorias pré-tráfego (9 pontos do dono)

Feito e verificado end-to-end (commits `7fb38c8`, `9ce3b33`, próximo):
- **Navegação da área logada**: link "Vitrine" no cabeçalho compartilhado (`src/app/app/cabecalho.tsx`) com estado ativo + "Voltar pra Vitrine" no topo de Configurações. Toda página sob `/app` tem como voltar.
- **Scroll dos filtros no mobile**: o trilho de chips (`src/app/app/vitrine/vitrine-client.tsx`) usava `mx-auto` num `w-max` dentro de um scroll container — a margem automática centralizava e deixava os primeiros chips inalcançáveis. Removido. (Fix por inspeção; não deu pra confirmar em viewport mobile real nesta sessão — o navegador de teste não redimensiona o viewport.)
- **Fluxo do modal em 3 passos** (`src/app/app/vitrine/modal-gerador.tsx`): (1) "Abrir produto na Shopee" pelo `offerLink` da casa (Double-Dip — mais uma via de receita), (2) campo pra colar o link de afiliado do próprio cliente, com escape hatch "não tenho link", (3) "Gerar copy" só libera com link válido; preview virou `<textarea>` editável. Testado no browser com sessão real.
- **Legenda de Instagram** na aba Imagem: reusa o gerador de copy no modo `instagram`, editável, com "Copiar legenda"; também vai no `text` do `navigator.share`. Testado.
- **Catálogo ≥50 por nicho**: `src/lib/produtos/sincronizar.ts` (`sincronizarCatalogo`) — feed global + top-up por categoria da Shopee (`NICHO_TO_SHOPEE_CATS` em `niches.ts`) até 50 por nicho. `salvarProdutos` virou reescrita completa: carimba `atualizado_em` com um único instante e apaga `where atualizado_em <> carimbo` (exato — a versão com janela de tempo deixava sobras acumularem em syncs próximos). Cron real: 700 produtos, todos os 9 nichos ≥50 (Casa 51, Cozinha 70, Beleza 83, Eletrônicos 94, Moda 74, Bebê 85, Pet 63, Esporte 80, Outros 100), ~17s. `maxDuration` do cron → 600.
- **Botão "Gerar novos produtos"** (`commit` desta sessão, versão final): **pra todos os clientes**, sem tocar na Shopee. A Vitrine mostra 48 produtos por vez do catálogo do dia (~700) e o botão avança uma página (produtos diferentes, respeitando a ordenação, voltando ao começo no fim) — zero chamada de API, instantâneo, por usuário. Descartada a primeira versão (server action `regerarCatalogo` + allowlist de e-mail) porque deixar todo cliente disparar `sincronizarCatalogo` era vetor de bloqueio da credencial Shopee + mutação global de tabela compartilhada. Sem opção "Variados" no seletor; "Mais vendidos" segue padrão. Testado no browser: paginação 1–48 → 49–96 com produtos diferentes, filtro de nicho reseta a página.

Ponto 8 — **enviar a própria foto** (`commit 8318d13`): a API da Shopee só dá uma imagem por produto (`productOfferV2.imageUrl`; introspecção do tipo confirma que não há galeria, e `getItemFeedData`/`listItemFeeds` são de conteúdo, não de produto). Em vez de escolher entre várias, o usuário manda a própria foto na aba Imagem — 100% client-side (object URL, nunca sobe, revogado ao trocar/fechar). `renderTemplate` ganhou 3º arg opcional de `imagemUrl`. Verificado no browser: html2canvas captura o object URL sem tainting.

Pontos 1 e 2 — **landing reconstruída** (`commit 2820f8d`): herói sem eyebrow com composição do app real (`src/app/_landing/app-showcase.tsx`, screenshots em `public/demo/*.jpg`, sem mockup skeleton); seções novas — "Três toques" (sequência), "É pra você se…", "A diferença" (na unha × com o Eita Promo), "O que entra no acesso", FAQ/objeções em `<details>`, "Garantia de 7 dias", nota de quem fez; barra de compra fixa no mobile. Garantia definida com o dono: **7 dias incondicional**. Nota do fundador com foco no público (não "sou afiliado"). Order bump do e-book **não** aparece na landing. Sem prova social fabricada — há espaço pra depoimentos entrarem depois.
Verificado no browser (desktop): herói, "A diferença", "O que entra", FAQ (abre/fecha), garantia, CTA final. **Não verificado**: layout mobile real (a ferramenta de browser desta sessão não redimensiona o viewport) — a barra fixa e o empilhamento dos cards do showcase precisam de um olhar no celular.
Correção de bug junto: `.lp-reveal` terminava o fade em `cover 25%`, deixando seções curtas invisíveis quando ocupavam o centro da tela; agora termina em `entry 90%`.

Ainda pendente da Fase 5 (marketing, não é código): variações de anúncio e roteiros de Reels pro @homidapromo.

## Roadmap combinado com o dono do produto (ordem de execução)

1. ~~Fase 1 — Legal + Pixel + segurança~~ ✅
2. ~~Fase 2 — Robustez técnica~~ ✅
3. **Fase 3 — Templates de imagem no Canva**, deixando selecionável pro usuário dentro do app (troca dos 3 templates HTML/CSS atuais, ou complementando).
4. **Fase 4 — Logo simples** pro produto (hoje é só o texto "EitaPromo" + ícone gerado via `next/og`).
5. **Fase 5 — Copy & Criativo** (🔄 quase lá — ver "Sessão 31/08/2026"): melhorias de app/funil e a landing nova (com demo real do app) feitas e commitadas; falta só o material de anúncio (variações de copy e roteiros de Reels pro @homidapromo) e uma passada de olho na landing/funil no celular de verdade.
6. **Fase 6 — Campanha paga**: verba de teste R$20-50/dia por 1-2 semanas antes de escalar, pelo Instagram **@homidapromo**. Execução: o agente opera o gerenciador de anúncios pelo navegador com o dono do produto acompanhando — nenhum clique que comprometa orçamento é feito sem confirmação em tempo real. Ver "Integração Meta Ads" abaixo pro caminho de acesso (conta de anúncios pessoal está desativada).

Meta: primeiros R$10k de faturamento na Cakto.

## Integração Meta Ads

- **Conta de anúncios pessoal (`108278922599080`) está desativada
  permanentemente** — restrição "Integridade da conta e identidade
  autêntica", confirmada pela IA do Meta como decisão definitiva, sem opção
  de recurso. Não insistir nessa conta.
- **Caminho pra Fase 6**: usar o gerenciador de anúncios **via Instagram
  @homidapromo**, não pela conta pessoal restrita. Duas formas, em ordem de
  preferência:
  1. **Gerenciador de Anúncios acessado a partir do login do Instagram**
     (não o botão "Turbinar" simplificado) — dá acesso às mesmas opções
     completas do Ads Manager normal (objetivos, segmentação, orçamento por
     conjunto de anúncios etc.), só que a conta de anúncios usada é a
     vinculada ao Instagram, não a pessoal desativada.
  2. **Botão "Turbinar publicação"** direto no app do Instagram — funciona
     (testado, cria/usa conta de anúncios própria do perfil profissional,
     não passa pela conta desativada), mas só oferece objetivos
     simplificados (mais mensagens, mais visitas ao perfil, mais cliques no
     link) — sem otimização por evento de conversão.
- Pixel ID `1632607598300164` configurado (local + Vercel produção) — o
  Pixel client-side já está ativo em produção e segue coletando dados
  independente de qual conta de anúncios roda a campanha, porque pertence
  ao site, não à conta restrita.
- **Conversions API (evento `Purchase` server-side) — pausada, não
  bloqueante.** Não é necessária pro Turbinar nem pro Ads Manager via
  Instagram, então não vale continuar insistindo agora. Se retomar depois:
  o token gerado pela tela de Conversions API do Gerenciador de Eventos só
  vem com escopo `read_ads_dataset_quality` (diagnóstico, não serve pra
  enviar evento); o caminho certo é criar um usuário do sistema em
  Configurações do Negócio → Usuários → Usuários do sistema, atribuir o
  pixel a ele pela **própria página do pixel** (não pela tela "adicionar
  ativos" do usuário — fica vazia com pixel sem pessoas atribuídas), criar
  um app qualquer no portfólio (Contas → Apps → Adicionar → Criar novo app,
  sem precisar de revisão), e só então gerar o token do usuário do sistema
  com escopo `ads_management` + `business_management`.
- MCP oficial adicionado (`https://mcp.facebook.com/ads`, confirmado real via
  DNS + resposta HTTP, não é um chute) — carrega só depois de reconectar a
  sessão, e requer OAuth com o login do próprio dono do produto (nenhuma
  senha passa pelo agente). Como a conta pessoal está desativada, checar na
  hora do OAuth se a autenticação também precisa ser feita pelo Instagram.
