import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Regra de acesso ao /app: tem acesso quem tem ao menos uma compra sem
 * reembolso. Sem compra nenhuma, não entra.
 *
 * Antes isto liberava quem nunca comprou, pra facilitar contas de teste. Não dá
 * pra manter: a anon key do Supabase é pública (vai no bundle do browser) e,
 * com o auto-cadastro ligado, qualquer pessoa criaria a própria conta e entraria
 * de graça no produto pago. Pra liberar uma conta de teste, insira a linha em
 * `compras` — a migration 0007 traz o SQL pronto.
 *
 * Esta é a checagem de UX (redireciona pra uma página explicando). A checagem
 * que vale de verdade é a RLS do Postgres, que barra a leitura do catálogo
 * mesmo se alguém chamar a API do Supabase direto, sem passar por aqui.
 *
 * ponytail: fail-open em erro de rede. Se a query falhar, deixa passar — a RLS
 * ainda barra os dados, então o pior caso é uma Vitrine vazia, e trancar quem
 * pagou por causa de um soluço de rede seria pior.
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
    // "JWT issued at future" e afins são relógio dessincronizado da máquina —
    // transitório e sem ação. Só registra o que for de fato inesperado.
    if (!/jwt|token/i.test(error.message)) {
      console.error("[acesso] falha ao checar compras:", error.message);
    }
    return true;
  }

  return (data ?? []).some((compra) => compra.reembolsada_em === null);
}
