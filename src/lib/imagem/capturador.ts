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
 * Entrega o PNG pro usuario.
 *
 * Duas armadilhas que so aparecem rodando de verdade:
 *
 * 1. `navigator.share` exige ativacao do usuario ainda valida. A captura do
 *    html2canvas leva alguns segundos, e nesse meio tempo a ativacao do clique
 *    expira — o share entao falha com NotAllowedError ("Permission denied").
 *    Por isso o share e uma tentativa, nao um caminho sem volta: se falhar,
 *    cai no download comum em vez de estourar o erro na cara do usuario.
 * 2. Revogar o object URL no mesmo tick do clique cancela o download em alguns
 *    browsers. A revogacao fica pra depois.
 */
export async function download(blob: Blob, nomeArquivo: string): Promise<void> {
  const arquivo = new File([blob], nomeArquivo, { type: "image/png" });

  // So no iOS. No desktop o share abre a janela nativa do sistema, que fica
  // pendurada esperando o usuario e trava o botao em "Gerando..." — ali um
  // download comum e o que a pessoa espera de um botao "Baixar imagem".
  if (ehIOS() && navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo] });
      return;
    } catch (erro) {
      // Usuario fechou a folha de compartilhar: nao e falha, nao insiste.
      if (erro instanceof DOMException && erro.name === "AbortError") return;
      // Qualquer outro caso (ativacao expirada, share indisponivel de fato):
      // segue pro download comum abaixo.
    }
  }

  baixarViaLink(blob, nomeArquivo);
}

/** iPadOS 13+ se apresenta como Mac; maxTouchPoints desambigua. */
function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
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
