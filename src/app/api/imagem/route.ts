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
import { createClient } from "@/lib/supabase/server";
import { imagemPermitida } from "@/lib/seguranca/urls";
import { excedeuLimite } from "@/lib/seguranca/limite-tentativas";

/**
 * Gera a imagem de divulgação (Feed/Story) via satori/next-og — renderização
 * determinística, ao contrário do html2canvas, que embaralhava o texto com
 * fonte custom. O cliente manda os dados do produto e, opcionalmente, uma foto
 * própria (data URI); nada é gravado.
 *
 * Segurança: a rota busca uma URL que vem do corpo, então sem trava ela seria
 * um SSRF aberto (qualquer um na internet fazendo nosso servidor buscar
 * qualquer endereço) e um dreno de CPU. Por isso, nesta ordem: exige sessão,
 * limita por usuário, e só aceita imagem de host conhecido.
 */
export const runtime = "nodejs";

/** Uma foto de celular cabe folgada; acima disso é abuso de memória. */
const FOTO_MAX_BYTES = 8 * 1024 * 1024;
/** Teto de bytes que aceitamos baixar de um host permitido. */
const IMAGEM_MAX_BYTES = 12 * 1024 * 1024;

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
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(10_000),
    redirect: "error",
  });
  if (!res.ok) throw new Error(`${oQue}: HTTP ${res.status}`);

  const tipo = res.headers.get("content-type") ?? "image/jpeg";
  if (!tipo.startsWith("image/")) throw new Error(`${oQue}: não é imagem`);

  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > IMAGEM_MAX_BYTES) throw new Error(`${oQue}: grande demais`);

  return `data:${tipo};base64,${Buffer.from(bytes).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  // 1. Só quem tem acesso ao app gera imagem. Sem isso a rota é um SSRF
  //    anônimo e um gerador de custo de CPU aberto pra internet inteira.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("não autorizado", { status: 401 });

  // 2. Mesmo autenticada, ninguém precisa de 60 imagens por minuto.
  if (excedeuLimite(`imagem:${user.id}`, 60, 60_000)) {
    return new Response("muitas imagens seguidas, aguarde", { status: 429 });
  }

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
  if (typeof corpo.produto.nome !== "string" || corpo.produto.nome.length > 300) {
    return new Response("nome inválido", { status: 400 });
  }
  if (typeof corpo.produto.preco !== "number" || !Number.isFinite(corpo.produto.preco)) {
    return new Response("preço inválido", { status: 400 });
  }

  // 3. A foto própria vem do FileReader do browser: exige data URI de imagem
  //    e limita o tamanho, senão vira memória sem teto no servidor.
  if (corpo.foto) {
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(corpo.foto)) {
      return new Response("foto inválida", { status: 400 });
    }
    if (corpo.foto.length * 0.75 > FOTO_MAX_BYTES) {
      return new Response("foto grande demais", { status: 413 });
    }
  }

  // 4. A trava do SSRF: sem foto própria vamos BUSCAR a `imagemUrl`, então ela
  //    precisa ser https e de um host conhecido (CDN da Shopee / nosso Storage).
  if (!corpo.foto && !imagemPermitida(corpo.imagemUrl!)) {
    return new Response("imagem de origem não permitida", { status: 400 });
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
    // Detalhe do erro vai pro log, não pro cliente: a mensagem podia contar
    // o que o servidor alcança na rede.
    console.error("[api/imagem] falhou:", erro);
    return new Response("falha ao gerar imagem", { status: 500 });
  }
}
