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
  // Entrada de fora: sem teto, um corpo gigante vira custo de CPU de graca.
  if (typeof email !== "string" || typeof senha !== "string") {
    return { ok: false, erro: "Preencha e-mail e senha." };
  }
  if (email.length > 320 || senha.length > 200) {
    return { ok: false, erro: "E-mail ou senha incorretos." };
  }

  if (excedeuLimite(`login:${email.toLowerCase()}`)) {
    return {
      ok: false,
      erro: "Muitas tentativas. Espere alguns minutos ou use o link por e-mail.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    // Mensagem generica de proposito: distinguir "senha errada" de "conta nao
    // existe" entrega uma lista de e-mails cadastrados a quem testar em massa.
    // O detalhe fica no log do servidor.
    console.warn("[login] falhou:", error.message);
    return { ok: false, erro: "E-mail ou senha incorretos." };
  }
  return { ok: true };
}
