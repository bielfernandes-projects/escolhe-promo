-- Perfil público da afiliada + a leitura da vitrine pública.
--
-- Cada afiliada escolhe um `handle` e ganha uma página em
-- escolhepromo.com.br/@handle com as promoções que ela publicou.

create table perfis (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  -- minúsculas, [a-z0-9-], 3–30 — validado na server action.
  handle        text not null unique,
  nome_exibicao text not null,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table perfis enable row level security;

-- O handle e o nome são públicos por natureza (aparecem na página).
create policy "qualquer um lê perfis"
  on perfis for select
  using (true);

create policy "afiliada cria o próprio perfil"
  on perfis for insert to authenticated
  with check (auth.uid() = user_id);

create policy "afiliada edita o próprio perfil"
  on perfis for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Leitura da vitrine pública.
--
-- `security definer` pra não precisar abrir uma policy de SELECT anônimo em
-- `divulgacoes` inteira — a função devolve só as colunas seguras (sem
-- `comissao`, sem flags internas) das linhas já publicadas.
-- ---------------------------------------------------------------------------
create or replace function vitrine_publica(p_handle text)
returns table (
  nome_exibicao text,
  handle        text,
  divulgacao_id uuid,
  item_id       text,
  nome          text,
  preco         numeric,
  imagem_url    text,
  link_afiliado text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pr.nome_exibicao,
    pr.handle,
    d.id,
    d.item_id,
    d.nome,
    d.preco,
    d.imagem_url,
    d.link_afiliado
  from perfis pr
  join divulgacoes d
    on d.user_id = pr.user_id
   and d.na_vitrine = true
  where pr.handle = lower(p_handle)
  order by d.ordem asc, d.criado_em desc;
$$;

grant execute on function vitrine_publica(text) to anon, authenticated;
