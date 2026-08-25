import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormularioLogin } from "./formulario-login";

export const metadata = { title: "Entrar — Eita Promo" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Quem já está logado não precisa ver o formulário.
  if (user) {
    redirect("/app/vitrine");
  }

  const { erro } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Eita<span className="text-marca-600">Promo</span>
        </Link>
        <p className="mt-2 text-sm text-tinta-fraca">
          Entre pra acessar sua Vitrine do dia.
        </p>
      </div>

      <FormularioLogin erroInicial={typeof erro === "string" ? erro : undefined} />

      <p className="mt-6 text-center text-sm text-tinta-fraca">
        Ainda não tem acesso?{" "}
        <Link href="/" className="font-semibold text-marca-600 underline underline-offset-4">
          Ver a oferta
        </Link>
      </p>
    </main>
  );
}
