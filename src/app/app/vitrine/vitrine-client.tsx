"use client";

import { useMemo, useState } from "react";
import type { Produto } from "@/lib/produtos/tipos";
import { NICHOS, type Nicho } from "@/lib/shopee/niches";
import { CardProduto } from "./card-produto";
import { ModalGerador } from "./modal-gerador";

type Filtro = Nicho | "todos";

export function VitrineClient({ produtos }: { produtos: Produto[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [selecionado, setSelecionado] = useState<Produto | null>(null);

  // So mostra chip de nicho que tem produto — filtro vazio frustra o usuario.
  const nichosComProduto = useMemo(() => {
    const presentes = new Set(produtos.map((p) => p.nicho));
    return NICHOS.filter((n) => presentes.has(n));
  }, [produtos]);

  const visiveis = useMemo(
    () =>
      filtro === "todos" ? produtos : produtos.filter((p) => p.nicho === filtro),
    [produtos, filtro],
  );

  const chips: Filtro[] = ["todos", ...nichosComProduto];

  return (
    <main className="flex-1 pb-16">
      <header className="border-b border-black/5 bg-superficie">
        <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Vitrine do dia
          </h1>
          <p className="mt-0.5 text-sm text-tinta-fraca">
            {visiveis.length}{" "}
            {visiveis.length === 1 ? "produto" : "produtos"} pra divulgar hoje
          </p>
        </div>

        {/* Rolagem horizontal: no celular os 9 nichos nao cabem em linha. */}
        <div className="-mb-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max max-w-6xl gap-2 px-4 pb-3">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setFiltro(chip)}
                aria-pressed={filtro === chip}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  filtro === chip
                    ? "bg-marca-600 text-white"
                    : "bg-tela text-tinta-fraca hover:bg-marca-50 hover:text-marca-700"
                }`}
              >
                {chip === "todos" ? "Todos" : chip}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-5">
        {visiveis.length === 0 ? (
          <p className="py-16 text-center text-sm text-tinta-fraca">
            Nenhum produto nesse nicho hoje.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visiveis.map((produto) => (
              <CardProduto
                key={produto.itemId}
                produto={produto}
                onClick={setSelecionado}
              />
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <ModalGerador
          produto={selecionado}
          onClose={() => setSelecionado(null)}
        />
      )}
    </main>
  );
}
