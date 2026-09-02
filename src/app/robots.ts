import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Nada disto existia: `/robots.txt` caía na rota `[handle]` e devolvia a página
 * de "vitrine não encontrada" com status 200 — o Googlebot recebia HTML no
 * lugar das instruções. As convenções de arquivo do Next (`robots.ts`,
 * `sitemap.ts`) têm precedência sobre a rota dinâmica e resolvem isso.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Área paga, fluxo de autenticação e endpoints não têm o que indexar —
        // e mantê-los fora do crawl evita gastar orçamento de rastreio com
        // páginas que só respondem redirect.
        disallow: [
          "/app/",
          "/auth/",
          "/api/",
          "/cakto/",
          "/login",
          "/acesso-encerrado",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
