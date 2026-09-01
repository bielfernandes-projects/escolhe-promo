import type { MetadataRoute } from "next";

/**
 * Convencao nativa do Next, apontando pros icones estaticos em src/app/
 * (icon.png / apple-icon.png), que sao a arte do Canva.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Escolhe Promo",
    short_name: "Escolhe Promo",
    description:
      "Copiou, postou, vendeu. Gerador de copy e imagens para afiliados Shopee.",
    start_url: "/app/vitrine",
    display: "standalone",
    background_color: "#f7f7f8",
    theme_color: "#ee4d2d",
    lang: "pt-BR",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
