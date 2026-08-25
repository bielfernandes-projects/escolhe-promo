# Eita Promo

Micro SaaS B2C que gera copy e imagens para afiliados Shopee divulgarem produtos no WhatsApp e Instagram.

## Language

**Vitrine**:
Lista de Top Produtos exibida no app (foto, título, preço, comissão), filtrável por Nicho.
_Avoid_: Catálogo

**Produto**:
Um item da Vitrine, obtido via `productOfferV2` da Shopee Affiliate Open API.

**Nicho**:
Categoria de um Produto (Casa, Beleza, Eletrônicos, Moda, Bebê & Infantil, Pet, Esporte & Fitness, Cozinha, Outros) usada como filtro na Vitrine. Não vem da API da Shopee — é atribuída por tagueamento de palavra-chave no título do Produto.
_Avoid_: Categoria (fora da referência ao campo interno), tag

**Template de Copy**:
Conjunto de quatro slots (Abertura, Benefício, Urgência, Fechamento), cada um com um array de variações; o sorteio de uma variação por slot gera uma copy única.

**Template Visual**:
Um dos 3 a 5 layouts HTML/CSS usados para renderizar, no client, uma imagem de Feed ou Story com foto e preço do Produto selecionado.

**Double-Dip**:
Quando o usuário da Vitrine não colou seu próprio link de afiliado, o clique no Produto usa o link de afiliado do dono do app em vez de ficar sem monetização.

**Lifetime Deal**:
A oferta principal: acesso vitalício ao app por um pagamento único (R$ 47–67).

**Order Bump**:
Oferta complementar adicionada no checkout com um clique, sem interromper a compra — no MVP, o e-book "Turbinar".

**Integração de Afiliado Própria**:
Recurso de backlog (fora do MVP) em que o usuário conecta as próprias credenciais da API de Afiliados Shopee para que o app gere automaticamente o link de afiliado dele a partir da URL do produto, em vez de ele colar um link já criado manualmente.
