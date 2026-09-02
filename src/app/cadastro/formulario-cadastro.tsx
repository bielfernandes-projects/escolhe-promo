"use client";

import { useState } from "react";
import { criarContaTeste } from "./acoes";

export function FormularioCadastro() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await criarContaTeste(email);
      if (!resultado.ok) {
        setErro(resultado.erro ?? "Não deu pra criar a conta.");
        return;
      }
      setEnviado(true);
    } catch {
      setErro("Erro inesperado. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  if (enviado) {
    return (
      <div className="rounded-3xl bg-superficie p-6 text-center shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-semibold">Conta criada!</h2>
        <p className="mt-2 text-sm text-tinta-fraca">
          Abra seu e-mail e toque no link pra entrar e começar seus 7 dias.
          Não chegou em alguns minutos? Olhe o spam.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="rounded-3xl bg-superficie p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]"
    >
      <label className="block text-sm font-semibold" htmlFor="email">
        E-mail
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@email.com"
        className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none transition-colors focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
      />

      {erro && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
        >
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="mt-5 w-full rounded-xl bg-marca-700 px-4 py-3.5 font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:opacity-60"
      >
        {carregando ? "Aguarde..." : "Criar conta e começar"}
      </button>

      <p className="mt-4 text-center text-xs text-tinta-fraca">
        Você recebe um link por e-mail pra entrar. Sem senha agora, sem cartão.
      </p>
    </form>
  );
}
