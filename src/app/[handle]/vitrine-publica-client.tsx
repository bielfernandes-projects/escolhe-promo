"use client";

import { useMemo, useState } from "react";

export type ItemVitrine = {
  divulgacao_id: string;
  item_id: string;
  nome: string;
  preco: number;
  imagem_url: string;
  link_afiliado: string;
};

/**
 * Formata aqui dentro, e nao recebe a funcao por prop: passar funcao de um
 * Server Component pra um Client Component nao serializa, e o React derruba a
 * pagina com "Functions cannot be passed directly to Client Components".
 */
const emReais = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function VitrinePublicaClient({ itens }: { itens: ItemVitrine[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((i) => i.nome.toLowerCase().includes(termo));
  }, [itens, busca]);

  return (
    <>
      <div className="relative mb-5">
        <SearchIcone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-tinta-fraca" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto"
          className="w-full rounded-xl border border-black/10 bg-superficie py-3 pr-4 pl-10 text-sm outline-none transition-colors focus:border-marca-500"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="py-16 text-center text-sm text-tinta-fraca">
          Nada com “{busca}”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtrados.map((item) => (
            <a
              key={item.divulgacao_id}
              href={item.link_afiliado}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl bg-superficie ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(196,58,30,0.28)] hover:ring-marca-200"
            >
              <div className="aspect-square overflow-hidden bg-tela">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imagem_url}
                  alt={item.nome}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <h2 className="line-clamp-2 text-[13px] leading-snug font-medium text-tinta">
                  {item.nome}
                </h2>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                  <span className="fonte-display text-[17px] text-tinta">
                    {emReais(item.preco)}
                  </span>
                  <span className="shrink-0 rounded-lg bg-marca-600 px-2.5 py-1 text-[11px] font-bold text-white">
                    Ver
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function SearchIcone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
