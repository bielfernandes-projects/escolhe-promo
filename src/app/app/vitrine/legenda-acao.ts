"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarLegenda } from "@/lib/copy/legenda";
import { excedeuLimite } from "@/lib/seguranca/limite-tentativas";
import type { Produto } from "@/lib/produtos/tipos";
import type { Nicho } from "@/lib/shopee/niches";

/**
 * Devolve a legenda de Instagram do Produto, gerando por IA na primeira vez.
 *
 * O cache é por Produto e mora no banco: a legenda de um produto serve todo
 * mundo que for divulgá-lo. Assim o custo é uma chamada por produto por dia
 * (~700 no pior caso), não uma por clique de cada cliente.
 *
 * Recebe só o `itemId`: os dados do produto são lidos do banco aqui dentro.
 * Antes a action aceitava o objeto Produto inteiro vindo do cliente, e como
 * ele alimenta o prompt do LLM e o resultado é cacheado com a service role
 * (compartilhado com TODO mundo), dava pra injetar texto no prompt e envenenar
 * a legenda de qualquer produto pra todos os usuários.
 */
export async function legendaDoProduto(
  itemId: string,
): Promise<{ ok: true; legenda: string } | { ok: false; erro: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Faça login de novo pra continuar." };

  if (typeof itemId !== "string" || !/^[\w-]{1,64}$/.test(itemId)) {
    return { ok: false, erro: "Produto inválido." };
  }

  const admin = createAdminClient();

  const { data: linha } = await admin
    .from("produtos")
    .select("item_id, nome, preco, comissao, taxa_comissao, vendas, avaliacao, taxa_desconto, nicho, imagem_url, offer_link, produto_link, legenda")
    .eq("item_id", itemId)
    .maybeSingle();

  if (!linha) return { ok: false, erro: "Produto não está na Vitrine de hoje." };
  if (linha.legenda) return { ok: true, legenda: linha.legenda as string };

  // Só limita quem vai de fato gastar uma chamada de IA (cache miss).
  if (excedeuLimite(`legenda:${user.id}`, 30, 60_000)) {
    return { ok: false, erro: "Muitas legendas seguidas. Espere um minuto." };
  }

  const numero = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const produto: Produto = {
    itemId: linha.item_id as string,
    nome: linha.nome as string,
    imagemUrl: linha.imagem_url as string,
    preco: numero(linha.preco),
    taxaComissao: numero(linha.taxa_comissao),
    comissao: numero(linha.comissao),
    vendas: (linha.vendas as number) ?? 0,
    avaliacao: numero(linha.avaliacao),
    taxaDesconto: numero(linha.taxa_desconto),
    nicho: linha.nicho as Nicho,
    offerLink: linha.offer_link as string,
    produtoLink: linha.produto_link as string,
  };

  try {
    const { texto } = await gerarLegenda(produto);
    // Grava sem bloquear a resposta em caso de falha de escrita: a legenda já
    // está pronta, e não conseguir cachear não é motivo pra frustrar o usuário.
    const { error } = await admin
      .from("produtos")
      .update({ legenda: texto, legenda_em: new Date().toISOString() })
      .eq("item_id", produto.itemId);
    if (error) console.error("[legenda] falhou ao cachear:", error.message);

    return { ok: true, legenda: texto };
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : "erro desconhecido";
    console.error("[legenda] falhou:", msg);
    return { ok: false, erro: "Não deu pra gerar a legenda agora. Tenta de novo." };
  }
}
