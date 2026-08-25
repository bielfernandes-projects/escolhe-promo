import { queryShopee } from "./client";
import { nichoFromCategoryTrail, type Nicho } from "./niches";

/** A product as the Vitrine needs it, with the Nicho already resolved. */
export type Produto = {
  itemId: string;
  nome: string;
  imagemUrl: string;
  /** In BRL. Shopee sends these as decimal strings. */
  preco: number;
  /** Fraction, e.g. 0.18 for 18%. */
  taxaComissao: number;
  comissao: number;
  vendas: number;
  avaliacao: number;
  nicho: Nicho;
  /** Affiliate link tied to the app owner's account — powers the Double-Dip. */
  offerLink: string;
  produtoLink: string;
};

type ProductOfferNode = {
  itemId: number;
  productName: string;
  imageUrl: string;
  price: string;
  commissionRate: string;
  commission: string;
  sales: number;
  ratingStar: string;
  productCatIds: number[];
  offerLink: string;
  productLink: string;
};

const PRODUCT_FIELDS = `
  itemId
  productName
  imageUrl
  price
  commissionRate
  commission
  sales
  ratingStar
  productCatIds
  offerLink
  productLink
`;

/**
 * Shopee sends money and rates as decimal strings; anything unparseable
 * becomes 0 so one malformed field cannot break a whole sync.
 */
function toNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toProduto(node: ProductOfferNode): Produto {
  return {
    itemId: String(node.itemId),
    nome: node.productName,
    imagemUrl: node.imageUrl,
    preco: toNumber(node.price),
    taxaComissao: toNumber(node.commissionRate),
    comissao: toNumber(node.commission),
    vendas: node.sales ?? 0,
    avaliacao: toNumber(node.ratingStar),
    nicho: nichoFromCategoryTrail(node.productCatIds ?? []),
    offerLink: node.offerLink,
    produtoLink: node.productLink,
  };
}

/**
 * Fetches offers from Shopee, walking pages until `limit` products are
 * collected or Shopee runs out. Page size is capped at 50 by the API.
 */
export async function fetchProdutos({
  limit = 200,
  categoryId,
}: {
  limit?: number;
  categoryId?: number;
} = {}): Promise<Produto[]> {
  const PAGE_SIZE = 50;
  const produtos: Produto[] = [];

  for (let page = 1; produtos.length < limit; page++) {
    const data = await queryShopee<{
      productOfferV2: { nodes: ProductOfferNode[] | null };
    }>(
      `query ProductOffers($page: Int!, $limit: Int!, $productCatId: Int) {
        productOfferV2(page: $page, limit: $limit, productCatId: $productCatId) {
          nodes { ${PRODUCT_FIELDS} }
        }
      }`,
      { page, limit: PAGE_SIZE, productCatId: categoryId ?? null },
    );

    const nodes = data.productOfferV2.nodes;
    if (!nodes?.length) break;

    produtos.push(...nodes.map(toProduto));
  }

  return produtos.slice(0, limit);
}
