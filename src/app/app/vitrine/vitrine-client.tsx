"use client";

import { useMemo, useState } from "react";
import type { Produto } from "@/lib/produtos/tipos";
import { NICHOS, type Nicho } from "@/lib/shopee/niches";
import {
  ORDENACAO_PADRAO,
  OPCOES_ORDENACAO,
  ROTULOS_ORDENACAO,
  ordenarProdutos,
  type Ordenacao,
} from "@/lib/produtos/ordenacao";
import { CardProduto } from "./card-produto";
import { ModalGerador } from "./modal-gerador";

type Filtro = Nicho | "todos";

/** Quantos cards a Vitrine mostra de uma vez. O catalogo do dia e maior. */
const LIMITE = 48;

/** Minusculas + sem acento, pra busca casar "camera" com "Câmera". */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function VitrineClient({
  produtos,
  itensDivulgados,
  temApiShopee,
}: {
  produtos: Produto[];
  itensDivulgados: string[];
  temApiShopee: boolean;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>(ORDENACAO_PADRAO);
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  // Cresce quando ela compartilha um produto pelo modal, pra o card virar P&B
  // na hora sem esperar um reload.
  const [divulgados, setDivulgados] = useState(() => new Set(itensDivulgados));
  // "Gerar novos produtos" avanca uma pagina do catalogo do dia (que tem bem
  // mais produto do que cabe na tela); ao chegar no fim, volta pro comeco.
  const [pagina, setPagina] = useState(0);

  // So mostra chip de nicho que tem produto — filtro vazio frustra o usuario.
  const nichosComProduto = useMemo(() => {
    const presentes = new Set(produtos.map((p) => p.nicho));
    return NICHOS.filter((n) => presentes.has(n));
  }, [produtos]);

  const ordenados = useMemo(() => {
    let filtrados =
      filtro === "todos" ? produtos : produtos.filter((p) => p.nicho === filtro);
    // Cada palavra digitada tem que aparecer no nome (em qualquer ordem).
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    if (termos.length) {
      filtrados = filtrados.filter((p) => {
        const nome = normalizar(p.nome);
        return termos.every((t) => nome.includes(t));
      });
    }
    return ordenarProdutos(filtrados, ordenacao);
  }, [produtos, filtro, busca, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / LIMITE));
  const paginaAtual = pagina % totalPaginas;
  const inicio = paginaAtual * LIMITE;
  const visiveis = ordenados.slice(inicio, inicio + LIMITE);

  const chips: Filtro[] = ["todos", ...nichosComProduto];

  function trocarFiltro(f: Filtro) {
    setFiltro(f);
    setPagina(0);
  }

  function trocarOrdenacao(o: Ordenacao) {
    setOrdenacao(o);
    setPagina(0);
  }

  function trocarBusca(v: string) {
    setBusca(v);
    setPagina(0);
  }

  return (
    <main className="flex-1 pb-16">
      <header className="border-b border-black/[0.06] bg-superficie">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="fonte-display text-2xl text-tinta sm:text-[26px]">
                Vitrine do dia
              </h1>
              <p className="mt-1 text-sm text-tinta-fraca">
                {ordenados.length > LIMITE
                  ? `Mostrando ${inicio + 1}–${inicio + visiveis.length} de ${ordenados.length} produtos`
                  : `${ordenados.length} ${ordenados.length === 1 ? "produto" : "produtos"} pra divulgar hoje`}
              </p>
            </div>

            <label className="shrink-0">
              <span className="sr-only">Ordenar por</span>
              <select
                value={ordenacao}
                onChange={(e) => trocarOrdenacao(e.target.value as Ordenacao)}
                className="rounded-xl border border-black/10 bg-superficie px-2.5 py-2 text-xs font-semibold text-tinta outline-none focus:border-marca-500 sm:px-3 sm:text-sm"
              >
                {OPCOES_ORDENACAO.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {ROTULOS_ORDENACAO[opcao]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3.5 block">
            <span className="sr-only">Buscar produto por palavra-chave</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => trocarBusca(e.target.value)}
              placeholder="Buscar produto por palavra-chave…"
              className="w-full rounded-xl border border-black/10 bg-superficie px-3.5 py-2.5 text-sm text-tinta outline-none placeholder:text-tinta-fraca focus:border-marca-500"
            />
          </label>

          {ordenados.length > LIMITE && (
            <button
              onClick={() => setPagina((p) => p + 1)}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-marca-50 px-3.5 py-2 text-sm font-semibold text-marca-700 transition-colors hover:bg-marca-100 active:scale-[0.98]"
            >
              <RecarregarIcone className="h-3.5 w-3.5" />
              Gerar novos produtos
            </button>
          )}
        </div>

        {/* Rolagem horizontal: no celular os 9 nichos nao cabem em linha.
            Sem mx-auto no trilho interno — com w-max maior que a tela, a
            margem automatica centraliza e deixa os primeiros chips fora de
            alcance no scroll. */}
        <div className="mx-auto -mb-px max-w-6xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 px-4 pb-3">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => trocarFiltro(chip)}
                aria-pressed={filtro === chip}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  filtro === chip
                    ? "bg-marca-700 text-white"
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
            {busca.trim()
              ? `Nenhum produto com “${busca.trim()}” na Vitrine de hoje.`
              : "Nenhum produto nesse nicho hoje."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visiveis.map((produto) => (
              <CardProduto
                key={produto.itemId}
                produto={produto}
                onClick={setSelecionado}
                jaDivulgado={divulgados.has(produto.itemId)}
              />
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <ModalGerador
          produto={selecionado}
          onClose={() => setSelecionado(null)}
          temApiShopee={temApiShopee}
          onDivulgou={(itemId) =>
            setDivulgados((antes) => new Set(antes).add(itemId))
          }
        />
      )}
    </main>
  );
}

function RecarregarIcone({ className }: { className?: string }) {
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
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
    </svg>
  );
}
