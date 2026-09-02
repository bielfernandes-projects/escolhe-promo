import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Marca } from "@/app/_brand/marca";
import {
  DadosEstruturados,
  vitrineDaAfiliada,
} from "@/lib/seo/dados-estruturados";
import { VitrinePublicaClient, type ItemVitrine } from "./vitrine-publica-client";

type Params = { handle: string };

/** O segmento chega como "@fulana". Sem o "@" não é uma vitrine. */
function extrairHandle(bruto: string): string | null {
  const decodificado = decodeURIComponent(bruto);
  if (!decodificado.startsWith("@")) return null;
  return decodificado.slice(1).toLowerCase();
}

async function carregar(handle: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("vitrine_publica", {
    p_handle: handle,
  });
  if (error) {
    console.error("[vitrine-publica] rpc falhou:", error.message);
    return null;
  }
  const linhas = (data ?? []) as Array<
    ItemVitrine & { nome_exibicao: string; handle: string }
  >;
  if (linhas.length === 0) {
    // Sem produtos publicados: ainda pode existir o perfil (vitrine vazia).
    const { data: perfil } = await supabase
      .from("perfis")
      .select("nome_exibicao, handle")
      .eq("handle", handle)
      .maybeSingle();
    if (!perfil) return null;
    return { nome: perfil.nome_exibicao, handle: perfil.handle, itens: [] };
  }
  return {
    nome: linhas[0].nome_exibicao,
    handle: linhas[0].handle,
    itens: linhas.map((l) => ({
      divulgacao_id: l.divulgacao_id,
      item_id: l.item_id,
      nome: l.nome,
      preco: l.preco,
      imagem_url: l.imagem_url,
      link_afiliado: l.link_afiliado,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const handle = extrairHandle((await params).handle);
  if (!handle) return { title: "Vitrine não encontrada" };
  const dados = await carregar(handle);
  if (!dados) return { title: "Vitrine não encontrada" };

  const titulo = `Promoções da ${dados.nome}`;
  return {
    title: titulo,
    description: `As promoções da Shopee que a ${dados.nome} separou. Toque e compre com o desconto.`,
    openGraph: { title: titulo, type: "website" },
    robots:
      dados.itens.length === 0
        ? { index: false, follow: true }
        : { index: true, follow: true },
    alternates: { canonical: `/@${dados.handle}` },
  };
}

export default async function VitrinePublicaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const handle = extrairHandle((await params).handle);
  if (!handle) notFound();

  const dados = await carregar(handle);
  if (!dados) notFound();

  return (
    <div className="flex flex-1 flex-col">
      {dados.itens.length > 0 && (
        <DadosEstruturados
          dados={vitrineDaAfiliada({
            nome: dados.nome,
            handle: dados.handle,
            itens: dados.itens,
          })}
        />
      )}
      <header className="border-b border-black/[0.06] bg-superficie">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 text-center">
          <h1 className="fonte-display text-3xl text-tinta sm:text-4xl">
            {dados.nome}
          </h1>
          <p className="mt-1 text-sm text-tinta-fraca">@{dados.handle}</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-tinta-fraca text-pretty">
            As promoções da Shopee que eu separei pra você. Toque no produto e
            compre com o desconto.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {dados.itens.length === 0 ? (
          <p className="py-20 text-center text-sm text-tinta-fraca">
            Ainda não tem promoção aqui. Volte em breve!
          </p>
        ) : (
          <VitrinePublicaClient itens={dados.itens} />
        )}
      </main>

      <footer className="border-t border-black/[0.06] py-6">
        <a
          href="/"
          className="mx-auto flex w-fit items-center gap-2 text-xs text-tinta-fraca transition-colors hover:text-tinta"
        >
          <span>feito com</span>
          <Marca simbolo={18} texto="text-xs" />
        </a>
      </footer>
    </div>
  );
}
