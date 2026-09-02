"use server";

import { createClient } from "@/lib/supabase/server";
import { linkShopeeValido } from "@/lib/seguranca/urls";

/**
 * O que o cliente pode mandar. De propósito NÃO inclui nome/preço/imagem: uma
 * server action é um endpoint público, então qualquer coisa vinda daqui é
 * entrada hostil. Como a divulgação é renderizada na vitrine PÚBLICA da
 * afiliada, aceitar esses campos crus deixava qualquer usuário logado publicar
 * texto e imagem arbitrários numa página nossa — e um `javascript:` no link
 * viraria XSS armazenado. O snapshot do produto é lido do banco aqui dentro.
 */
export type DadosDivulgacao = {
  itemId: string;
  linkAfiliado: string;
  usouLinkProprio: boolean;
};

export async function registrarDivulgacao(
  dados: DadosDivulgacao,
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessão expirada." };

  if (typeof dados?.itemId !== "string" || !/^[\w-]{1,64}$/.test(dados.itemId)) {
    return { ok: false, erro: "Produto inválido." };
  }

  // O link vai virar `href` numa página pública. Só passa https de host da
  // Shopee — ver src/lib/seguranca/urls.ts.
  if (!linkShopeeValido(dados.linkAfiliado)) {
    return { ok: false, erro: "Link de afiliada inválido." };
  }

  // Snapshot vem do catálogo, nunca do cliente.
  const { data: produto } = await supabase
    .from("produtos")
    .select("item_id, nome, preco, imagem_url, comissao")
    .eq("item_id", dados.itemId)
    .maybeSingle();

  if (!produto) return { ok: false, erro: "Produto não está na Vitrine de hoje." };

  const { error } = await supabase.from("divulgacoes").upsert(
    {
      user_id: user.id,
      item_id: produto.item_id,
      nome: produto.nome,
      preco: produto.preco,
      imagem_url: produto.imagem_url,
      comissao: produto.comissao,
      link_afiliado: dados.linkAfiliado.trim(),
      usou_link_proprio: dados.usouLinkProprio === true,
      atualizado_em: new Date().toISOString(),
      // Só promove (nunca rebaixa): omitido, a linha nova cai no default
      // `false` e a existente mantém o valor atual.
      ...(dados.usouLinkProprio === true ? { na_vitrine: true } : {}),
    },
    { onConflict: "user_id,item_id" },
  );

  if (error) {
    console.error("[divulgacao] falha ao registrar:", error.message);
    return { ok: false, erro: "Não deu pra salvar agora." };
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
