"use server";

import { createClient } from "@/lib/supabase/server";
import { criptografar } from "@/lib/seguranca/criptografia";

/**
 * Salva a credencial Shopee do usuario. Precisa ser server action, nao
 * escrita direta do client: a chave de criptografia nunca pode chegar ao
 * browser, entao o App Secret so pode ser cifrado aqui.
 */
export async function salvarCredencialShopee(
  appId: string,
  appSecret: string,
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, erro: "Sessão expirada. Entre de novo." };
  }

  const { error } = await supabase.from("credenciais_afiliado").upsert({
    user_id: user.id,
    shopee_app_id: appId,
    shopee_app_secret: criptografar(appSecret),
  });

  if (error) {
    return { ok: false, erro: error.message };
  }
  return { ok: true };
}
