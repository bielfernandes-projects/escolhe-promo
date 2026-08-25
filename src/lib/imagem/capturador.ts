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
    scale: opcoes?.escala ?? 2, // Dobro da resolução pra crispness em altas DPI
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
 * Downloads a blob to the user's device with a given filename.
 * Falls back to navigator.share on iOS (PWA) when available.
 */
export async function download(blob: Blob, nomeArquivo: string): Promise<void> {
  // Em um PWA no iOS, download programático não funciona confiável.
  // navigator.share abre o native sheet (compartilhar, salvar, etc.).
  if (navigator.share && navigator.canShare?.({ files: [new File([blob], nomeArquivo)] })) {
    await navigator.share({
      files: [new File([blob], nomeArquivo)],
    });
    return;
  }

  // Fallback: abra a imagem numa aba nova — usuário salva via long-press no mobile.
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;

  try {
    // Trigger download em desktops.
    document.body.appendChild(link);
    link.click();
  } finally {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
