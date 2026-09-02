import Link from "next/link";
import { Marca } from "@/app/_brand/marca";

export const metadata = {
  title: "Compra confirmada — Escolhe Promo",
  robots: { index: false, follow: false },
};

export default function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = searchParams as { order_id?: string };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <div className="rounded-3xl bg-superficie p-6 text-center shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="fonte-display mt-4 text-2xl text-tinta">Compra confirmada!</h1>

        <p className="mt-2 text-sm text-tinta-fraca">
          Você acaba de ganhar acesso vitalício ao Escolhe Promo.
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-tinta">
            Abra seu e-mail agora. Você receberá um link pra entrar no app.
          </p>
          <p className="text-xs text-tinta-fraca">
            Se não aparecer em poucos minutos, verifique a pasta de spam.
          </p>
        </div>

        {order_id && (
          <p className="mt-4 text-xs text-tinta-fraca/60">
            Pedido #{order_id}
          </p>
        )}

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-marca-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99]"
        >
          Voltar pra home
        </Link>
      </div>
    </main>
  );
}
