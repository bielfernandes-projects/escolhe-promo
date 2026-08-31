import "server-only";

import { fetchProdutos } from "@/lib/shopee/products";
import { NICHO_TO_SHOPEE_CATS, type Nicho } from "@/lib/shopee/niches";
import { salvarProdutos } from "./repositorio";
import type { Produto } from "./tipos";

/** Quantos produtos cada Nicho deveria ter na Vitrine. */
const ALVO_POR_NICHO = 50;

/**
 * Puxa o catalogo da Shopee e regrava a tabela `produtos`.
 *
 * Uma chamada, dois donos: o cron diario e a acao "Gerar novos produtos" da
 * Vitrine passam por aqui.
 *
 * Estrategia: um feed global (pega os Nichos de alto volume e "Outros") e, pros
 * Nichos que ficaram abaixo do alvo, busca extra por categoria da Shopee ate
 * chegar em ALVO_POR_NICHO. De-duplica por item_id.
 *
 * ponytail: sequencial e sem limpeza de produtos velhos (upsert so acumula).
 * Paralelizar por categoria ou expirar linhas antigas se o catalogo inchar.
 */
export async function sincronizarCatalogo(): Promise<{ gravados: number }> {
  const porId = new Map<string, Produto>();

  for (const p of await fetchProdutos({ limit: 400 })) {
    porId.set(p.itemId, p);
  }

  const contar = (nicho: Nicho) =>
    [...porId.values()].filter((p) => p.nicho === nicho).length;

  for (const [nicho, categorias] of Object.entries(NICHO_TO_SHOPEE_CATS) as [
    Nicho,
    number[],
  ][]) {
    for (const categoryId of categorias) {
      if (contar(nicho) >= ALVO_POR_NICHO) break;
      for (const p of await fetchProdutos({ categoryId, limit: 60 })) {
        porId.set(p.itemId, p);
      }
    }
  }

  const gravados = await salvarProdutos([...porId.values()]);
  return { gravados };
}
