import type { Produto } from "./tipos";

/**
 * Chave de "mesmo produto" pra deduplicar listagens quase iguais: a Shopee
 * devolve o mesmo achadinho de vendedores diferentes (ex.: dois "Percarbonato
 * Tira Manchas Calisul"), e ver o item repetido lado a lado na Vitrine passa
 * impressao de catalogo pobre. Normaliza o nome (sem acento, sem pontuacao) e
 * pega as primeiras palavras — o suficiente pra casar repost do mesmo item sem
 * colapsar produtos de verdade distintos.
 */
export const chaveProduto = (nome: string): string =>
  nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 7)
    .join(" ");

/**
 * Mantem a primeira ocorrencia de cada produto. A lista ja chega ordenada por
 * comissao desc, entao a que fica e a de maior comissao.
 */
export function deduplicarProdutos(produtos: Produto[]): Produto[] {
  const vistos = new Set<string>();
  return produtos.filter((p) => {
    const k = chaveProduto(p.nome);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}
