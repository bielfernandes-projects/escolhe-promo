import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormularioLogin } from "./formulario-login";
import { Marca } from "@/app/_brand/marca";

export const metadata = { title: "Entrar", robots: { index: false, follow: false } };

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
    <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-marca-200/45 blur-[90px]"
      />

      <div className="mb-8 text-center">
        <Link href="/" aria-label="Escolhe Promo" className="inline-flex">
          <Marca simbolo={36} texto="text-2xl" />
        </Link>
        <p className="mt-3 text-sm text-tinta-fraca">
          Entre pra acessar sua Vitrine do dia.
        </p>
      </div>

      <FormularioLogin erroInicial={typeof erro === "string" ? erro : undefined} />

      <p className="mt-6 text-center text-sm text-tinta-fraca">
        Ainda não tem acesso?{" "}
        <Link href="/" className="font-semibold text-marca-700 underline underline-offset-4">
          Ver a oferta
        </Link>
      </p>
    </main>
  );
}
