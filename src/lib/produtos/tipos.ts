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
  nicho: Nicho;
  /** Link de afiliado do dono do app — sustenta o Double-Dip. */
  offerLink: string;
  produtoLink: string;
};
