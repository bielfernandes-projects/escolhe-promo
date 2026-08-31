import Link from "next/link";
import { AppShowcase } from "./_landing/app-showcase";

/** Ajuste aqui se mudar a oferta. */
const PRECO = "47";
const CHECKOUT = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "#";

const PASSOS = [
  {
    titulo: "Escolha um produto",
    texto: "A Vitrine abre toda manhã com produtos da Shopee de boa comissão, já separados por nicho.",
  },
  {
    titulo: "Pegue o texto",
    texto: "Um toque e sai uma copy pronta pra WhatsApp ou Instagram. Toda vez sai diferente.",
  },
  {
    titulo: "Baixe a imagem",
    texto: "Escolha o modelo de Feed ou Story, baixe e poste. Sem Canva, sem editar nada.",
  },
];

const PRA_QUEM = [
  "Você entrou (ou quer entrar) no programa de afiliados da Shopee.",
  "Quer uma renda extra postando achadinho no grupo, no status e nos Stories.",
  "Trava na hora de escrever o texto e montar a imagem — e acaba não postando.",
];

const DIFICIL = [
  "Garimpar um produto bom no meio de um milhão.",
  "Pensar num texto que não pareça propaganda.",
  "Abrir o Canva, achar um modelo, trocar foto e preço na mão.",
  "Acordar amanhã e fazer tudo de novo.",
];

const FACIL = [
  "A Vitrine já traz os produtos com boa comissão.",
  "A copy sai pronta e nunca repete o texto anterior.",
  "A imagem sai pronta pra Feed ou Story, com a foto e o preço.",
  "Amanhã tem produto novo te esperando.",
];

const INCLUI = [
  "Vitrine com mais de 600 produtos, atualizada todo dia",
  "Filtro por nicho: Casa, Beleza, Moda, Pet, Cozinha e mais",
  "Gerador de copy que não repete o mesmo texto",
  "3 modelos de imagem prontos pra Feed e Story",
  "Opção de usar sua própria foto na imagem",
  "Funciona no celular e instala na tela inicial",
];

