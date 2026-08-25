import { NextResponse, type NextRequest } from "next/server";
import { fetchProdutos } from "@/lib/shopee/products";
import { salvarProdutos } from "@/lib/produtos/repositorio";

/** Sincronizar 200 produtos leva mais que o padrao de rota comum. */
export const maxDuration = 300;

/**
 * Job diario do catalogo: puxa da Shopee e regrava a tabela `produtos`.
 *
 * E a unica escrita na Vitrine. Roda pelo Vercel Cron (que manda o header
 * Authorization com o CRON_SECRET) e tambem pode ser disparado a mao via curl
 * pra popular a tabela na primeira vez.
 */
export async function GET(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;

  if (!segredo) {
    return NextResponse.json(
      { erro: "CRON_SECRET nao configurado" },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: "nao autorizado" }, { status: 401 });
  }

  const comecou = Date.now();

  try {
    const produtos = await fetchProdutos({ limit: 200 });
    const gravados = await salvarProdutos(produtos);

    console.log(`[cron/sync-produtos] ${gravados} produtos gravados`);

    return NextResponse.json({
      ok: true,
      gravados,
      segundos: Math.round((Date.now() - comecou) / 1000),
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "erro desconhecido";
    console.error("[cron/sync-produtos] falhou:", mensagem);
    return NextResponse.json({ ok: false, erro: mensagem }, { status: 500 });
  }
}
