import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ehAdmin } from "@/lib/admin";
import { listarProdutos } from "@/lib/produtos/repositorio";
import { VitrineClient } from "./vitrine-client";
import { BotaoRegerar } from "./botao-regerar";

export const metadata = { title: "Vitrine do dia — Eita Promo" };

/**
 * Server Component de proposito: a Vitrine sai do Supabase, ja filtrada pelo
 * RLS. Antes esta pagina era "use client" e chamava a Shopee direto do browser,
 * o que arrastava o app secret pro bundle e falhava sempre.
 */
export default async function VitrinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const podeRegerar = ehAdmin(user?.email);

  const produtos = await listarProdutos(700);

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
        {podeRegerar && (
          <div className="mt-6 flex justify-center">
            <BotaoRegerar />
          </div>
        )}
      </main>
    );
  }

  return <VitrineClient produtos={produtos} podeRegerar={podeRegerar} />;
}
