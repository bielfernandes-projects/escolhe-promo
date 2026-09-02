"use client";

import { useState } from "react";
import type { Produto } from "@/lib/produtos/tipos";

type CardProdutoProps = {
  produto: Produto;
  onClick: (produto: Produto) => void;
  /** Já compartilhado por essa afiliada: card em P&B com a fita "Já divulgado". */
  jaDivulgado?: boolean;
};

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** 1.2 mil vende melhor que 1200 num card estreito de celular. */
const emMilhares = (valor: number) =>
  valor >= 1000 ? `${(valor / 1000).toFixed(1).replace(".0", "")} mil` : String(valor);

export function CardProduto({ produto, onClick, jaDivulgado }: CardProdutoProps) {
  const [imagemQuebrou, setImagemQuebrou] = useState(false);

  return (
    <button
      onClick={() => onClick(produto)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-superficie text-left ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(196,58,30,0.28)] hover:ring-marca-200"
    >
      <div className="relative aspect-square overflow-hidden bg-tela">
        {jaDivulgado && (
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-20 w-20 overflow-hidden">
            <span className="absolute top-[14px] right-[-34px] w-[130px] rotate-45 bg-marca-600 py-[3px] text-center text-[9px] font-bold tracking-wide text-white uppercase shadow-sm">
              Já divulgado
            </span>
          </div>
        )}
        {imagemQuebrou ? (
          <div className="flex h-full w-full items-center justify-center text-3xl opacity-40">
            🛍️
          </div>
        ) : (
          // next/image reescreveria a URL e quebraria o crossOrigin de que
          // o gerador de imagem depende pra capturar sem contaminar o canvas.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.imagemUrl}
            alt=""
            loading="lazy"
            /*
             * Sem isso o browser cacheia uma resposta sem CORS e, na hora de
             * gerar a imagem, o html2canvas contamina o canvas e o download falha.
             */
            crossOrigin="anonymous"
            onError={() => setImagemQuebrou(true)}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] ${
              jaDivulgado ? "opacity-60 grayscale" : ""
            }`}
          />
        )}

        <span className="absolute top-2 left-2 rounded-full bg-tinta/75 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          {produto.nicho}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-tinta">
          {produto.nome}
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-tinta-fraca">
          <EstrelaIcone className="h-3 w-3 text-amber-400" />
          {produto.avaliacao.toFixed(1)}
          <span className="text-black/20">·</span>
          {emMilhares(produto.vendas)} vendidos
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div className="fonte-display text-[17px] text-tinta">
            {emReais(produto.preco)}
          </div>
          <div className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-right leading-none">
            <div className="text-[10px] text-emerald-700/80">você ganha</div>
            <div className="mt-0.5 text-xs font-bold text-emerald-700">
              {emReais(produto.comissao)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function EstrelaIcone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
    </svg>
  );
}
