-- O que cada afiliada já divulgou.
--
-- Serve pra duas coisas: (1) marcar "já divulgado" no card da Vitrine pra ela
-- não andar em círculos; (2) alimentar a vitrine pública dela (fase 2).
--
-- Os campos de produto são SNAPSHOT: o catálogo do dia (`produtos`) rotaciona
-- e o item some amanhã, mas a divulgação tem que continuar de pé.
-- `na_vitrine` e `ordem` já entram agora, vazios — a fase 2 só monta a UI.

create table divulgacoes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  -- Âncora estável do produto na Shopee (Produto.itemId).
  item_id           text not null,
  nome              text not null,
  preco             numeric not null,
  imagem_url        text not null,
  comissao          numeric not null,
  -- O link que saiu na divulgação: o dela (colado no passo 2) ou o da casa.
  link_afiliado     text not null,
  usou_link_proprio boolean not null,
  -- Vitrine pública (fase 2): só entra o que usa o link próprio dela.
  na_vitrine        boolean not null default false,
  ordem             integer not null default 0,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now(),
  -- Uma linha por produto por afiliada; re-divulgar só atualiza.
  unique (user_id, item_id)
);

create index divulgacoes_user_idx on divulgacoes (user_id);

alter table divulgacoes enable row level security;

-- A afiliada mexe só nas próprias divulgações. A server action roda com a
-- sessão dela, então RLS direto basta — não precisa service role.
create policy "afiliada lê as próprias divulgações"
  on divulgacoes for select to authenticated
  using (auth.uid() = user_id);

create policy "afiliada cria as próprias divulgações"
  on divulgacoes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "afiliada edita as próprias divulgações"
  on divulgacoes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "afiliada apaga as próprias divulgações"
  on divulgacoes for delete to authenticated
  using (auth.uid() = user_id);
