import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Cabecalho } from "./cabecalho";

/**
 * Protege tudo que esta sob /app. So uma sessao do Supabase — nascida do magic
 * link do webhook da Cakto ou do login — da acesso. Nao existe self-signup.
 *
 * Quem nao tem sessao vai pro /login, nao pra landing: mandar pra landing era o
 * que fazia o app parecer quebrado, porque nao havia onde entrar.
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

  return (
    <>
      <Cabecalho />
      {children}
    </>
  );
}
