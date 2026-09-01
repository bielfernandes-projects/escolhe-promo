import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormularioSenha } from "./formulario-senha";
import { FormularioShopee } from "./formulario-shopee";

export const metadata = { title: "Configurações — Escolhe Promo" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: credencial } = await supabase
    .from("credenciais_afiliado")
    .select("shopee_app_id")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8">
      <Link
        href="/app/vitrine"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-fraca transition-colors hover:text-marca-700"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Voltar pra Vitrine
      </Link>

      <h1 className="fonte-display text-2xl text-tinta sm:text-[26px]">
        Configurações
      </h1>
      <p className="mt-1 text-sm text-tinta-fraca">{user!.email}</p>

      <div className="mt-7 space-y-5">
        <FormularioSenha />
        <FormularioShopee appIdSalvo={credencial?.shopee_app_id ?? null} />
      </div>
    </main>
  );
}
