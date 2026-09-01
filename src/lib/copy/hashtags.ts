import type { Nicho } from "@/lib/shopee/niches";

/**
 * Hashtags por Nicho. As três primeiras são fixas (o público de achadinho
 * procura por elas) e as demais dão contexto de categoria.
 *
 * Não passam de ~8: no Instagram, um bloco enorme de hashtags genéricas hoje
 * atrapalha mais do que ajuda, e denuncia post automatizado.
 */
const BASE = ["#achadinhos", "#achadinhosdashopee", "#shopee"];

const POR_NICHO: Record<Nicho, string[]> = {
  Casa: ["#casa", "#organizacao", "#decoracao", "#donadecasa"],
  Cozinha: ["#cozinha", "#utilidadesdomesticas", "#receitas", "#cozinhando"],
  Beleza: ["#beleza", "#skincare", "#autocuidado", "#maquiagem"],
  Eletrônicos: ["#eletronicos", "#tecnologia", "#gadgets", "#setup"],
  Moda: ["#moda", "#look", "#estilo", "#modafeminina"],
  "Bebê & Infantil": ["#maternidade", "#bebe", "#enxoval", "#maedemenina"],
  Pet: ["#pet", "#petshop", "#caes", "#gatos"],
  "Esporte & Fitness": ["#fitness", "#treino", "#academia", "#vidasaudavel"],
  Outros: ["#promocao", "#ofertas", "#comprasonline"],
};

/**
 * O Nicho "Beleza" mistura skincare e maquiagem com barbeador e pomada de
 * barba, e as hashtags femininas ficavam esquisitas num aparador masculino.
 * A Shopee não separa isso numa categoria própria, então a distinção sai do
 * nome do produto.
 *
 * É uma heurística de apresentação, não de classificação: se errar, o custo é
 * uma hashtag menos adequada — o Produto continua em Beleza. Por isso aqui
 * palavra-chave é aceitável, ao contrário do Nicho, que vem da Trilha de
 * Categoria justamente pra não quebrar quando o vendedor reescreve o título.
 */
const BELEZA_MASCULINA = [
  "#barba",
  "#barbearia",
  "#cuidadomasculino",
  "#estilomasculino",
];

const TERMOS_MASCULINOS =
  /barbe|barba|navalha|bigode|cavanhaque|masculin|\bhomem\b|\bhomens\b/i;

export function hashtagsDoNicho(nicho: Nicho, nomeProduto = ""): string {
  const especificas =
    nicho === "Beleza" && TERMOS_MASCULINOS.test(nomeProduto)
      ? BELEZA_MASCULINA
      : POR_NICHO[nicho];
  return [...BASE, ...especificas].join(" ");
}
