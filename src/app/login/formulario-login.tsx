"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Modo = "senha" | "link";

const MENSAGENS_DE_ERRO: Record<string, string> = {
  link_invalido: "Esse link não é válido. Peça um novo abaixo.",
  link_expirado: "Esse link expirou. Peça um novo abaixo.",
  sem_sessao: "Sua sessão terminou. Entre de novo.",
};

export function FormularioLogin({ erroInicial }: { erroInicial?: string }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(
    erroInicial ? (MENSAGENS_DE_ERRO[erroInicial] ?? "Não deu pra entrar.") : null,
  );
  const [linkEnviado, setLinkEnviado] = useState(false);

  async function entrarComSenha() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(
        error.message.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : error.message,
      );
      return;
    }
    // refresh() faz o servidor reler o cookie recém-gravado antes de navegar.
    router.refresh();
    router.push("/app/vitrine");
  }

  async function enviarLink() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/app/vitrine`,
      },
    });
    if (error) {
      setErro(error.message);
      return;
    }
    setLinkEnviado(true);
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      if (modo === "senha") await entrarComSenha();
      else await enviarLink();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  if (linkEnviado) {
    return (
      <div className="rounded-2xl bg-superficie p-6 text-center shadow-sm ring-1 ring-black/5">
        <div className="text-4xl">📬</div>
        <h2 className="mt-3 text-lg font-semibold">Link enviado!</h2>
        <p className="mt-2 text-sm text-tinta-fraca">
          Abra seu e-mail e toque no link pra entrar. Pode fechar esta página.
        </p>
        <button
          onClick={() => setLinkEnviado(false)}
          className="mt-4 text-sm font-semibold text-marca-600 underline underline-offset-4"
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="rounded-2xl bg-superficie p-6 shadow-sm ring-1 ring-black/5"
    >
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-tela p-1">
        {(["senha", "link"] as const).map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => {
              setModo(opcao);
              setErro(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              modo === opcao
                ? "bg-superficie text-tinta shadow-sm"
                : "text-tinta-fraca"
            }`}
          >
            {opcao === "senha" ? "Com senha" : "Link no e-mail"}
          </button>
        ))}
      </div>

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

      {modo === "senha" && (
        <>
          <label className="mt-4 block text-sm font-semibold" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none transition-colors focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
          />
        </>
      )}

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
        className="mt-5 w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800 disabled:opacity-60"
      >
        {carregando
          ? "Entrando..."
          : modo === "senha"
            ? "Entrar"
            : "Receber link por e-mail"}
      </button>

      <p className="mt-4 text-center text-xs text-tinta-fraca">
        {modo === "senha"
          ? "Esqueceu a senha? Use a aba “Link no e-mail”."
          : "Você recebe um link e entra sem digitar senha."}
      </p>
    </form>
  );
}
