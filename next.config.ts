import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * `unsafe-inline` em script-src é o preço do Next.js sem nonce: o runtime
 * injeta scripts inline de hidratação. Mesmo assim a CSP vale muito, porque
 * `default-src 'self'` + a lista de conexões abaixo barram exfiltração pra
 * domínio de terceiro, e `frame-ancestors 'none'` mata clickjacking.
 *
 * Conexões liberadas: Supabase (auth/dados), Meta (pixel), Vercel (analytics).
 * Imagens: CDN da Shopee (`susercontent`), Storage do Supabase e data: (as
 * fotos que a afiliada sobe viram data URI antes de virar imagem).
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.susercontent.com https://*.shopee.com.br https://*.supabase.co https://www.facebook.com https://picsum.photos",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.facebook.com https://graph.facebook.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Redundante com frame-ancestors, mas cobre navegador antigo.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Não vaza o caminho interno do app pra Shopee/Meta no Referer.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Área paga e rotas de auth nunca podem ficar em cache compartilhado.
        source: "/app/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
