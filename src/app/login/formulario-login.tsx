"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { traduzirErro } from "@/lib/auth/erro-mensagens";
import { CampoSenha } from "@/app/_ui/campo-senha";
import { entrarComSenha as entrarComSenhaAction } from "./acoes";

type Modo = "senha" | "link" | "recuperar";

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
  const [recuperarEnviado, setRecuperarEnviado] = useState(false);

  async function entrarComSenha() {
    const resultado = await entrarComSenhaAction(email, senha);
    if (!resultado.ok) {
      setErro(traduzirErro(resultado.erro));
      return;
    }
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
      setErro(traduzirErro(error.message));
      return;
    }
    setLinkEnviado(true);
  }

  async function recuperarSenha() {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery&next=/app/configuracoes`,
    });
    if (error) {
      setErro(traduzirErro(error.message));
      return;
    }
    setRecuperarEnviado(true);
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      if (modo === "senha") await entrarComSenha();
      else if (modo === "link") await enviarLink();
      else await recuperarSenha();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  if (linkEnviado || recuperarEnviado) {
    return (
      <div className="rounded-3xl bg-superficie p-6 text-center shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-semibold">
          {recuperarEnviado ? "Link de recuperação enviado" : "Link enviado"}
        </h2>
        <p className="mt-2 text-sm text-tinta-fraca">
          {recuperarEnviado
            ? "Abra seu e-mail e clique no link pra criar uma nova senha."
            : "Abra seu e-mail e toque no link pra entrar. Pode fechar esta página."}
        </p>
        <button
          onClick={() => {
            setLinkEnviado(false);
            setRecuperarEnviado(false);
          }}
          className="mt-4 text-sm font-semibold text-marca-700 underline underline-offset-4"
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="rounded-3xl bg-superficie p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]"
    >
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-tela p-1">
        {(["senha", "link", "recuperar"] as const).map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => {
              setModo(opcao);
              setErro(null);
            }}
            className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
              modo === opcao
                ? "bg-superficie text-tinta shadow-sm"
                : "text-tinta-fraca"
            }`}
          >
            {opcao === "senha" ? "Senha" : opcao === "link" ? "Link" : "Recuperar"}
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
          <CampoSenha
            id="senha"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5"
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
        className="mt-5 w-full rounded-xl bg-marca-700 px-4 py-3.5 font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:opacity-60"
      >
        {carregando
          ? "Aguarde..."
          : modo === "senha"
          ? "Entrar"
          : modo === "link"
          ? "Receber link por e-mail"
          : "Enviar link de recuperação"}
      </button>

      <p className="mt-4 text-center text-xs text-tinta-fraca">
        {modo === "senha"
          ? 'Esqueceu a senha? Use a aba "Recuperar".'
          : modo === "link"
          ? "Você recebe um link e entra sem digitar senha."
          : "Você recebe um link pra criar uma nova senha."}
      </p>
    </form>
  );
}
