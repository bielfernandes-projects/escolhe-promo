import "server-only";
import { createHash } from "node:crypto";

/**
 * Dispara o evento de compra pro Meta via Conversions API (server-side).
 *
 * Precisa ser server-side porque o checkout acontece no dominio da Cakto:
 * o usuario nunca volta pro nosso site depois de pagar, entao nao existe uma
 * pagina "compra concluida" aqui pra disparar um pixel client-side. O evento
 * e enviado assim que o webhook da Cakto confirma o pagamento.
 *
 * Sem fbp/fbc (cookie do pixel) a correspondencia usa so o e-mail (hash
 * SHA-256, exigido pela API) — funciona, com taxa de match menor que a de um
 * fluxo com pixel completo.
 *
 * Fica em no-op sem META_PIXEL_ID/META_CONVERSIONS_API_TOKEN configurados —
 * assim o codigo ja existe e so precisa das env vars pra ligar.
 */
export async function dispararCompraMeta(dados: {
  email: string;
  valor: number;
  moeda: string;
  origem: string;
}): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !token) return;

  const emailHash = createHash("sha256")
    .update(dados.email.trim().toLowerCase())
    .digest("hex");

  try {
    const resposta = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: token,
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: dados.origem,
              user_data: { em: [emailHash] },
              custom_data: {
                value: dados.valor,
                currency: dados.moeda,
              },
            },
          ],
        }),
      },
    );

    if (!resposta.ok) {
      console.warn("[meta] Conversions API falhou:", await resposta.text());
    }
  } catch (erro) {
    // Nunca deve derrubar o webhook da Cakto por causa de metrica de anuncio.
    console.warn("[meta] Conversions API erro inesperado:", erro);
  }
}
