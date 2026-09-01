import type { Nicho } from "@/lib/shopee/niches";

/**
 * Um Produto como a Vitrine precisa dele, com o Nicho ja resolvido.
 *
 * Mora aqui, e nao junto do cliente da Shopee, porque os componentes de tela
 * precisam deste tipo e nao podem importar nada que carregue o app secret.
 */
export type Produto = {
  itemId: string;
  nome: string;
  imagemUrl: string;
  /** Em BRL. A Shopee manda como string decimal. */
  preco: number;
  /** Fracao, ex.: 0.18 para 18%. */
  taxaComissao: number;
  comissao: number;
  vendas: number;
  avaliacao: number;
  /**
   * Percentual de desconto informado pela Shopee (0 a 100). O preço "de" não
   * vem pronto: sai de `preco / (1 - taxaDesconto/100)`. Ver `precoDe()`.
   */
  taxaDesconto: number;
  nicho: Nicho;
  /** Link de afiliado do dono do app — sustenta o Double-Dip. */
  offerLink: string;
  produtoLink: string;
};

/**
 * Teto de desconto que ainda soa verdadeiro numa legenda.
 *
 * A Shopee informa descontos de 65%, 76%, 79% em cima de um "preço cheio" que
 * quase nunca foi praticado — anunciar "de R$ 99,95 por R$ 20,99" queima a
 * credibilidade de quem posta. Acima deste teto o "de" é omitido.
 */
const DESCONTO_CRIVEL_MAX = 50;

/**
 * Preço antes da promoção, ou `null` quando não há desconto informado ou
 * quando ele é grande demais pra ser crível.
 */
export function precoDe(produto: Produto): number | null {
  const taxa = produto.taxaDesconto;
  if (taxa <= 0 || taxa > DESCONTO_CRIVEL_MAX) return null;
  const de = produto.preco / (1 - taxa / 100);
  // Um "de" que arredonda pro mesmo valor do "por" não acrescenta nada.
  return de - produto.preco >= 0.5 ? de : null;
}
