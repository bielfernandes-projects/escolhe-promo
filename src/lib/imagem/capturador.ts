/**
 * Entrega o PNG gerado pela rota /api/imagem: pede a imagem, e depois
 * compartilha (folha nativa → WhatsApp/Instagram) ou baixa.
 */

export type PedidoImagem = {
  template: string;
  produto: { nome: string; preco: number };
  imagemUrl?: string;
  /** data URI de uma foto do usuário. */
  foto?: string;
};

export async function gerarImagem(pedido: PedidoImagem): Promise<Blob> {
  const res = await fetch("/api/imagem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return res.blob();
}

/**
 * Abre a folha nativa de compartilhar com o PNG (Instagram, WhatsApp, o que
 * tiver). Cai pro download comum se o browser nao suportar share de arquivo,
 * ou se o share falhar por qualquer motivo que nao seja o usuario fechar a
 * folha. Nunca estoura o erro na cara do usuario.
 */
export async function compartilharImagem(
  blob: Blob,
  nomeArquivo: string,
  legenda?: string,
): Promise<void> {
  const arquivo = new File([blob], nomeArquivo, { type: "image/png" });

  if (!navigator.canShare?.({ files: [arquivo] })) {
    baixarViaLink(blob, nomeArquivo);
    return;
  }

  try {
    await navigator.share({
      files: [arquivo],
      ...(legenda ? { text: legenda } : {}),
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") return;
    baixarViaLink(blob, nomeArquivo);
  }
}

/** Download direto, sem tentar share — o que um botao "Baixar" deve fazer. */
export async function baixarImagem(blob: Blob, nomeArquivo: string): Promise<void> {
  baixarViaLink(blob, nomeArquivo);
}

function baixarViaLink(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.rel = "noopener";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
