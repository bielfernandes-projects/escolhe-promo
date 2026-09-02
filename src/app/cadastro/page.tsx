import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormularioCadastro } from "./formulario-cadastro";
import { Marca } from "@/app/_brand/marca";

export const metadata = {
  title: "Testar grátis",
  robots: { index: false, follow: false },
};

export default async function CadastroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app/vitrine");
  }

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
        <h1 className="fonte-display mt-4 text-2xl text-tinta">7 dias grátis</h1>
        <p className="mt-2 text-sm text-tinta-fraca">
          Teste tudo por 7 dias, sem cartão. Depois é R$ 47 uma vez só pra
          continuar — sem mensalidade.
        </p>
      </div>

      <FormularioCadastro />

      <p className="mt-6 text-center text-sm text-tinta-fraca">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-marca-700 underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
