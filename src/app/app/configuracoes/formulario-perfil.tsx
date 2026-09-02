"use client";

import { useState } from "react";
import { normalizarHandle } from "@/lib/perfil/handle";
import { salvarPerfil } from "./perfil-acoes";

export function FormularioPerfil({
  handleSalvo,
  nomeSalvo,
  aoSalvar,
}: {
  handleSalvo: string | null;
  nomeSalvo: string | null;
  aoSalvar: (handle: string) => void;
}) {
  const [handle, setHandle] = useState(handleSalvo ?? "");
  const [nome, setNome] = useState(nomeSalvo ?? "");
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMsg(null);
    const r = await salvarPerfil(handle, nome);
    if (r.ok) {
      const limpo = normalizarHandle(handle);
      setHandle(limpo);
      setMsg({ tipo: "ok", texto: "Vitrine salva." });
      aoSalvar(limpo);
    } else {
      setMsg({ tipo: "erro", texto: r.erro ?? "Erro ao salvar." });
    }
    setCarregando(false);
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-2xl bg-superficie p-5 ring-1 ring-black/[0.06]"
    >
      <h2 className="text-base font-bold text-tinta">Sua vitrine pública</h2>
      <p className="mt-1 text-sm text-tinta-fraca">
        Um link só pra colar na bio do Instagram, com tudo que você divulgou.
      </p>

      <label htmlFor="perfil-nome" className="mt-3 block text-sm font-semibold">
        Seu nome
      </label>
      <input
        id="perfil-nome"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Como as clientes te conhecem"
        className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
      />

      <label htmlFor="perfil-handle" className="mt-3 block text-sm font-semibold">
        Seu @
      </label>
      <div className="mt-1.5 flex items-center rounded-xl border border-black/10 bg-superficie px-4 focus-within:border-marca-500">
        <span className="text-sm text-tinta-fraca">escolhepromo.com.br/@</span>
        <input
          id="perfil-handle"
          required
          value={handle}
          onChange={(e) => setHandle(normalizarHandle(e.target.value))}
          placeholder="seunome"
          autoCapitalize="none"
          autoCorrect="off"
          className="min-w-0 flex-1 bg-transparent py-3 pl-0.5 outline-none"
        />
      </div>

      {msg && (
        <p
          role="alert"
          className={`mt-3 text-sm ${msg.tipo === "ok" ? "text-emerald-700" : "text-red-700"}`}
        >
          {msg.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="mt-4 rounded-xl bg-marca-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:opacity-60"
      >
        {carregando ? "Salvando..." : "Salvar vitrine"}
      </button>
    </form>
  );
}
