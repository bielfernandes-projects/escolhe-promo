import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo/site";

/** Uma hora: as vitrines novas entram sozinhas sem precisar de deploy. */
export const revalidate = 3600;

/**
 * Sitemap: a landing, as páginas legais e uma entrada por vitrine pública.
 *
 * As vitrines de afiliada são o volume orgânico do produto — cada afiliada
 * ganha uma página com produtos reais. Entram só as que têm ao menos um item
 * publicado; listar vitrine vazia é convidar o Google a rastrear página sem
 * conteúdo e derruba a qualidade média do site.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/termos`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const admin = createAdminClient();

    const [{ data: perfis }, { data: publicadas }] = await Promise.all([
      admin.from("perfis").select("user_id, handle, atualizado_em").limit(5000),
      admin.from("divulgacoes").select("user_id").eq("na_vitrine", true).limit(50000),
    ]);

    const comItem = new Set((publicadas ?? []).map((d) => d.user_id as string));

    const vitrines: MetadataRoute.Sitemap = (perfis ?? [])
      .filter((p) => comItem.has(p.user_id as string))
      .map((p) => ({
        url: `${SITE_URL}/@${p.handle as string}`,
        lastModified: p.atualizado_em ? new Date(p.atualizado_em as string) : agora,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));

    return [...estaticas, ...vitrines];
  } catch (erro) {
    // Sitemap incompleto é muito melhor que sitemap com erro 500: o Google
    // marca a submissão como falha e para de reler por um tempo.
    console.error("[sitemap] falhou ao listar vitrines:", erro);
    return estaticas;
  }
}
