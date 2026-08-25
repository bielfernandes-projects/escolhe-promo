-- Eita Promo — schema inicial
-- Rodar no SQL Editor do Supabase:
-- https://app.supabase.com/project/rorlucaegorqgdtbqfeb/sql/new

-- ---------------------------------------------------------------------------
-- Nicho: a taxonomia da Vitrine, derivada da Trilha de Categoria da Shopee.
-- Espelha src/lib/shopee/niches.ts — os dois precisam mudar juntos.
-- ---------------------------------------------------------------------------
create type nicho as enum (
  'Casa',
  'Cozinha',
  'Beleza',
  'Eletrônicos',
  'Moda',
  'Bebê & Infantil',
  'Pet',
  'Esporte & Fitness',
  'Outros'
);

-- ---------------------------------------------------------------------------
-- produtos: a Vitrine. Reescrita inteira pelo job diário.
-- ---------------------------------------------------------------------------
create table produtos (
  item_id           text primary key,
  nome              text not null,
  -- Imagem re-hospedada no Storage: servir direto da Shopee faria o canvas do
  -- gerador de imagens ser bloqueado por CORS.
  imagem_url        text not null,
  imagem_origem_url text not null,
  preco             numeric(10, 2) not null,
  -- Fração, não porcentagem: 0.18 = 18%.
  taxa_comissao     numeric(5, 4) not null,
  comissao          numeric(10, 2) not null,
  vendas            integer not null default 0,
  avaliacao         numeric(2, 1) not null default 0,
  nicho             nicho not null,
  -- Link de afiliado do dono do app: é o que sustenta o Double-Dip.
  offer_link        text not null,
  produto_link      text not null,
  atualizado_em     timestamptz not null default now()
);

create index produtos_nicho_idx on produtos (nicho);
create index produtos_comissao_idx on produtos (comissao desc);

-- ---------------------------------------------------------------------------
-- compras: o que o webhook da Cakto liberou para cada comprador.
-- Não existe self-signup — toda linha aqui nasce de um pagamento confirmado.
-- ---------------------------------------------------------------------------
create table compras (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  email           text not null,
  lifetime        boolean not null default false,
  ebook_turbinar  boolean not null default false,
  -- Chave de idempotência: a Cakto reenvia o webhook em caso de falha.
  cakto_order_id  text unique,
  criado_em       timestamptz not null default now()
);

create index compras_user_id_idx on compras (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table produtos enable row level security;
alter table compras enable row level security;

-- A Vitrine é o produto pago: só quem está logado enxerga.
create policy "Vitrine visível para autenticados"
  on produtos for select
  to authenticated
  using (true);

-- Cada comprador enxerga apenas a própria compra.
create policy "Comprador lê a própria compra"
  on compras for select
  to authenticated
  using (auth.uid() = user_id);

-- Nenhuma policy de insert/update/delete: as escritas acontecem pela
-- service role (job diário e webhook), que ignora RLS por definição.

-- ---------------------------------------------------------------------------
-- Storage: bucket público para as imagens re-hospedadas.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;
