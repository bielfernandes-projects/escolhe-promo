import Link from "next/link";
import { listarProdutos } from "@/lib/produtos/repositorio";
import { listarItensDivulgados } from "./divulgacao-acao";
import { temCredencialShopee } from "./link-afiliado";
import { VitrineClient } from "./vitrine-client";

export const metadata = { title: "Vitrine do dia — Escolhe Promo" };

/**
 * Server Component de proposito: a Vitrine sai do Supabase, ja filtrada pelo
 * RLS. Antes esta pagina era "use client" e chamava a Shopee direto do browser,
 * o que arrastava o app secret pro bundle e falhava sempre.
 */
export default async function VitrinePage() {
  const [produtos, itensDivulgados, temApiShopee] = await Promise.all([
    listarProdutos(800),
    listarItensDivulgados(),
    temCredencialShopee(),
  ]);

  if (produtos.length === 0) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-16 text-center">
        <div className="text-5xl">🗓️</div>
        <h1 className="mt-4 text-xl font-bold">A Vitrine ainda está vazia</h1>
        <p className="mt-2 text-sm text-tinta-fraca">
          Os produtos do dia ainda não foram sincronizados. Isso acontece
          automaticamente todo dia de manhã.
        </p>
        <Link
          href="/app"
          className="mt-6 inline-block rounded-xl bg-marca-600 px-5 py-3 font-semibold text-white"
        >
          Voltar ao início
        </Link>
      </main>
    );
  }

  return (
    <VitrineClient
      produtos={produtos}
      itensDivulgados={itensDivulgados}
      temApiShopee={temApiShopee}
    />
  );
}
