/**
 * Derives our Nicho taxonomy from Shopee's own category IDs.
 *
 * Shopee returns a Trilha de Categoria (`productCatIds`) per product: the
 * category IDs from level 1 to 3, broadest first. Mapping from those IDs is
 * deterministic — unlike matching keywords in product titles, it does not
 * break when a seller rewrites a title.
 *
 * The IDs below were derived from a 500-product sample of the live Brazilian
 * catalogue (21 distinct root categories). See PLAN.md.
 */

export const NICHOS = [
  "Casa",
  "Cozinha",
  "Beleza",
  "Eletrônicos",
  "Moda",
  "Bebê & Infantil",
  "Pet",
  "Esporte & Fitness",
  "Outros",
] as const;

export type Nicho = (typeof NICHOS)[number];

/** Root category (level 1) → Nicho. */
const ROOT_CATEGORY_TO_NICHO: Record<number, Nicho> = {
  100010: "Casa", // eletrodomésticos — ferro de passar, aspirador
  100630: "Beleza", // perfumaria, body splash
  100631: "Pet",
  100637: "Esporte & Fitness",

  // Eletrônicos, spread across several roots
  100013: "Eletrônicos", // celulares e acessórios
  100535: "Eletrônicos", // áudio, fones
  100634: "Eletrônicos", // games e consoles
  100635: "Eletrônicos", // câmeras
  100644: "Eletrônicos", // computadores, periféricos

  // Moda, spread across several roots
  100011: "Moda", // roupas masculinas
  100012: "Moda", // calçados
  100016: "Moda", // bolsas
  100017: "Moda", // pijamas, moda íntima
  100532: "Moda", // calçados femininos

  100632: "Bebê & Infantil", // brinquedos, higiene infantil
  100633: "Bebê & Infantil", // roupas infantis

  100001: "Outros", // saúde — nebulizador, seringa
  100015: "Outros", // malas e viagem
  100638: "Outros", // papelaria, impressoras
  102187: "Outros", // automotivo
};

/**
 * Root 100636 ("casa e decoração") holds ~30% of the catalogue and straddles
 * two of our niches, so it is split by its level-2 category. Anything not
 * listed here falls through to Casa.
 */
const CASA_DECORACAO_ROOT = 100636;

const CASA_DECORACAO_LEVEL2_TO_NICHO: Record<number, Nicho> = {
  100716: "Cozinha", // potes, lixeira, pano de prato
  100717: "Cozinha", // marmitas, herméticos, travessas
  100718: "Cozinha", // garrafa térmica, talheres, canecas
  100715: "Outros", // ferramentas, parafusadeiras
};

/**
 * Inverso do mapa acima: por Nicho, as categorias raiz da Shopee que o
 * alimentam. Usado pelo sync pra buscar `productOfferV2` por categoria e
 * garantir fundo de catalogo em todo Nicho (o feed global sozinho enche so
 * Casa/Cozinha). "Outros" fica de fora — vem do que sobra do feed global.
 * Casa e Cozinha dividem a raiz 100636; a de-duplicacao por item_id no sync
 * cuida da sobreposicao.
 */
export const NICHO_TO_SHOPEE_CATS: Record<Exclude<Nicho, "Outros">, number[]> = {
  Casa: [CASA_DECORACAO_ROOT, 100010],
  Cozinha: [CASA_DECORACAO_ROOT],
  Beleza: [100630],
  Eletrônicos: [100013, 100535, 100634, 100635, 100644],
  Moda: [100011, 100012, 100016, 100017, 100532],
  "Bebê & Infantil": [100632, 100633],
  Pet: [100631],
  "Esporte & Fitness": [100637],
};

/**
 * Resolves a product's Trilha de Categoria to a Nicho. Products whose category
 * we have not mapped land in "Outros" rather than being dropped, so the Vitrine
 * never silently loses inventory when Shopee adds a category.
 */
export function nichoFromCategoryTrail(categoryTrail: number[]): Nicho {
  const [root, level2] = categoryTrail;

  if (root === CASA_DECORACAO_ROOT) {
    // Shopee pads the trail with 0 when a product has no level-2 category,
    // so an absent level is 0 rather than undefined.
    return CASA_DECORACAO_LEVEL2_TO_NICHO[level2] ?? "Casa";
  }

  return ROOT_CATEGORY_TO_NICHO[root] ?? "Outros";
}
