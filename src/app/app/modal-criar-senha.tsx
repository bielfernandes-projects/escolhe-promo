"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { traduzirErro } from "@/lib/auth/erro-mensagens";
import { CampoSenha } from "@/app/_ui/campo-senha";

/**
 * Modal bloqueante no primeiro acesso (entrou via magic link, ainda sem senha).
 * Sem "pular": criar a senha aqui é o que permite login por e-mail depois, em
 * vez de depender do magic link toda vez.
 *
 * O layout do /app só renderiza isto quando user_metadata.senha_criada é falso;
 * o updateUser marca a flag e o router.refresh() re-renderiza o layout, que
 * então libera o app.
 */
export function ModalCriarSenha({ email }: { email: string }) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: senha,
      data: { senha_criada: true },
    });

    if (error) {
      setErro(traduzirErro(error.message));
      setCarregando(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-superficie p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]">
        <h1 className="fonte-display text-2xl text-tinta">Bem-vindo! 🎉</h1>
        <p className="mt-2 text-sm text-tinta-fraca">
          Crie uma senha pra entrar direto da próxima vez, sem precisar do e-mail.
        </p>

        <form onSubmit={aoEnviar} className="mt-5">
          <label htmlFor="senha-inicial" className="block text-sm font-semibold">
            Senha
          </label>
          <CampoSenha
            id="senha-inicial"
            autoComplete="new-password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoFocus
            className="mt-1.5"
          />

          <p className="mt-2 text-xs text-tinta-fraca">
            Sua conta: <span className="font-semibold">{email}</span>
          </p>

          {erro && (
            <p
              role="alert"
              className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-5 w-full rounded-xl bg-marca-700 px-4 py-3.5 font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:opacity-60"
          >
            {carregando ? "Salvando..." : "Criar senha e entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
