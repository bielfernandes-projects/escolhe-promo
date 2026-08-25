"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function FormularioSenha() {
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setMensagem({ tipo: "erro", texto: error.message });
    } else {
      setMensagem({ tipo: "ok", texto: "Senha atualizada." });
      setSenha("");
    }
    setCarregando(false);
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="rounded-2xl bg-superficie p-5 shadow-sm ring-1 ring-black/5"
    >
      <h2 className="font-semibold">Trocar senha</h2>

      <label htmlFor="nova-senha" className="mt-3 block text-sm font-semibold">
        Nova senha
      </label>
      <input
        id="nova-senha"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="••••••••"
        className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
      />

      {mensagem && (
        <p
          role="alert"
          className={`mt-3 text-sm ${mensagem.tipo === "ok" ? "text-emerald-700" : "text-red-700"}`}
        >
          {mensagem.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="mt-4 rounded-xl bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-700 disabled:opacity-60"
      >
        {carregando ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
