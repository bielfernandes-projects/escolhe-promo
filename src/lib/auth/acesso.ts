import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Regra de acesso ao /app. Tem acesso quem tem ao menos uma linha em `compras`
 * sem reembolso que seja OU uma compra de verdade (`cakto_order_id` preenchido)
 * OU um teste grátis que ainda não expirou (`trial_expira_em` no futuro).
 *
 * Esta é a checagem de UX (redireciona pra uma página explicando). A que vale
 * de verdade é a RLS do Postgres (`tem_compra_ativa()`), que barra a leitura do
 * catálogo mesmo se alguém chamar a API do Supabase direto.
 *
 * ponytail: fail-open em erro de rede. Se a query falhar, trata como compra
 * paga (sem faixa de teste) — a RLS ainda barra os dados, e trancar quem pagou
 * por causa de um soluço de rede seria pior.
 */

export type Acesso =
  | { ativo: true; trial: boolean; trialExpiraEm: string | null }
  | { ativo: false; motivo: "reembolso" | "teste_expirado" };

type LinhaCompra = {
  reembolsada_em: string | null;
  cakto_order_id: string | null;
  trial_expira_em: string | null;
};

export async function checarAcesso(
  supabase: SupabaseClient,
  userId: string,
): Promise<Acesso> {
  const { data, error } = await supabase
    .from("compras")
    .select("reembolsada_em, cakto_order_id, trial_expira_em")
    .eq("user_id", userId);

  if (error) {
    // "JWT issued at future" e afins são relógio dessincronizado — transitório.
    if (!/jwt|token/i.test(error.message)) {
      console.error("[acesso] falha ao checar compras:", error.message);
    }
    return { ativo: true, trial: false, trialExpiraEm: null };
  }

  const linhas = (data ?? []) as LinhaCompra[];
  const agora = Date.now();

  const pagaAtiva = linhas.some(
    (l) => l.cakto_order_id !== null && l.reembolsada_em === null,
  );
  if (pagaAtiva) return { ativo: true, trial: false, trialExpiraEm: null };

  const testeAtivo = linhas.find(
    (l) =>
      l.cakto_order_id === null &&
      l.reembolsada_em === null &&
      l.trial_expira_em !== null &&
      new Date(l.trial_expira_em).getTime() > agora,
  );
  if (testeAtivo) {
    return {
      ativo: true,
      trial: true,
      trialExpiraEm: testeAtivo.trial_expira_em,
    };
  }

  // Sem linha ativa. Se a pessoa já teve compra paga e todas foram
  // reembolsadas, a mensagem é de reembolso; senão, foi o teste que acabou.
  const pagas = linhas.filter((l) => l.cakto_order_id !== null);
  const motivo =
    pagas.length > 0 && pagas.every((l) => l.reembolsada_em !== null)
      ? "reembolso"
      : "teste_expirado";
  return { ativo: false, motivo };
}
