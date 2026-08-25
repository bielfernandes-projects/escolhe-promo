"use server";

import { createClient } from "@/lib/supabase/server";
import { excedeuLimite } from "@/lib/seguranca/limite-tentativas";

/**
 * Login com senha via server action.
 *
 * Precisa ser server action, nao chamada direta do browser pro Supabase:
 * um rate limit no proxy.ts nunca veria essa requisicao (ela iria direto
 * do client pra API do Supabase, sem passar pelo nosso servidor) — so faz
 * sentido limitar tentativas aqui, onde a chamada realmente passa por
 * codigo nosso.
 */
export async function entrarComSenha(
  email: string,
  senha: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (excedeuLimite(`login:${email.toLowerCase()}`)) {
    return {
      ok: false,
      erro: "Muitas tentativas. Espere alguns minutos ou use o link por e-mail.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return {
      ok: false,
      erro: error.message.includes("Invalid login credentials")
        ? "E-mail ou senha incorretos."
        : error.message,
    };
  }
  return { ok: true };
}
