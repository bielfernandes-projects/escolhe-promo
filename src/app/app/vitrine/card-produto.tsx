"use client";

import type { Produto } from "@/lib/shopee/products";

type CardProdutoProps = {
  produto: Produto;
  onClick: (produto: Produto) => void;
};

export function CardProduto({ produto, onClick }: CardProdutoProps) {
  return (
    <button
      onClick={() => onClick(produto)}
      className="group flex flex-col gap-2 rounded-lg bg-white p-3 text-left shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative overflow-hidden rounded bg-gray-100 aspect-square">
        <img
          src={produto.imagemUrl}
          alt={produto.nome}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
          {produto.nome}
        </h3>

        <div className="text-xs text-gray-600">
          ⭐ {produto.avaliacao.toFixed(1)} · 📊 {produto.vendas}
        </div>

        <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between">
          <div>
            <div className="text-xs text-gray-500">Preço</div>
            <div className="text-lg font-bold text-gray-900">
              R${produto.preco.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Comissão</div>
            <div className="text-lg font-bold text-green-600">
              R${produto.comissao.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
