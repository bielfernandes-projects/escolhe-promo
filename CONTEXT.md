# Escolhe Promo

Micro SaaS B2C que gera copy e imagens para afiliados Shopee divulgarem produtos no WhatsApp e Instagram.

## Language

**Vitrine**:
Lista de Top Produtos exibida no app (foto, título, preço, comissão), filtrável por Nicho.
_Avoid_: Catálogo

**Produto**:
Um item da Vitrine, obtido via `productOfferV2` da Shopee Affiliate Open API.

**Nicho**:
Categoria de um Produto (Casa, Beleza, Eletrônicos, Moda, Bebê & Infantil, Pet, Esporte & Fitness, Cozinha, Outros) usada como filtro na Vitrine. Derivado da Trilha de Categoria da Shopee, não do título do Produto.
_Avoid_: Categoria (esse termo designa a taxonomia da Shopee, não a nossa), tag

**Trilha de Categoria**:
O array `productCatIds` que a Shopee devolve para um Produto: os IDs numéricos de categoria do nível 1 ao 3, do mais geral ao mais específico. É a fonte de verdade a partir da qual o Nicho é derivado.

**Template de Copy**:
A copy de WhatsApp: uma abertura e um fechamento sorteados (arrays de variações em `src/lib/copy/slots.ts`, com anti-repetição consecutiva) em volta de um miolo fixo — *nome* em negrito, 🏷️ De / 💰 Por / 🎯 Desconto (o "De" é calculado de `preco / (1 - taxa/100)`, some se a taxa for inválida ou o abatimento < R$ 0,50) e 🔗 o link colado pelo usuário. Há duas listas de abertura, com e sem desconto.

**Legenda de Instagram**:
Texto gerado por IA (OpenRouter, modelos `:free`) pra aba Instagram, com fallback local se a chamada falhar. Cache por Produto no banco (colunas `legenda`, `legenda_em`), não por clique. Sai com Hashtags do nicho.

**Hashtags**:
Conjunto de hashtags por Nicho (`src/lib/copy/hashtags.ts`), base fixa de achadinho mais um set por nicho. Beleza se divide por heurística de nome do Produto entre cuidados femininos e barba/masculino.

**Template Visual**:
Um layout que gera a imagem de divulgação (Feed 4:5 ou Story 9:16) no estilo "achadinho" — preço em destaque, uma foto (a do Produto por padrão, ou uma que o usuário enviou) e enfeites fixos. Montado pelo satori/next-og no servidor (rota `/api/imagem`), não no DOM — o html2canvas embaralhava o texto com fonte forte.

**Moldura**:
Um Template Visual cuja arte foi desenhada no Canva e exportada em PNG, em vez de montada em código. No Canva, as áreas que o app preenche são pintadas de magenta puro (`#FF00FF`); `scripts/preparar-moldura.ps1` converte cada área em furo transparente (onde a foto do Produto entra por baixo) ou em tarja branca (onde o app escreve texto). A geometria de cada slot fica em `MOLDURAS`, em `src/lib/imagem/templates.tsx`. Os PNGs originais ficam em `arte-canva/` e os preparados em `public/templates/`.
_Avoid_: template do Canva (o app não fala com a API do Canva — o Autofill dela exige plano Enterprise)

**Double-Dip**:
Ao abrir o modal de um Produto, o passo 1 é o botão "Abrir produto na Shopee", que leva pelo link de afiliado do dono do app — o usuário passa por esse link no caminho de pegar o próprio link de afiliado na Shopee. Se ele seguir sem colar um link próprio ("não tenho um link de afiliado"), a copy também sai com o link do dono. Nos dois casos o dono monetiza.

**Lifetime Deal**:
A oferta paga: acesso vitalício ao app por um pagamento único (R$ 47). Desde 02/09/2026 vem depois do Teste Grátis — a pessoa testa 7 dias e só então paga pra continuar.

**Teste Grátis**:
7 dias de acesso total ao app, sem cartão, criados em `/cadastro` a partir da landing. Uma linha em `compras` com `cakto_order_id` nulo e `trial_expira_em = agora + 7 dias`; `tem_compra_ativa()` (RLS) e `checarAcesso` (`src/lib/auth/acesso.ts`) aceitam a linha enquanto `trial_expira_em > now()`. No 8º dia sem comprar, o layout de `/app` manda pra `/acesso-encerrado?de=teste` (paywall duro — não existe versão grátis permanente). Faixa de aviso (`aviso-teste.tsx`) aparece nos últimos 3 dias. Ao comprar, o webhook da Cakto insere a linha paga como segunda linha e a de teste fica inerte.

**Order Bump**:
Oferta complementar adicionada no checkout com um clique, sem interromper a compra — no MVP, o e-book "Turbinar".

**Integração de Afiliado Própria**:
Em Configurações o usuário salva App ID/Secret da própria conta Shopee (Secret criptografado em repouso). Serve de fallback do fluxo do modal: se ele clicar em "não tenho um link de afiliado", o app tenta gerar o link pessoal dele via `generateShortLink` a partir da URL do produto; sem credencial ou em caso de falha, cai no link do dono (Double-Dip). O caminho principal continua sendo o usuário colar o próprio link.

**Marca**:
O símbolo do Escolhe Promo — a arte do Canva (`arte-canva/logo.png`, servida como `/icon.png`) (balão de conversa + etiqueta de preço + raio, sem o nome escrito). Vive em `src/app/_brand/marca.tsx`: `MarcaSimbolo` é só a arte, `Wordmark` é o texto "Escolhe **Promo**", `Marca` é o lockup dos dois. Os ícones do site são PNGs estáticos em `src/app/` (`icon.png`, `apple-icon.png`, `favicon.ico`).

**Gerar novos produtos**:
Botão da Vitrine que avança uma página do catálogo do dia (48 Produtos por vez de ~700). É paginação client-side — não busca nada novo na Shopee. O catálogo em si só é reescrito pelo job diário.
