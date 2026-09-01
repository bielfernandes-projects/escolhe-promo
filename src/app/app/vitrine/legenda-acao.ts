"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarLegenda } from "@/lib/copy/legenda";
import type { Produto } from "@/lib/produtos/tipos";

/**
 * Devolve a legenda de Instagram do Produto, gerando por IA na primeira vez.
 *
 * O cache é por Produto e mora no banco: a legenda de um produto serve todo
 * mundo que for divulgá-lo. Assim o custo é uma chamada por produto por dia
 * (~700 no pior caso), não uma por clique de cada cliente — que era o que
 * tornaria a IA inviável num produto de pagamento único.
 *
 * A escrita usa a service role porque `produtos` não tem policy de escrita, por
 * desenho. A leitura de sessão acontece antes: só quem tem acesso ao app gera.
 */
export async function legendaDoProduto(
  produto: Produto,
): Promise<{ ok: true; legenda: string } | { ok: false; erro: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Faça login de novo pra continuar." };

  const admin = createAdminClient();

  const { data: linha } = await admin
    .from("produtos")
    .select("legenda")
    .eq("item_id", produto.itemId)
    .maybeSingle();

  if (linha?.legenda) return { ok: true, legenda: linha.legenda as string };

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
