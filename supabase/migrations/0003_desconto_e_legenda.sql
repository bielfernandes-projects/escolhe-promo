-- Dois campos novos na Vitrine.
--
-- taxa_desconto: a % de desconto que a Shopee informa (priceDiscountRate).
-- 87% dos produtos vêm com ela. O preço "de" sai de
-- preco / (1 - taxa_desconto/100) — a Shopee não devolve o valor cheio pronto.
-- Usado só nas legendas, e só quando o desconto é crível; a imagem continua
-- mostrando apenas o preço atual.
--
-- legenda: cache da legenda de Instagram gerada por IA. É por produto, não por
-- usuário: a mesma legenda serve todo mundo que divulgar aquele produto no dia,
-- então o custo é uma chamada por produto em vez de uma por clique.
alter table produtos
  add column if not exists taxa_desconto numeric(5,2) not null default 0,
  add column if not exists legenda text,
  add column if not exists legenda_em timestamptz;
