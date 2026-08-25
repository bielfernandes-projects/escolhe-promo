import type { Produto } from "./tipos";

export const OPCOES_ORDENACAO = [
  "comissao-desc",
  "comissao-asc",
  "vendas-desc",
  "vendas-asc",
  "preco-desc",
  "preco-asc",
] as const;

export type Ordenacao = (typeof OPCOES_ORDENACAO)[number];

/** Padrao em toda aba: mais vendido primeiro — o que converte de verdade. */
export const ORDENACAO_PADRAO: Ordenacao = "vendas-desc";

export const ROTULOS_ORDENACAO: Record<Ordenacao, string> = {
  "comissao-desc": "Maior comissão",
  "comissao-asc": "Menor comissão",
  "vendas-desc": "Mais vendidos",
  "vendas-asc": "Menos vendidos",
  "preco-desc": "Maior preço",
  "preco-asc": "Menor preço",
};

const CAMPOS: Record<Ordenacao, (p: Produto) => number> = {
  "comissao-desc": (p) => p.comissao,
  "comissao-asc": (p) => p.comissao,
  "vendas-desc": (p) => p.vendas,
  "vendas-asc": (p) => p.vendas,
  "preco-desc": (p) => p.preco,
  "preco-asc": (p) => p.preco,
};

const CRESCENTE: Record<Ordenacao, boolean> = {
  "comissao-desc": false,
  "comissao-asc": true,
  "vendas-desc": false,
  "vendas-asc": true,
  "preco-desc": false,
  "preco-asc": true,
};

export function ordenarProdutos(produtos: Produto[], ordenacao: Ordenacao): Produto[] {
  const campo = CAMPOS[ordenacao];
  const sinal = CRESCENTE[ordenacao] ? 1 : -1;
  // slice() pra nao mutar o array vindo do server component.
  return produtos.slice().sort((a, b) => (campo(a) - campo(b)) * sinal);
}
