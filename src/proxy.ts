import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Faz duas coisas em todo request:
 *
 * 1. Mantem a sessao do Supabase viva. O access token expira em 1h e um Server
 *    Component nao consegue regravar cookie por conta propria — sem isso o
 *    usuario e deslogado no meio do uso.
 * 2. Barra /app/** antes de renderizar qualquer coisa. O layout tambem checa a
 *    sessao (essa e a checagem que vale), mas fazer o corte aqui devolve um 307
 *    de verdade: como existe um loading.tsx na raiz, a resposta e transmitida em
 *    stream e o redirect do layout so chegaria como meta refresh, depois de um
 *    200 com o esqueleto da pagina.
 *
 * No Next.js 16 esta convencao se chama `proxy`, nao `middleware`.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // So de chamar getUser() o cliente renova o token e dispara o setAll acima.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/app")) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  if (user && pathname === "/login") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/app/vitrine";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  // Sem o negative match o proxy rodaria em cima de CSS/JS/imagens e travaria
  // o carregamento dos assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
