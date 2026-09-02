import "server-only";

import type { Produto } from "@/lib/produtos/tipos";
import { precoDe } from "@/lib/produtos/tipos";
import { hashtagsDoNicho } from "./hashtags";

/**
 * Legenda de post de Instagram — texto corrido, mais longo que a copy de
 * WhatsApp, terminando em CTA e hashtags do Nicho.
 *
 * Escrita por um LLM via OpenRouter. O custo fica sob controle porque a legenda
 * é **por Produto, não por clique**: a primeira pessoa que pedir a legenda de um
 * produto paga a geração, e ela fica no banco servindo todo mundo naquele dia
 * (ver `legendaDoProduto` em src/app/app/vitrine/acoes.ts).
 *
 * Se a IA falhar — e nos modelos gratuitos ela falha com frequência, o pool é
 * compartilhado e devolve 429 — cai no texto montado localmente, que nunca
 * falha. O usuário sempre recebe uma legenda.
 */

/**
 * Tentados em ordem. Os `:free` do OpenRouter dividem um pool entre todas as
 * contas e ficam indisponíveis sem aviso, então vale ter alternativas.
 */
const MODELOS = [
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3.5-lightning:free",
  "minimax/minimax-m2.7:free",
];

const TIMEOUT_MS = 25_000;

function moeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function instrucoes(produto: Produto): string {
  const de = precoDe(produto);
  const linhaDe = de ? `Preço antes da promoção: ${moeda(de)}.` : "";
  const social =
    produto.vendas > 500
      ? `${produto.vendas.toLocaleString("pt-BR")} pessoas já compraram. Nota ${produto.avaliacao.toFixed(1)} de 5.`
      : "";

  return `Escreva a legenda de um post de Instagram divulgando este achadinho da Shopee.

Produto: ${produto.nome}
Preço: ${moeda(produto.preco)}
${linhaDe}
Categoria: ${produto.nicho}
${social}

Regras:
- Português do Brasil, tom animado e informal, de quem indica um achado para amigas.
- 3 a 5 linhas curtas, separadas por quebra de linha, com emojis sem exagero.
- Cite um benefício concreto do produto no dia a dia.
- Termine com uma chamada para ação pedindo pra clicar no link da bio.
- NÃO invente característica que não esteja no nome do produto.
- NÃO escreva hashtags: elas são acrescentadas depois.
- Responda somente com a legenda, sem aspas e sem comentário seu.`;
}

async function chamarModelo(modelo: string, prompt: string): Promise<string | null> {
  const chave = process.env.OPENROUTER_API_KEY;
  if (!chave) return null;

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controle.signal,
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
        // O OpenRouter usa estes dois pra atribuir o tráfego ao app.
        "HTTP-Referer": "https://www.escolhepromo.com.br",
        "X-Title": "Escolhe Promo",
      },
      body: JSON.stringify({
        model: modelo,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.9,
      }),
    });

    if (!res.ok) return null;
    const corpo = (await res.json()) as {
      error?: { message?: string };
      choices?: { message?: { content?: string | null } }[];
    };
    if (corpo.error) return null;

    const texto = corpo.choices?.[0]?.message?.content?.trim();
    // Modelos gratuitos às vezes devolvem string vazia ou null com status 200.
    return texto && texto.length >= 40 ? texto : null;
  } catch {
    return null;
  } finally {
    clearTimeout(relogio);
  }
}

/** Texto montado localmente: sem custo, sem rede, nunca falha. */
function legendaLocal(produto: Produto): string {
  const de = precoDe(produto);
  const linhas = [
    `😍 Olha esse achadinho que eu encontrei!`,
    ``,
    `${produto.nome}`,
    de
      ? `De ${moeda(de)} por ${moeda(produto.preco)} 🤑`
      : `Por apenas ${moeda(produto.preco)} 🤑`,
  ];
  if (produto.vendas > 500) {
    linhas.push(
      `Já são ${produto.vendas.toLocaleString("pt-BR")} vendidos e nota ${produto.avaliacao.toFixed(1)} ⭐`,
    );
  }
  linhas.push(``, `Corre que é por tempo limitado 🏃‍♀️`, `👉 Link na bio!`);
  return linhas.join("\n");
}

export type ResultadoLegenda = { texto: string; viaIA: boolean };

/**
 * Monta a legenda completa (corpo + hashtags). Tenta os modelos em ordem e cai
 * no texto local se todos falharem.
 */
export async function gerarLegenda(produto: Produto): Promise<ResultadoLegenda> {
  const prompt = instrucoes(produto);
  const hashtags = hashtagsDoNicho(produto.nicho, produto.nome);

  for (const modelo of MODELOS) {
    const corpo = await chamarModelo(modelo, prompt);
    if (corpo) {
      // Alguns modelos escrevem hashtags mesmo proibidos; tira as deles pra não
      // duplicar com as nossas.
      const limpo = corpo
        .split("\n")
        .filter((l) => !/^\s*#\S/.test(l))
        .join("\n")
        .trim();
      return { texto: `${limpo}\n\n${hashtags}`, viaIA: true };
    }
  }

  return { texto: `${legendaLocal(produto)}\n\n${hashtags}`, viaIA: false };
}
