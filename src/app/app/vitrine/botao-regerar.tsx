"use client";

import { useState, useTransition } from "react";
import { regerarCatalogo } from "./acoes";

/**
 * Forca uma busca de produtos novos na Shopee. So aparece pro dono (a Vitrine
 * decide via `podeRegerar`). A sincronizacao demora — feedback explicito.
 */
export function BotaoRegerar({ className = "" }: { className?: string }) {
  const [pendente, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function clique() {
    setMsg(null);
    startTransition(async () => {
      const r = await regerarCatalogo();
      setMsg(r.ok ? `${r.gravados} produtos atualizados` : r.erro);
    });
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        onClick={clique}
        disabled={pendente}
        className={`rounded-lg border border-black/10 bg-superficie px-3 py-1.5 text-xs font-semibold text-tinta transition-colors hover:bg-tela disabled:opacity-60 ${className}`}
      >
        {pendente ? "Buscando novos produtos…" : "Gerar novos produtos ↻"}
      </button>
      {msg && <span className="text-[11px] text-tinta-fraca">{msg}</span>}
    </span>
  );
}
