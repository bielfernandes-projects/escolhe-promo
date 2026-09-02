import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Produto } from "./tipos";
import { deduplicarProdutos } from "./dedupe";
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
  taxa_desconto: string | number;
  nicho: Nicho;
  offer_link: string;
  produto_link: string;
  atualizado_em: string;
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
  taxaDesconto: numero(linha.taxa_desconto),
  nicho: linha.nicho,
  offerLink: linha.offer_link,
  produtoLink: linha.produto_link,
});

const paraLinha = (produto: Produto, quando: string): LinhaProduto => ({
  item_id: produto.itemId,
  atualizado_em: quando,
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
  taxa_desconto: produto.taxaDesconto,
  nicho: produto.nicho,
  offer_link: produto.offerLink,
  produto_link: produto.produtoLink,
});

/**
 * Colunas que a Vitrine usa, explicitas de proposito.
 *
 * Com `select("*")` vinham junto `legenda` (o texto de IA, ate ~800
 * caracteres por linha, que so o modal pede sob demanda), `imagem_origem_url`
 * (copia identica de `imagem_url`) e `atualizado_em`. Como cada carregamento
 * da pagina le 1.5x o limite, isso eram centenas de KB por acesso que ninguem
 * chegava a usar — e o publico do app esta no celular, em rede movel.
 */
const COLUNAS_VITRINE =
  "item_id, nome, imagem_url, preco, taxa_comissao, comissao, vendas, avaliacao, taxa_desconto, nicho, offer_link, produto_link";

/**
 * Le a Vitrine.
 *
 * O catalogo e IGUAL pra todo usuario pagante num mesmo dia — o job diario
 * reescreve a tabela inteira e ninguem mais escreve nela. Entao a leitura e
 * cacheada 1h com `unstable_cache`: sem isso, cada navegacao na Vitrine puxava
 * ~260 KB do Supabase, e a 50 clientes/dia (750+ carregamentos) isso estourava
 * a cota de egress gratuita do Supabase (5 GB/mes) so com essa query.
 *
 * O controle de acesso NAO vive mais aqui — vive no layout de /app
 * (`temAcessoAtivo`) e no proxy, que barram quem nao tem compra ativa antes de
 * a pagina renderizar. Por isso o fetch usa a service role: a linha do catalogo
 * nao e secreta (sao produtos publicos da Shopee) e o gate ja passou.
 */
const lerCatalogoCru = unstable_cache(
  async (folga: number): Promise<LinhaProduto[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("produtos")
      .select(COLUNAS_VITRINE)
      .order("comissao", { ascending: false })
      .limit(folga);

    if (error) {
      throw new Error(`Nao deu pra ler a Vitrine: ${error.message}`);
    }
    return data as unknown as LinhaProduto[];
  },
  ["catalogo-vitrine"],
  // Sem invalidacao por tag: o job diario roda 1x/dia, entao no maximo 1h
  // depois dele todo mundo ja ve o catalogo novo. Ver as ~24 leituras/dia
  // contra centenas de milhares sem cache.
  { revalidate: 3600 },
);

export async function listarProdutos(limite = 700): Promise<Produto[]> {
  // Folga alem do limite: a deduplicacao corta linhas.
  const cru = await lerCatalogoCru(Math.ceil(limite * 1.5));
  return deduplicarProdutos(cru.map(deLinha)).slice(0, limite);
}

/**
 * Regrava a Vitrine. Usa a service role porque a tabela nao tem policy de
 * escrita — por desenho, so o job diario escreve aqui.
 */
export async function salvarProdutos(produtos: Produto[]): Promise<number> {
  if (produtos.length === 0) return 0;

  const supabase = createAdminClient();
  const agora = new Date();
  const carimbo = agora.toISOString();

  const { error } = await supabase
    .from("produtos")
    .upsert(
      produtos.map((p) => paraLinha(p, carimbo)),
      { onConflict: "item_id" },
    );

  if (error) {
    throw new Error(`Nao deu pra gravar a Vitrine: ${error.message}`);
  }

  // Reescrita completa: todo produto deste lote ficou com atualizado_em ===
  // carimbo (o mesmo instante). Apaga qualquer linha com outro carimbo — sao
  // sobras de sincronizacoes anteriores. Sem isso o upsert so acumula e, com o
  // tempo, os nichos magros somem porque a leitura corta no top-N por comissao.
  const { error: erroLimpeza } = await supabase
    .from("produtos")
    .delete()
    .neq("atualizado_em", carimbo);

  if (erroLimpeza) {
    throw new Error(`Nao deu pra limpar a Vitrine: ${erroLimpeza.message}`);
  }

  return produtos.length;
}
