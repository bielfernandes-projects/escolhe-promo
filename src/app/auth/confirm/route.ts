import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o token do magic link por uma sessão de verdade.
 *
 * É o passo que faltava: mandar o magic link direto pra uma página protegida
 * não loga ninguém, porque nada grava o cookie de sessão. O link tem que passar
 * por aqui primeiro.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const proximo = searchParams.get("next") ?? "/app/vitrine";

  // Só caminho relativo: um `next` absoluto viraria open redirect.
  const destino = proximo.startsWith("/") && !proximo.startsWith("//")
    ? proximo
    : "/app/vitrine";

  if (!tokenHash || !type) {
    redirect("/login?erro=link_invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error("[auth/confirm] verifyOtp falhou:", error.message);
    redirect("/login?erro=link_expirado");
  }

  redirect(destino);
}
