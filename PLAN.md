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
- **Integração de Afiliado Própria**: o cliente final conecta suas próprias credenciais da API de Afiliados Shopee pra que o app gere automaticamente o link de afiliado dele a partir da URL do produto colada, em vez de colar um link já criado manualmente. Fora do MVP porque guardar credenciais de API de terceiros com segurança (criptografia, rotação, revogação) é uma superfície de risco considerável pra uma v1.
