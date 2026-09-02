-- Reembolso e chargeback revogam o acesso.
--
-- Ate agora o acesso era "tem sessao no Supabase?" — uma compra reembolsada
-- continuava valendo pra sempre. Agora o webhook da Cakto marca a compra ao
-- receber `refund`/`chargeback`, e o layout de /app so deixa entrar quem tem
-- pelo menos uma compra sem reembolso.

alter table compras
  add column if not exists reembolsada_em timestamptz;

-- O check de acesso e "existe compra ativa pra esse user?" — indice parcial
-- cobre exatamente essa query.
create index if not exists compras_acesso_idx
  on compras (user_id)
  where reembolsada_em is null;
