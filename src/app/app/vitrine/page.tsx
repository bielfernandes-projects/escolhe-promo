"use client";

import { useEffect, useState } from "react";
import type { Produto } from "@/lib/shopee/products";
import { fetchProdutos } from "@/lib/shopee/products";
import { NICHOS, type Nicho } from "@/lib/shopee/niches";
import { CardProduto } from "./card-produto";
import { ModalGerador } from "./modal-gerador";

export default function VitrinePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nichoFiltro, setNichoFiltro] = useState<Nicho | "todos">("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );

  useEffect(() => {
    setCarregando(true);
    setErro(null);

    fetchProdutos({ limit: 100 })
      .then(setProdutos)
      .catch((err) => {
        setErro(err instanceof Error ? err.message : "Erro ao buscar produtos");
      })
      .finally(() => setCarregando(false));
  }, []);

  const produtosFiltrados =
    nichoFiltro === "todos"
      ? produtos
      : produtos.filter((p) => p.nicho === nichoFiltro);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vitrine do Dia
          </h1>
          <p className="text-gray-600">
            {produtosFiltrados.length} produtos disponíveis
          </p>
        </div>

        {/* Filtro de nicho */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setNichoFiltro("todos")}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              nichoFiltro === "todos"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
            }`}
          >
            Todos
          </button>
          {NICHOS.map((nicho) => (
            <button
              key={nicho}
              onClick={() => setNichoFiltro(nicho)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                nichoFiltro === nicho
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
              }`}
            >
              {nicho}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {carregando && (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro: {erro}
          </div>
        )}

        {!carregando && !erro && (
          <>
            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                Nenhum produto encontrado neste nicho
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {produtosFiltrados.map((produto) => (
                  <CardProduto
                    key={produto.itemId}
                    produto={produto}
                    onClick={setProdutoSelecionado}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal do gerador */}
      {produtoSelecionado && (
        <ModalGerador
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
        />
      )}
    </div>
  );
}
