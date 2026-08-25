-- Credenciais Shopee do proprio usuario — Integracao de Afiliado Propria.
-- Quando presente, o link de afiliado embutido na copy passa a ser gerado com
-- as credenciais do usuario (via generateShortLink) em vez do link da casa
-- (Double-Dip). Sem linha aqui, o comportamento de hoje continua intacto.
create table credenciais_afiliado (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  shopee_app_id   text,
  shopee_app_secret text,
  atualizado_em   timestamptz not null default now()
);

alter table credenciais_afiliado enable row level security;

create policy "usuario le a propria credencial"
  on credenciais_afiliado for select
  to authenticated
  using (auth.uid() = user_id);

create policy "usuario grava a propria credencial"
  on credenciais_afiliado for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "usuario atualiza a propria credencial"
  on credenciais_afiliado for update
  to authenticated
  using (auth.uid() = user_id);
