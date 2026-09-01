import Link from "next/link";
import { AppShowcase } from "./_landing/app-showcase";
import { Marca, MarcaSimbolo } from "./_brand/marca";

/** Ajuste aqui se mudar a oferta. */
const PRECO = "47";
const CHECKOUT = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "#";

const PASSOS = [
  {
    titulo: "Escolha um produto",
    texto:
      "A Vitrine abre toda manhã com produtos da Shopee de boa comissão, já separados por nicho.",
  },
  {
    titulo: "Pegue o texto",
    texto:
      "Um toque e sai uma copy pronta pra WhatsApp ou Instagram. Toda vez sai diferente.",
  },
  {
    titulo: "Baixe a imagem",
    texto:
      "Escolha o modelo de Feed ou Story, baixe e poste. Sem Canva, sem editar nada.",
  },
];

const PRA_QUEM = [
  "Você entrou (ou quer entrar) no programa de afiliados da Shopee.",
  "Quer uma renda extra postando achadinho no grupo, no status e nos Stories.",
  "Trava na hora de escrever o texto e montar a imagem, e acaba não postando.",
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
    a: "Não. Você se cadastra de graça no programa de afiliados da Shopee, pega seus links e divulga. O Escolhe Promo só te dá o texto e a imagem.",
  },
  {
    q: "Funciona no iPhone?",
    a: "Sim. Abre no navegador do celular e dá pra instalar na tela inicial, como se fosse um aplicativo.",
  },
  {
    q: "Preciso pagar alguma coisa pra Shopee?",
    a: "Não. Entrar no programa de afiliados da Shopee é gratuito, e é a própria Shopee que te paga as comissões. O Escolhe Promo não entra nesse meio.",
  },
  {
    q: "Já tentei divulgar antes e não vendi. Vai ser diferente?",
    a: "O Escolhe Promo tira de você o trabalho de escrever e montar imagem, que é onde a maioria desiste. Postar todo dia e responder quem chama no direct continua sendo com você.",
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

const BOTAO_PRIMARIO =
  "inline-flex items-center justify-center rounded-2xl bg-marca-700 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_30px_-10px_rgba(196,58,30,0.6)] transition-all duration-200 hover:bg-marca-600 hover:shadow-[0_16px_40px_-12px_rgba(196,58,30,0.7)] active:scale-[0.98] active:bg-marca-800";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip pb-24 sm:pb-0">
      <header className="mx-auto w-full max-w-6xl px-5 py-5">
        <div className="flex items-center justify-between">
          <Marca simbolo={34} texto="text-lg" />
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-tinta-fraca transition-colors hover:bg-superficie"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Herói */}
        <section className="relative mx-auto w-full max-w-6xl px-5 pt-6 pb-28 sm:pt-12 lg:pb-44">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-marca-200/45 blur-[100px]"
          />
          <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-superficie px-3 py-1 text-xs font-semibold text-tinta-fraca ring-1 ring-black/[0.06]">
                <span className="h-1.5 w-1.5 rounded-full bg-marca-500" />
                Pra afiliado da Shopee
              </p>
              <h1 className="fonte-display mt-5 text-[clamp(2.9rem,7.5vw,5.25rem)] leading-[0.98] text-balance">
                Copiou, postou,{" "}
                <span className="text-marca-600">vendeu.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-lg text-tinta-fraca text-pretty lg:mx-0">
                Você não precisa saber escrever nem mexer no Canva. Escolha o
                produto da Shopee: o Escolhe Promo monta o texto e a imagem, você
                só posta.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                <a href={CHECKOUT} className={`${BOTAO_PRIMARIO} w-full sm:w-auto`}>
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

        {/* Como funciona — sequência ordenada de verdade */}
        <section className="bg-superficie py-20 sm:py-28">
          <div className="mx-auto w-full max-w-5xl px-5">
            <h2 className="fonte-display text-3xl text-balance sm:text-4xl">
              Três toques, do produto ao post
            </h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {PASSOS.map((passo, i) => (
                <li key={passo.titulo} className="relative">
                  <span className="fonte-display block text-5xl text-marca-300">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{passo.titulo}</h3>
                  <p className="mt-2 text-sm text-tinta-fraca text-pretty">
                    {passo.texto}
                  </p>
                  {i < PASSOS.length - 1 && (
                    <span
                      aria-hidden
                      className="mt-5 block h-px w-12 bg-marca-200 sm:absolute sm:top-6 sm:-right-4 sm:mt-0 sm:h-10 sm:w-px"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pra quem é */}
        <section className="lp-reveal py-20 sm:py-28">
          <div className="mx-auto w-full max-w-3xl px-5">
            <div className="rounded-3xl bg-marca-50 p-8 sm:p-12">
              <h2 className="fonte-display text-3xl text-balance sm:text-4xl">
                É pra você se…
              </h2>
              <ul className="mt-8 space-y-5">
                {PRA_QUEM.map((item) => (
                  <li key={item} className="flex gap-3 text-lg text-pretty">
                    <IconeCheck className="mt-1.5 h-4 w-4 shrink-0 text-marca-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* O jeito difícil × com o Escolhe Promo */}
        <section className="bg-superficie py-20 sm:py-28">
          <div className="mx-auto w-full max-w-4xl px-5">
            <h2 className="fonte-display text-3xl text-balance sm:text-4xl">
              A diferença
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8">
              <div className="rounded-3xl bg-tela p-7 sm:p-8">
                <h3 className="text-sm font-bold tracking-wide text-tinta-fraca uppercase">
                  Divulgando na unha
                </h3>
                <ul className="mt-5 space-y-3.5">
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
              <div className="rounded-3xl bg-marca-700 p-7 text-white shadow-[0_24px_60px_-24px_rgba(196,58,30,0.55)] sm:p-8">
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  Com o Escolhe Promo
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {FACIL.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <IconeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-white" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* O que entra */}
        <section className="lp-reveal py-20 sm:py-28">
          <div className="mx-auto w-full max-w-3xl px-5">
            <h2 className="fonte-display text-3xl text-balance sm:text-4xl">
              O que entra no acesso
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {INCLUI.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-superficie p-4 ring-1 ring-black/[0.06]"
                >
                  <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-marca-600" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ + objeções */}
        <section className="bg-superficie py-20 sm:py-28">
          <div className="mx-auto w-full max-w-2xl px-5">
            <h2 className="fonte-display text-3xl text-balance sm:text-4xl">
              Perguntas que todo mundo faz
            </h2>
            <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
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
        <section className="py-20 sm:py-28">
          <div className="mx-auto w-full max-w-2xl px-5">
            <div className="rounded-3xl bg-marca-50 p-8 text-center sm:p-12">
              <p className="text-xs font-bold tracking-[0.12em] text-marca-700 uppercase">
                Garantia de 7 dias
              </p>
              <p className="mt-3 text-lg text-pretty">
                Compre, use o Escolhe Promo por uma semana inteira. Se não fizer
                sentido pra você, é só pedir o reembolso. Devolvemos os R${" "}
                {PRECO} sem perguntar nada.
              </p>
            </div>
          </div>
        </section>

        {/* Nota de quem fez */}
        <section className="lp-reveal py-20 sm:py-28">
          <div className="mx-auto w-full max-w-2xl px-5">
            <blockquote className="border-l-2 border-marca-400 pl-5 text-lg text-pretty italic">
              Vi muita gente querendo uma renda extra com a Shopee e travando
              sempre no mesmo lugar: a hora de escrever o texto e montar a
              imagem. O Escolhe Promo nasceu pra tirar essa parte do caminho. O
              resto, que é escolher o produto e falar com o seu público,
              continua sendo com você.
            </blockquote>
            <p className="mt-4 pl-5 text-sm font-semibold text-tinta-fraca not-italic">
              Quem faz o Escolhe Promo
            </p>
          </div>
        </section>

        {/* Fechamento — a única seção "molhada" */}
        <section className="bg-brasa py-24 text-white sm:py-32">
          <div className="mx-auto w-full max-w-xl px-5 text-center">
            <h2 className="fonte-display text-4xl text-balance sm:text-5xl">
              Uma vez só. Pra sempre.
            </h2>
            <p className="mt-4 text-marca-100 text-pretty">
              Sem assinatura, sem cobrança recorrente. Você paga R$ {PRECO}{" "}
              hoje, tem 7 dias de garantia e usa o Escolhe Promo o quanto quiser.
            </p>
            <a
              href={CHECKOUT}
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-lg font-bold text-marca-700 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-200 hover:bg-marca-50 active:scale-[0.98] sm:w-auto"
            >
              Garantir meu acesso
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 py-8 text-center text-xs text-tinta-fraca">
        <p className="mb-3 flex items-center justify-center gap-1.5 text-tinta-fraca">
          <MarcaSimbolo size={16} /> Escolhe Promo
        </p>
        <p>
          Já comprou?{" "}
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-superficie/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="fonte-display text-lg">R$ {PRECO}</p>
            <p className="text-[11px] text-tinta-fraca">
              uma vez · 7 dias de garantia
            </p>
          </div>
          <a
            href={CHECKOUT}
            className="rounded-xl bg-marca-700 px-5 py-3 text-sm font-bold text-white active:scale-[0.98]"
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
