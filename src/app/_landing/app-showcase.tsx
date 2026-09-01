import Image from "next/image";
import vitrine from "../../../public/demo/vitrine.jpg";

/**
 * Herói: o produto cru da Vitrine (captura real) e, sobreposta, a copy de
 * WhatsApp que sai pronta dele. O preço "carimba" sobre a copy quando a página
 * carrega (keyframes `lp-carimbo` / `lp-selo` em globals.css) — é o único
 * movimento, o gesto de "copiou, postou, vendeu". O print da Vitrine é o LCP e
 * está sempre visível; nada aqui depende de animação pra aparecer.
 */
export function AppShowcase() {
  return (
    <div className="lp-montagem relative mx-auto w-full max-w-md pb-24 sm:max-w-lg sm:pb-28 lg:max-w-[34rem] lg:pb-14">
      {/* Janela — a Vitrine, o produto cru */}
      <div className="overflow-hidden rounded-2xl bg-superficie shadow-[0_30px_70px_-24px_rgba(196,58,30,0.32)] ring-1 ring-black/[0.06]">
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="ml-3 text-xs font-medium text-tinta-fraca">
            escolhepromo.com.br
          </span>
        </div>
        <Image
          src={vitrine}
          alt="A Vitrine do Escolhe Promo: produtos da Shopee do dia com preço e comissão, filtrados por nicho"
          placeholder="blur"
          priority
          className="w-full"
          sizes="(min-width: 1024px) 600px, 100vw"
        />
      </div>

      {/* A copy de WhatsApp que sai pronta do produto */}
      <div className="absolute right-3 -bottom-4 w-60 rounded-2xl bg-[#e7f6e9] p-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.06] sm:right-6 sm:w-64 lg:-right-4 lg:-bottom-6 lg:w-72">
        <span
          data-selo
          className="fonte-display absolute -top-3 -right-2 rotate-6 rounded-full bg-tinta px-2.5 py-1 text-[11px] text-white shadow-md"
        >
          pronto
        </span>
        <div className="rounded-xl rounded-tl-sm bg-white/75 p-3 text-[13px] leading-snug text-tinta">
          <p className="font-medium">Achadinho da semana, corre que acaba</p>
          <p className="mt-1.5 font-bold">Kit Organizador de Gaveta</p>
          <p className="mt-1 text-tinta-fraca">
            <span className="line-through">De R$ 79,90</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5">
            Por
            <span
              data-preco
              className="fonte-display inline-block rounded-md bg-marca-700 px-1.5 py-0.5 text-[15px] text-white"
            >
              R$ 47,00
            </span>
          </p>
        </div>
        <p className="mt-2 pl-1 text-[11px] font-semibold text-[#1c8c4c]">
          copiado pro WhatsApp
        </p>
      </div>
    </div>
  );
}
