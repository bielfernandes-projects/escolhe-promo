import type { MetadataRoute } from "next";

/**
 * Convencao nativa do Next (substitui o public/manifest.json escrito a mao),
 * apontando pros icones gerados em src/app/icon.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eita Promo",
    short_name: "Eita Promo",
    description:
      "Copiou, postou, vendeu. Gerador de copy e imagens para afiliados Shopee.",
    start_url: "/app/vitrine",
    display: "standalone",
    background_color: "#f7f7f8",
    theme_color: "#ee4d2d",
    lang: "pt-BR",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
