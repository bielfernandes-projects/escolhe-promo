import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { temAcessoAtivo } from "@/lib/auth/acesso";
import { Cabecalho } from "./cabecalho";
import { ModalCriarSenha } from "./modal-criar-senha";

/**
 * Protege tudo que esta sob /app. So uma sessao do Supabase — nascida do magic
 * link do webhook da Cakto ou do login — da acesso. Nao existe self-signup.
 *
 * Quem nao tem sessao vai pro /login, nao pra landing: mandar pra landing era o
 * que fazia o app parecer quebrado, porque nao havia onde entrar.
 *
 * Quem teve a compra reembolsada tambem cai fora aqui (ver temAcessoAtivo).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!(await temAcessoAtivo(supabase, user.id))) {
    redirect("/acesso-encerrado");
  }

  // Primeiro acesso (entrou via magic link, sem senha ainda): trava o app até
  // criar uma senha. A flag é gravada pelo próprio modal.
  const precisaCriarSenha = !user.user_metadata?.senha_criada;

  return (
    <>
      <Cabecalho />
      {precisaCriarSenha && <ModalCriarSenha email={user.email ?? ""} />}
      {children}
    </>
  );
}
