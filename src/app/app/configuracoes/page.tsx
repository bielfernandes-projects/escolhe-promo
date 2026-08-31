import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormularioSenha } from "./formulario-senha";
import { FormularioShopee } from "./formulario-shopee";

export const metadata = { title: "Configurações — Eita Promo" };

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
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-tinta-fraca transition-colors hover:text-marca-700"
      >
        <span aria-hidden>←</span> Voltar pra Vitrine
      </Link>
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
        Configurações
      </h1>
      <p className="mt-1 text-sm text-tinta-fraca">{user!.email}</p>

      <div className="mt-6 space-y-6">
        <FormularioSenha />
        <FormularioShopee appIdSalvo={credencial?.shopee_app_id ?? null} />
      </div>
    </main>
  );
}
