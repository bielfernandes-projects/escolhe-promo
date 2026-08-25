import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { excedeuLimite } from "@/lib/seguranca/limite-tentativas";

/**
 * Onde o magic link vira sessao de verdade.
 *
 * Precisa ser Route Handler, nao pagina: Server Component nao consegue gravar
 * cookie — o setAll do supabase/server.ts falha calado e a sessao se perde.
 *
 * Atende os dois formatos que o Supabase pode mandar:
 *  - ?token_hash=...   verificado aqui mesmo, no servidor.
 *  - #access_token=... fragmento nunca chega ao servidor, entao repassa pro
 *    /auth/sessao, que resolve no cliente. O fragmento sobrevive ao redirect
 *    porque o destino nao tem um proprio.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const bruto = searchParams.get("next") ?? "/app/vitrine";
  // So caminho relativo: um `next` absoluto viraria open redirect.
  const proximo =
    bruto.startsWith("/") && !bruto.startsWith("//") ? bruto : "/app/vitrine";

  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;

  // token_hash e um segredo longo e aleatorio, entao forca bruta de verdade
  // nao e viavel — mas limitar por IP ainda barata enumeracao/DoS baratos.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  if (excedeuLimite(`auth-confirm:${ip}`, 20, 5 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/login?erro=link_expirado", origin));
  }

  if (!tokenHash || !tipo) {
    return NextResponse.redirect(
      new URL(`/auth/sessao?next=${encodeURIComponent(proximo)}`, origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: tipo,
    token_hash: tokenHash,
  });

  if (error) {
    console.error("[auth/confirm] verifyOtp falhou:", error.message);
    return NextResponse.redirect(new URL("/login?erro=link_expirado", origin));
  }

  return NextResponse.redirect(new URL(proximo, origin));
}
