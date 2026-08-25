"use client";

import { useState } from "react";
import type { Produto } from "@/lib/produtos/tipos";

type CardProdutoProps = {
  produto: Produto;
  onClick: (produto: Produto) => void;
};

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** 1.2 mil vende melhor que 1200 num card estreito de celular. */
const emMilhares = (valor: number) =>
  valor >= 1000 ? `${(valor / 1000).toFixed(1).replace(".0", "")} mil` : String(valor);

export function CardProduto({ produto, onClick }: CardProdutoProps) {
  const [imagemQuebrou, setImagemQuebrou] = useState(false);

  return (
    <button
      onClick={() => onClick(produto)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-superficie text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-tela">
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
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          {produto.nicho}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-[13px] leading-snug font-medium">
          {produto.nome}
        </h3>

        <div className="text-[11px] text-tinta-fraca">
          ⭐ {produto.avaliacao.toFixed(1)} · {emMilhares(produto.vendas)} vendidos
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="text-base font-bold">{emReais(produto.preco)}</div>
          <div className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-right">
            <div className="text-[10px] leading-none text-emerald-700">ganha</div>
            <div className="text-xs leading-tight font-bold text-emerald-700">
              {emReais(produto.comissao)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
