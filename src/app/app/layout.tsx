import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checarAcesso } from "@/lib/auth/acesso";
import { Cabecalho } from "./cabecalho";
import { ModalCriarSenha } from "./modal-criar-senha";
import { AvisoTeste } from "./aviso-teste";

/**
 * Protege tudo que esta sob /app. So uma sessao do Supabase — nascida do magic
 * link do webhook da Cakto, do /cadastro (teste gratis) ou do login — da
 * acesso.
 *
 * Quem nao tem sessao vai pro /login, nao pra landing: mandar pra landing era o
 * que fazia o app parecer quebrado, porque nao havia onde entrar.
 *
 * Quem teve a compra reembolsada, ou cujo teste gratis expirou, cai fora aqui
 * (ver checarAcesso).
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

  const acesso = await checarAcesso(supabase, user.id);
  if (!acesso.ativo) {
    redirect(
      acesso.motivo === "reembolso"
        ? "/acesso-encerrado"
        : "/acesso-encerrado?de=teste",
    );
  }

  // Primeiro acesso (entrou via magic link, sem senha ainda): trava o app até
  // criar uma senha. A flag é gravada pelo próprio modal.
  const precisaCriarSenha = !user.user_metadata?.senha_criada;

  return (
    <>
      {acesso.trial && <AvisoTeste expiraEm={acesso.trialExpiraEm} />}
      <Cabecalho />
      {precisaCriarSenha && <ModalCriarSenha email={user.email ?? ""} />}
      {children}
    </>
  );
}
