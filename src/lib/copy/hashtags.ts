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

export function hashtagsDoNicho(nicho: Nicho): string {
  return [...BASE, ...POR_NICHO[nicho]].join(" ");
}
