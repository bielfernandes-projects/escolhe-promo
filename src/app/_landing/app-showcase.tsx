import Image from "next/image";
import vitrine from "../../../public/demo/vitrine.jpg";
import copy from "../../../public/demo/copy.jpg";
import imagem from "../../../public/demo/imagem.jpg";

/**
 * O app de verdade no herói: um print da Vitrine numa moldura de janela, com
 * as duas telas seguintes (copy pronta, imagem pronta) sobrepostas. São
 * capturas reais — nada de mockup skeleton. A cascata de entrada é CSS puro
 * (classe lp-cascata), respeitando prefers-reduced-motion.
 */
export function AppShowcase() {
  return (
    <div className="lp-cascata relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Janela principal — a Vitrine */}
      <div className="overflow-hidden rounded-2xl bg-superficie shadow-[0_24px_60px_-20px_rgba(196,58,30,0.28)] ring-1 ring-black/[0.06]">
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="ml-3 text-xs font-medium text-tinta-fraca">
            eitapromo.bf.dev.br
          </span>
        </div>
        <Image
          src={vitrine}
          alt="A Vitrine do Eita Promo: produtos da Shopee do dia com preço e comissão, filtrados por nicho"
          placeholder="blur"
          priority
          className="w-full"
          sizes="(min-width: 1024px) 620px, 100vw"
        />
      </div>

      {/* Telas 2 e 3 — no fluxo abaixo no mobile, espiando pelas quinas no desktop */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:block">
        <figure className="overflow-hidden rounded-xl bg-superficie shadow-xl ring-1 ring-black/[0.06] lg:absolute lg:-bottom-16 lg:-left-10 lg:w-44">
          <Image
            src={copy}
            alt="A copy pronta pra postar, com o texto gerado e os botões de WhatsApp e copiar"
            placeholder="blur"
            className="w-full"
            sizes="(min-width: 1024px) 176px, 45vw"
          />
          <figcaption className="px-3 py-2 text-[11px] font-semibold text-tinta-fraca">
            2 · a copy pronta
          </figcaption>
        </figure>

        <figure className="overflow-hidden rounded-xl bg-superficie shadow-xl ring-1 ring-black/[0.06] lg:absolute lg:-right-8 lg:-bottom-24 lg:w-40">
          <Image
            src={imagem}
            alt="A imagem pronta pra Feed, montada com a foto e o preço do produto"
            placeholder="blur"
            className="w-full"
            sizes="(min-width: 1024px) 160px, 45vw"
          />
          <figcaption className="px-3 py-2 text-[11px] font-semibold text-tinta-fraca">
            3 · a imagem pronta
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
