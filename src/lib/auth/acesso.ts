import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Regra de acesso ao /app:
 *   - nunca comprou  → libera (conta de teste/admin; não há self-signup)
 *   - tem ao menos uma compra sem reembolso → libera
 *   - todas as compras reembolsadas/contestadas → barra
 *
 * Chamado no layout de /app com o client do próprio usuário — a RLS de
 * `compras` já limita a select às linhas dele. Um reembolso marca
 * `reembolsada_em` via webhook da Cakto e a próxima navegação cai fora.
 *
 * ponytail: fail-open. Se a query der erro (banco fora do ar), deixa entrar —
 * trancar quem pagou por um soluço de rede é pior do que um reembolsado
 * passar durante uma indisponibilidade.
 */
export async function temAcessoAtivo(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("compras")
    .select("reembolsada_em")
    .eq("user_id", userId);

  if (error) {
    console.error("[acesso] falha ao checar compras:", error.message);
    return true;
  }

  if (!data || data.length === 0) return true;

  return data.some((compra) => compra.reembolsada_em === null);
}
