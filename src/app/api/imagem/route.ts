import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import {
  TEMPLATES,
  FONTES_DISPLAY,
  arquivoDaMoldura,
  renderTemplate,
  type FonteDisplay,
  type TemplateId,
} from "@/lib/imagem/templates";

/**
 * Gera a imagem de divulgação (Feed/Story) via satori/next-og — renderização
 * determinística, ao contrário do html2canvas, que embaralhava o texto com
 * fonte custom. O cliente manda os dados do produto e, opcionalmente, uma foto
 * própria (data URI); nada é gravado.
 */
export const runtime = "nodejs";

type Corpo = {
  template: TemplateId;
  produto: { nome: string; preco: number };
  /** URL da foto do produto (a Shopee libera CORS/hotlink). */
  imagemUrl?: string;
  /** data URI de uma foto que o usuário mandou — tem prioridade sobre imagemUrl. */
  foto?: string;
};

async function carregarFonte(req: NextRequest, arquivo: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(`/fonts/${arquivo}`, req.nextUrl.origin));
  if (!res.ok) throw new Error(`fonte ${arquivo}: HTTP ${res.status}`);
  return res.arrayBuffer();
}

/** O satori nao baixa imagem remota sozinho de forma confiavel — traz como data URI. */
async function comoDataUri(url: string, oQue = "imagem"): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${oQue}: HTTP ${res.status}`);
  const tipo = res.headers.get("content-type") ?? "image/jpeg";
  const b64 = Buffer.from(await res.arrayBuffer()).toString("base64");
  return `data:${tipo};base64,${b64}`;
}

export async function POST(req: NextRequest) {
  let corpo: Corpo;
  try {
    corpo = (await req.json()) as Corpo;
  } catch {
    return new Response("corpo inválido", { status: 400 });
  }

  const info = TEMPLATES[corpo.template];
  if (!info || !corpo.produto || (!corpo.foto && !corpo.imagemUrl)) {
    return new Response("parâmetros faltando", { status: 400 });
  }

  const caminhoArte = arquivoDaMoldura(corpo.template);

  const familias = Object.keys(FONTES_DISPLAY) as FonteDisplay[];

  try {
    const [display, inter600, inter700, foto, arte] = await Promise.all([
      Promise.all(familias.map((f) => carregarFonte(req, FONTES_DISPLAY[f]))),
      carregarFonte(req, "inter-600.woff"),
      carregarFonte(req, "inter-700.woff"),
      corpo.foto ?? comoDataUri(corpo.imagemUrl!, "foto do produto"),
      caminhoArte
        ? comoDataUri(new URL(caminhoArte, req.nextUrl.origin).toString(), "arte")
        : Promise.resolve(undefined),
    ]);

    return new ImageResponse(
      renderTemplate(
        corpo.template,
        { nome: corpo.produto.nome, preco: corpo.produto.preco },
        foto,
        arte,
      ),
      {
        width: info.largura,
        height: info.altura,
        fonts: [
          ...familias.map((f, i) => ({
            name: f,
            data: display[i],
            weight: 400 as const,
            style: "normal" as const,
          })),
          { name: "Inter", data: inter600, weight: 600, style: "normal" },
          { name: "Inter", data: inter700, weight: 700, style: "normal" },
        ],
      },
    );
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : "erro";
    return new Response(`falha ao gerar imagem: ${msg}`, { status: 500 });
  }
}
