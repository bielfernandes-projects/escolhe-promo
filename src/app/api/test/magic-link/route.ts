import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Gera um magic link de teste.
 * NÃO existe em produção — só pra facilitar testes locais.
 */
export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json(
      { erro: "Email obrigatório" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();

    // Gera o magic link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${request.nextUrl.origin}/app/vitrine`,
      },
    });

    if (error) {
      console.error("[test/magic-link] Erro:", error);
      return NextResponse.json(
        { erro: error.message },
        { status: 500 },
      );
    }

    console.log(`[test/magic-link] Magic link gerado para ${email}`);
    return NextResponse.json({
      url: (data.properties as Record<string, string>)?.action_link || "",
    });
  } catch (err) {
    console.error("[test/magic-link] Erro inesperado:", err);
    return NextResponse.json(
      { erro: "Erro inesperado" },
      { status: 500 },
    );
  }
}
