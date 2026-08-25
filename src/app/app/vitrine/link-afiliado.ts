"use server";

import { createClient } from "@/lib/supabase/server";
import { queryShopee } from "@/lib/shopee/client";

/**
 * Gera um link de afiliado assinado com as credenciais do PROPRIO usuario
 * (Integracao de Afiliado Propria), pra ele nao depender do Double-Dip.
 *
 * Sem credencial salva, ou se a chamada falhar (credencial invalida, etc.),
 * devolve null — quem chama cai de volta pro link da casa (offerLink).
 */
export async function linkAfiliadoPessoal(
  produtoLinkOrigem: string,
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: credencial } = await supabase
    .from("credenciais_afiliado")
    .select("shopee_app_id, shopee_app_secret")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!credencial?.shopee_app_id || !credencial?.shopee_app_secret) {
    return null;
  }

  try {
    const resultado = await queryShopee<{
      generateShortLink: { shortLink: string };
    }>(
      `mutation Gerar($input: ShortLinkInput!) {
        generateShortLink(input: $input) { shortLink }
      }`,
      { input: { originUrl: produtoLinkOrigem } },
      { appId: credencial.shopee_app_id, appSecret: credencial.shopee_app_secret },
    );
    return resultado.generateShortLink.shortLink;
  } catch (erro) {
    console.warn("[link-afiliado] falhou, caindo pro link da casa:", erro);
    return null;
  }
}
