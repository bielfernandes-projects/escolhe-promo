const CHECKOUT = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "#";

/**
 * Faixa no topo do /app nos últimos dias do teste grátis. Só aparece quando
 * faltam 3 dias ou menos (num teste de 7 dias, "a partir do dia 5").
 */
export function AvisoTeste({ expiraEm }: { expiraEm: string | null }) {
  if (!expiraEm) return null;

  const restam = Math.ceil(
    (new Date(expiraEm).getTime() - Date.now()) / 86_400_000,
  );
  if (restam > 3) return null;

  const texto =
    restam <= 0
      ? "Seu teste grátis termina hoje."
      : restam === 1
        ? "Falta 1 dia no seu teste grátis."
        : `Faltam ${restam} dias no seu teste grátis.`;

  return (
    <div className="border-b border-marca-200 bg-marca-50 px-4 py-2.5 text-center text-sm">
      <span className="text-tinta">{texto} </span>
      <a
        href={CHECKOUT}
        className="font-semibold text-marca-700 underline underline-offset-2"
      >
        Garantir acesso vitalício por R$ 47
      </a>
    </div>
  );
}
