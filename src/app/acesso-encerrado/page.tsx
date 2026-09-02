import { Marca } from "@/app/_brand/marca";
import { SairNoCarregar } from "./sair-no-carregar";

const CHECKOUT = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "#";

export const metadata = {
  title: "Acesso encerrado — Escolhe Promo",
  robots: { index: false, follow: false },
};

/**
 * Onde cai quem perdeu o acesso: compra reembolsada, ou teste grátis de 7 dias
 * que expirou (`?de=teste`). É uma página à parte, fora de /app e de /login: o
 * proxy joga todo mundo logado que abre /login de volta pro /app, o que criaria
 * um loop de redirect com a checagem de acesso do layout.
 */
export default async function AcessoEncerradoPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string }>;
}) {
  const { de } = await searchParams;
  const fimDoTeste = de === "teste";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <div className="flex justify-center">
        <Marca simbolo={32} />
      </div>

      <div className="mt-8 rounded-3xl bg-superficie p-6 text-center shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]">
        {fimDoTeste ? (
          <>
            <h1 className="fonte-display text-2xl text-tinta">
              Seu teste grátis acabou
            </h1>
            <p className="mt-2 text-sm text-tinta-fraca">
              Foram 7 dias com tudo liberado. Pra continuar usando o Escolhe
              Promo, garanta o acesso vitalício: R$ 47 uma vez só, sem
              mensalidade.
            </p>
            <a
              href={CHECKOUT}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-marca-700 px-6 py-3.5 font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99]"
            >
              Garantir acesso vitalício
            </a>
            <p className="mt-3 text-xs text-tinta-fraca">
              Use o <strong>mesmo e-mail</strong> que você cadastrou no teste.
              Depois de pagar, você recebe um link pra entrar.
            </p>
          </>
        ) : (
          <>
            <h1 className="fonte-display text-2xl text-tinta">Acesso encerrado</h1>
            <p className="mt-2 text-sm text-tinta-fraca">
              Sua compra foi reembolsada, então o acesso ao Escolhe Promo foi
              encerrado.
            </p>
            <p className="mt-4 text-sm text-tinta-fraca">
              Se acha que é engano, fale com o suporte pelo e-mail{" "}
              <a
                href="mailto:contato@escolhepromo.com.br"
                className="font-semibold text-marca-700 underline underline-offset-2"
              >
                contato@escolhepromo.com.br
              </a>
              .
            </p>
          </>
        )}
      </div>

      <SairNoCarregar />
    </main>
  );
}
