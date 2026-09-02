-- Teste grátis de 7 dias na frente do pagamento único.
--
-- Até aqui "ter acesso" era: existir uma linha em `compras` sem reembolso — e
-- toda linha nascia de um pagamento na Cakto. Agora a pessoa cria a conta em
-- /cadastro (sem cartão), ganha uma linha de `compras` SEM `cakto_order_id` e
-- com `trial_expira_em = agora + 7 dias`, e usa tudo por 7 dias. Passou o prazo
-- sem comprar, o acesso encerra (o layout de /app manda pra /acesso-encerrado).
--
-- Quem paga continua com pagamento ÚNICO: o webhook insere a linha paga normal
-- (com `cakto_order_id`), que vale pra sempre. Quem já comprou antes desta
-- migration tem `cakto_order_id` preenchido e `trial_expira_em` nulo — segue
-- com acesso vitalício, sem mudança.

alter table compras
  add column if not exists trial_expira_em timestamptz;

-- Índice parcial pro caminho quente: "esse user tem teste em andamento?"
create index if not exists compras_teste_idx
  on compras (user_id)
  where cakto_order_id is null and reembolsada_em is null;

-- ---------------------------------------------------------------------------
-- A regra de acesso passa a aceitar teste em andamento.
--
-- Tem acesso quem tem ao menos uma linha não-reembolsada que seja OU uma compra
-- de verdade (`cakto_order_id` preenchido — inclui as linhas 'manual-...' de
-- contas de teste internas) OU um teste que ainda não expirou.
-- ---------------------------------------------------------------------------
create or replace function tem_compra_ativa()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from compras c
    where c.user_id = auth.uid()
      and c.reembolsada_em is null
      and (
        c.cakto_order_id is not null
        or (c.trial_expira_em is not null and c.trial_expira_em > now())
      )
  );
$$;

grant execute on function tem_compra_ativa() to authenticated;

-- ---------------------------------------------------------------------------
-- A vitrine pública some quando o teste expira (mesma regra de quando a compra
-- é reembolsada). `vitrine_publica` é security definer e faz a checagem por
-- dentro — precisa espelhar o predicado acima.
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
    and exists (
      select 1 from compras c
      where c.user_id = pr.user_id
        and c.reembolsada_em is null
        and (
          c.cakto_order_id is not null
          or (c.trial_expira_em is not null and c.trial_expira_em > now())
        )
    )
  order by d.ordem asc, d.criado_em desc
  limit 500;
$$;

grant execute on function vitrine_publica(text) to anon, authenticated;