const FAQ = [
  {
    q: "Preciso ter CNPJ ou empresa?",
    a: "Não. Você se cadastra de graça no programa de afiliados da Shopee, pega seus links e divulga. O Eita Promo só te dá o texto e a imagem.",
  },
  {
    q: "Funciona no iPhone?",
    a: "Sim. Abre no navegador do celular e dá pra instalar na tela inicial, como se fosse um aplicativo.",
  },
  {
    q: "Preciso pagar alguma coisa pra Shopee?",
    a: "Não. Entrar no programa de afiliados da Shopee é gratuito, e é a própria Shopee que te paga as comissões — o Eita Promo não entra nesse meio.",
  },
  {
    q: "Já tentei divulgar antes e não vendi. Vai ser diferente?",
    a: "O Eita Promo tira de você o trabalho de escrever e montar imagem, que é onde a maioria desiste. Postar todo dia e responder quem chama no direct continua sendo com você.",
  },
  {
    q: "É assinatura mensal?",
    a: "Não. Você paga uma vez os R$ 47 e usa pra sempre, sem mensalidade e sem cobrança nova.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias pra pedir o dinheiro de volta, sem precisar explicar o motivo.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip pb-20 sm:pb-0">
      <header className="mx-auto w-full max-w-6xl px-5 py-5">
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
        <section className="relative mx-auto w-full max-w-6xl px-5 pt-4 pb-24 sm:pt-10 lg:pb-52">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-marca-200/40 blur-[90px]"
          />
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <h1 className="text-[clamp(2.75rem,7vw,4.25rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                Copiou, postou,{" "}
                <span className="text-marca-600">vendeu.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-lg text-tinta-fraca text-pretty lg:mx-0">
                Você não precisa saber escrever nem mexer no Canva. Escolha o
                produto da Shopee: o Eita Promo monta o texto e a imagem, você
                só posta.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                <a
                  href={CHECKOUT}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-marca-600 px-8 py-4 text-lg font-bold text-white shadow-sm transition-all duration-200 hover:bg-marca-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
                >
                  Quero acesso vitalício
                </a>
                <p className="text-sm text-tinta-fraca">
                  R$ {PRECO} uma vez só · sem mensalidade · 7 dias de garantia
                </p>
              </div>
            </div>

            <AppShowcase />
          </div>
        </section>

        {/* Como funciona — sequência real, sem cartões repetidos */}
        <section className="bg-superficie py-20 sm:py-24">
          <div className="mx-auto w-full max-w-4xl px-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Três toques, do produto ao post
            </h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
              {PASSOS.map((passo, i) => (
                <li key={passo.titulo} className="relative">
                  <span className="text-sm font-bold text-marca-600">
                    Passo {i + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">{passo.titulo}</h3>
                  <p className="mt-1.5 text-sm text-tinta-fraca">{passo.texto}</p>
                  {i < PASSOS.length - 1 && (
                    <span
                      aria-hidden
                      className="mt-4 block h-px w-10 bg-marca-200 sm:absolute sm:top-2 sm:-right-3 sm:mt-0 sm:h-8 sm:w-px"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pra quem é */}
        <section className="lp-reveal py-20 sm:py-24">
          <div className="mx-auto w-full max-w-3xl px-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              É pra você se…
            </h2>
            <ul className="mt-8 space-y-4">
              {PRA_QUEM.map((item) => (
                <li key={item} className="flex gap-3 text-lg text-pretty">
                  <IconeCheck className="mt-1.5 h-4 w-4 shrink-0 text-marca-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* O jeito difícil × com o Eita Promo */}
        <section className="bg-superficie py-20 sm:py-24">
          <div className="mx-auto w-full max-w-4xl px-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A diferença
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-10">
              <div>
                <h3 className="text-sm font-bold tracking-wide text-tinta-fraca uppercase">
                  Divulgando na unha
                </h3>
                <ul className="mt-4 space-y-3">
                  {DIFICIL.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-tinta-fraca"
                    >
                      <IconeMenos className="mt-1 h-3.5 w-3.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-marca-50 p-6">
                <h3 className="text-sm font-bold tracking-wide text-marca-700 uppercase">
                  Com o Eita Promo
                </h3>
                <ul className="mt-4 space-y-3">
                  {FACIL.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <IconeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-marca-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* O que entra */}
        <section className="lp-reveal py-20 sm:py-24">
          <div className="mx-auto w-full max-w-3xl px-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              O que entra no acesso
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {INCLUI.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-superficie p-4 ring-1 ring-black/5"
                >
                  <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-marca-600" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ + objeções */}
        <section className="bg-superficie py-20 sm:py-24">
          <div className="mx-auto w-full max-w-2xl px-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Perguntas que todo mundo faz
            </h2>
            <div className="mt-8 divide-y divide-black/[0.07] border-y border-black/[0.07]">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <IconeMais className="h-4 w-4 shrink-0 text-marca-600 transition-transform duration-200 group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 text-sm text-tinta-fraca text-pretty">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Garantia */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-2xl px-5">
            <div className="rounded-2xl bg-marca-50 p-8 text-center sm:p-10">
              <p className="text-sm font-bold tracking-wide text-marca-700 uppercase">
                Garantia de 7 dias
              </p>
              <p className="mt-3 text-lg text-pretty">
                Compre, use o Eita Promo por uma semana inteira. Se não fizer
                sentido pra você, é só pedir o reembolso — devolvemos os R${" "}
                {PRECO} sem perguntar nada.
              </p>
            </div>
          </div>
        </section>

        {/* Nota de quem fez */}
        <section className="lp-reveal py-20 sm:py-24">
          <div className="mx-auto w-full max-w-2xl px-5">
            <blockquote className="border-l-2 border-marca-300 pl-5 text-lg text-pretty italic">
              Vi muita gente querendo uma renda extra com a Shopee e travando
              sempre no mesmo lugar: a hora de escrever o texto e montar a
              imagem. O Eita Promo nasceu pra tirar essa parte do caminho — o
              resto, que é escolher o produto e falar com o seu público,
              continua sendo com você.
            </blockquote>
            <p className="mt-4 pl-5 text-sm font-semibold text-tinta-fraca not-italic">
              — quem faz o Eita Promo
            </p>
          </div>
        </section>

        {/* Fechamento */}
        <section className="bg-superficie py-24 sm:py-28">
          <div className="mx-auto w-full max-w-xl px-5 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Uma vez só. Pra sempre.
            </h2>
            <p className="mt-3 text-tinta-fraca text-pretty">
              Sem assinatura, sem cobrança recorrente. Você paga R$ {PRECO}{" "}
              hoje, tem 7 dias de garantia e usa o Eita Promo o quanto quiser.
            </p>
            <a
              href={CHECKOUT}
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-marca-600 px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-marca-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
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
            className="font-semibold text-marca-700 underline underline-offset-4"
          >
            Entrar
          </Link>
        </p>
        <p className="mt-2">
          <Link
            href="/termos"
            className="underline underline-offset-4 hover:text-tinta"
          >
            Termos de Uso
          </Link>{" "}
          ·{" "}
          <Link
            href="/privacidade"
            className="underline underline-offset-4 hover:text-tinta"
          >
            Política de Privacidade
          </Link>
        </p>
      </footer>

      {/* Barra fixa de compra no mobile — tráfego pago vem do celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-superficie/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="text-sm font-bold">R$ {PRECO}</p>
            <p className="text-[11px] text-tinta-fraca">uma vez · 7 dias de garantia</p>
          </div>
          <a
            href={CHECKOUT}
            className="rounded-xl bg-marca-600 px-5 py-3 text-sm font-bold text-white active:scale-[0.98]"
          >
            Quero acesso
          </a>
        </div>
      </div>
    </div>
  );
}

type IconeProps = { className?: string };

function IconeCheck({ className }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconeMenos({ className }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function IconeMais({ className }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
