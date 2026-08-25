import Link from "next/link";

/** Ajuste aqui se mudar a oferta. */
const PRECO = "47";
const CHECKOUT = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "#";

const PASSOS = [
  {
    emoji: "👀",
    titulo: "Escolha um produto",
    texto:
      "Toda manhã a Vitrine traz produtos da Shopee com boa comissão, separados por nicho.",
  },
  {
    emoji: "✨",
    titulo: "Gere a copy",
    texto:
      "Um toque e sai um texto pronto pra WhatsApp ou Instagram. Cada vez sai diferente.",
  },
  {
    emoji: "📸",
    titulo: "Baixe a imagem",
    texto:
      "Escolha o modelo de Feed ou Story, baixe e poste. Sem Canva, sem editar nada.",
  },
];

const INCLUI = [
  "Vitrine atualizada todo dia com produtos da Shopee",
  "Filtro por nicho: Casa, Beleza, Moda, Pet, Cozinha e mais",
  "Gerador de copy que não repete o mesmo texto",
  "3 modelos de imagem prontos pra Feed e Story",
  "Funciona no celular, dá pra instalar na tela inicial",
  "Acesso vitalício: paga uma vez e usa pra sempre",
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-5 py-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">
            Eita<span className="text-marca-600">Promo</span>
          </span>
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-tinta-fraca transition-colors hover:bg-tela"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Herói */}
        <section className="mx-auto w-full max-w-2xl px-5 pt-8 pb-14 text-center sm:pt-16">
          <span className="inline-block rounded-full bg-marca-50 px-3 py-1 text-xs font-semibold text-marca-700">
            Para afiliados da Shopee
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
            Copiou, postou, <span className="text-marca-600">vendeu.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-tinta-fraca sm:text-lg">
            Você não precisa saber escrever nem mexer no Canva. Escolha o
            produto: o Eita Promo monta o texto e a imagem, você só posta.
          </p>

          <a
            href={CHECKOUT}
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-marca-600 px-8 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-marca-700 active:bg-marca-800 sm:w-auto"
          >
            Quero acesso vitalício
          </a>
          <p className="mt-3 text-sm text-tinta-fraca">
            Pagamento único de R$ {PRECO} · sem mensalidade
          </p>
        </section>

        {/* Como funciona */}
        <section className="bg-superficie py-14">
          <div className="mx-auto w-full max-w-4xl px-5">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              Como funciona
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {PASSOS.map((passo, i) => (
                <div key={passo.titulo} className="rounded-2xl bg-tela p-5">
                  <div className="text-3xl">{passo.emoji}</div>
                  <h3 className="mt-3 font-bold">
                    {i + 1}. {passo.titulo}
                  </h3>
                  <p className="mt-1.5 text-sm text-tinta-fraca">{passo.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O que vem junto */}
        <section className="py-14">
          <div className="mx-auto w-full max-w-2xl px-5">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              O que você leva
            </h2>
            <ul className="mt-8 space-y-3">
              {INCLUI.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-superficie p-4 ring-1 ring-black/5"
                >
                  <span aria-hidden className="font-bold text-marca-600">
                    ✓
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Fechamento */}
        <section className="bg-superficie py-14">
          <div className="mx-auto w-full max-w-xl px-5 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Uma vez só. Pra sempre.
            </h2>
            <p className="mt-3 text-tinta-fraca">
              Sem assinatura e sem cobrança recorrente. Você paga R$ {PRECO} hoje
              e usa o Eita Promo o quanto quiser.
            </p>
            <a
              href={CHECKOUT}
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-marca-600 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-marca-700 sm:w-auto"
            >
              Garantir meu acesso
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 py-8 text-center text-xs text-tinta-fraca">
        <p>
          Eita Promo · Já comprou?{" "}
          <Link
            href="/login"
            className="font-semibold text-marca-600 underline underline-offset-4"
          >
            Entrar
          </Link>
        </p>
        <p className="mt-2">
          <Link href="/termos" className="underline underline-offset-4 hover:text-tinta">
            Termos de Uso
          </Link>{" "}
          ·{" "}
          <Link href="/privacidade" className="underline underline-offset-4 hover:text-tinta">
            Política de Privacidade
          </Link>
        </p>
      </footer>
    </div>
  );
}
