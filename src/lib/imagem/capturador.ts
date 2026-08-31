/**
 * Renders a DOM element to PNG and returns the Blob.
 *
 * html2canvas captures by rendering the DOM onto a canvas. The key gotcha
 * is fonts: if they're not fully loaded when canvas.toBlob() is called, the
 * text will render in a system fallback. So this waits for document.fonts.ready.
 *
 * Images inside the canvas _must_ be same-origin or CORS-enabled, otherwise
 * the canvas becomes "tainted" and toBlob() throws. O CDN da Shopee responde
 * com `access-control-allow-origin: *` (verificado), entao da pra capturar
 * direto da origem — nao ha re-hospedagem no Storage. Pra isso valer, toda
 * <img> que carrega a mesma URL precisa de crossOrigin="anonymous", senao o
 * browser reaproveita uma resposta cacheada sem CORS e contamina o canvas.
 */

import html2canvas from "html2canvas";

export async function capturarImagem(
  elemento: HTMLElement,
  opcoes?: {
    escala?: number;
  },
): Promise<Blob> {
  // Aguarda que todas as Web Fonts estejam carregadas.
  // Se isso timeout, capturará com fallback (não-ideal, mas não falha).
  try {
    await Promise.race([document.fonts.ready, new Promise((_, r) => setTimeout(r, 5000))]);
  } catch {
    // Timeout é ok, vamos capturar mesmo assim.
  }

  const canvas = await html2canvas(elemento, {
    // Os templates ja sao desenhados em 1080px, a resolucao nativa de Feed e
    // Story. Dobrar pra 2160 so quadruplicava o arquivo (3,5 MB por imagem)
    // sem ganho visivel — peso ruim pra quem posta pelo celular.
    scale: opcoes?.escala ?? 1,
    logging: false,
    useCORS: true, // O CDN da Shopee manda access-control-allow-origin: *
    backgroundColor: "#ffffff", // Fallback caso o bg seja transparent
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("canvas.toBlob() retornou null"));
        else resolve(blob);
      },
      "image/png",
      0.95, // Qualidade (irrelevante pra PNG, mas aceita como arg)
    );
  });
}

/**
 * Abre a folha nativa de compartilhar com o PNG (Instagram, TikTok, WhatsApp,
 * Pinterest, o que tiver instalado). Cai pro download comum se o browser nao
 * suportar share de arquivo, ou se o share falhar por qualquer motivo que nao
 * seja o usuario ter fechado a folha (ativacao expirada, etc.) — nunca estoura
 * o erro na cara do usuario, so entrega o arquivo do jeito que der.
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

  // Da tempo do browser comecar a baixar antes de soltar o blob.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
