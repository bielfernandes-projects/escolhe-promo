import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ConfiguracoesClient } from "./configuracoes-client";

export const metadata = {
  title: "Configurações — Escolhe Promo",
  robots: { index: false, follow: false },
};

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [credencialRes, perfilRes, divulgacoesRes] = await Promise.all([
    supabase
      .from("credenciais_afiliado")
      .select("shopee_app_id")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("perfis")
      .select("handle, nome_exibicao")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("divulgacoes")
      .select(
        "id, item_id, nome, preco, imagem_url, link_afiliado, usou_link_proprio, na_vitrine, ordem",
      )
      .eq("user_id", user!.id)
      .order("ordem", { ascending: true })
      .order("criado_em", { ascending: false }),
  ]);

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

      <ConfiguracoesClient
        email={user!.email ?? ""}
        appIdShopee={credencialRes.data?.shopee_app_id ?? null}
        perfil={perfilRes.data ?? null}
        divulgacoes={divulgacoesRes.data ?? []}
      />

      <section className="mt-8 rounded-2xl bg-superficie p-5 ring-1 ring-black/[0.06]">
        <h2 className="text-base font-bold text-tinta">
          Tem uma crítica ou ideia?
        </h2>
        <p className="mt-1.5 text-sm text-tinta-fraca">
          O Escolhe Promo é novo e cresce com a ajuda de quem usa. Se tem algo
          que te incomoda ou que você queria ver por aqui, me conta.
        </p>
        <a
          href="mailto:contato@escolhepromo.com.br?subject=Ideia%20ou%20cr%C3%ADtica%20sobre%20o%20Escolhe%20Promo"
          className="mt-3 inline-flex text-sm font-semibold text-marca-700 underline underline-offset-2"
        >
          contato@escolhepromo.com.br
        </a>
      </section>
    </main>
  );
}
