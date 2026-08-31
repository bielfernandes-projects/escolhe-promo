"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ehAdmin } from "@/lib/admin";
import { sincronizarCatalogo } from "@/lib/produtos/sincronizar";

export type ResultadoRegerar =
  | { ok: true; gravados: number }
  | { ok: false; erro: string };

/**
 * Puxa produtos novos da Shopee sob demanda. Passa pela mesma rotina do cron
 * (sincronizarCatalogo) — nunca reexpoe a rota do cron nem o CRON_SECRET.
 */
export async function regerarCatalogo(): Promise<ResultadoRegerar> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!ehAdmin(user?.email)) {
    return { ok: false, erro: "Sem permissão pra isso." };
  }

  try {
    const { gravados } = await sincronizarCatalogo();
    revalidatePath("/app/vitrine");
    return { ok: true, gravados };
  } catch (erro) {
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Falha ao buscar produtos.",
    };
  }
}
