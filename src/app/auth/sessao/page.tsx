import { ConfirmarNoCliente } from "./confirmar-no-cliente";

export const metadata = { title: "Entrando — Eita Promo" };

/**
 * Recebe o caso em que o token veio no fragmento da URL, que so o navegador
 * enxerga. Quem manda pra ca e o /auth/confirm.
 */
export default async function SessaoPage({
  searchParams,
}: PageProps<"/auth/sessao">) {
  const params = await searchParams;
  const bruto = typeof params.next === "string" ? params.next : "/app/vitrine";
  const proximo =
    bruto.startsWith("/") && !bruto.startsWith("//") ? bruto : "/app/vitrine";

  return <ConfirmarNoCliente proximo={proximo} />;
}
