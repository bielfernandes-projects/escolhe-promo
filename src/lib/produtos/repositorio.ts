import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Produto } from "./tipos";
import type { Nicho } from "@/lib/shopee/niches";

/** A Vitrine no formato em que o Postgres guarda (snake_case). */
type LinhaProduto = {
  item_id: string;
  nome: string;
  imagem_url: string;
  imagem_origem_url: string;
  preco: string | number;
  taxa_comissao: string | number;
  comissao: string | number;
  vendas: number;
  avaliacao: string | number;
  nicho: Nicho;
  offer_link: string;
  produto_link: string;
};

/** O Postgres devolve numeric como string pra nao perder precisao. */
const numero = (valor: string | number): number => {
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : 0;
};

const deLinha = (linha: LinhaProduto): Produto => ({
  itemId: linha.item_id,
  nome: linha.nome,
  imagemUrl: linha.imagem_url,
  preco: numero(linha.preco),
  taxaComissao: numero(linha.taxa_comissao),
  comissao: numero(linha.comissao),
  vendas: linha.vendas ?? 0,
  avaliacao: numero(linha.avaliacao),
  nicho: linha.nicho,
  offerLink: linha.offer_link,
  produtoLink: linha.produto_link,
});

const paraLinha = (produto: Produto): LinhaProduto => ({
  item_id: produto.itemId,
  nome: produto.nome,
  // Sem re-hospedagem: o CDN da Shopee manda `access-control-allow-origin: *`,
  // entao o html2canvas consegue capturar a imagem direto da origem.
  imagem_url: produto.imagemUrl,
  imagem_origem_url: produto.imagemUrl,
  preco: produto.preco,
  taxa_comissao: produto.taxaComissao,
  comissao: produto.comissao,
  vendas: produto.vendas,
  avaliacao: produto.avaliacao,
  nicho: produto.nicho,
  offer_link: produto.offerLink,
  produto_link: produto.produtoLink,
});

/**
 * Le a Vitrine para o usuario logado. Passa pelo RLS: a policy
 * "Vitrine visivel para autenticados" so libera quem tem sessao.
 */
export async function listarProdutos(limite = 200): Promise<Produto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("comissao", { ascending: false })
    .limit(limite);

  if (error) {
    throw new Error(`Nao deu pra ler a Vitrine: ${error.message}`);
  }

  return (data as LinhaProduto[]).map(deLinha);
}

/**
 * Regrava a Vitrine. Usa a service role porque a tabela nao tem policy de
 * escrita — por desenho, so o job diario escreve aqui.
 */
export async function salvarProdutos(produtos: Produto[]): Promise<number> {
  if (produtos.length === 0) return 0;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("produtos")
    .upsert(produtos.map(paraLinha), { onConflict: "item_id" });

  if (error) {
    throw new Error(`Nao deu pra gravar a Vitrine: ${error.message}`);
  }

  return produtos.length;
}
