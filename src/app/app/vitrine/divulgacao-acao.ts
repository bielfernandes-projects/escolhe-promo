"use server";

import { createClient } from "@/lib/supabase/server";

export type DadosDivulgacao = {
  itemId: string;
  nome: string;
  preco: number;
  imagemUrl: string;
  comissao: number;
  linkAfiliado: string;
  usouLinkProprio: boolean;
};

/**
 * Registra (ou atualiza) uma divulgação quando a afiliada compartilha um
 * produto. Chamada dos botões de compartilhar/baixar/WhatsApp do modal.
 *
 * `na_vitrine` só fica true com o link próprio dela — mandar os seguidores dela
 * pro link da casa seria dar a comissão pra casa. Um re-share com o link
 * próprio depois de um com o link da casa promove pra vitrine; nunca rebaixa.
 */
export async function registrarDivulgacao(
  dados: DadosDivulgacao,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("divulgacoes").upsert(
    {
      user_id: user.id,
      item_id: dados.itemId,
      nome: dados.nome,
      preco: dados.preco,
      imagem_url: dados.imagemUrl,
      comissao: dados.comissao,
      link_afiliado: dados.linkAfiliado,
      usou_link_proprio: dados.usouLinkProprio,
      atualizado_em: new Date().toISOString(),
      // Só promove (nunca rebaixa): omitido, a linha nova cai no default
      // `false` e a existente mantém o valor atual.
      ...(dados.usouLinkProprio ? { na_vitrine: true } : {}),
    },
    { onConflict: "user_id,item_id" },
  );

  if (error) {
    console.error("[divulgacao] falha ao registrar:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

/** Os item_id que a afiliada já divulgou — pra marcar os cards da Vitrine. */
export async function listarItensDivulgados(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("divulgacoes")
    .select("item_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("[divulgacao] falha ao listar:", error.message);
    return [];
  }
  return (data ?? []).map((d) => d.item_id as string);
}
