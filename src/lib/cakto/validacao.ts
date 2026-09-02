import { timingSafeEqual } from "node:crypto";
import type { CaktoWebhookPayload } from "./tipos";

/**
 * A Cakto autentica o webhook com um `secret` no corpo (não HMAC, não header).
 * Comparação em tempo constante pra não vazar o segredo por timing.
 */
export function segredoConfere(recebido: unknown, esperado: string): boolean {
  if (typeof recebido !== "string" || recebido.length === 0) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Estrutura mínima comum a todo evento: `secret`, `event` e `data.id`. Não é
 * segurança, é evitar processar lixo se a Cakto mudar o esquema.
 *
 * O e-mail do comprador NÃO entra aqui de propósito: eventos como `refund` só
 * precisam do `data.id` pra achar a compra, e exigir `customer.email` faria o
 * reembolso ser rejeitado. Quem precisa do e-mail (a compra aprovada) checa
 * com `temEmailComprador`.
 */
export function validarPayloadCakto(
  payload: unknown,
): payload is CaktoWebhookPayload {
  if (typeof payload !== "object" || !payload) return false;
  const p = payload as Record<string, unknown>;

  if (typeof p.secret !== "string" || typeof p.event !== "string") return false;
  if (typeof p.data !== "object" || !p.data) return false;

  const data = p.data as Record<string, unknown>;
  return typeof data.id === "string";
}

/** A compra aprovada precisa do e-mail pra criar o usuário. */
export function temEmailComprador(payload: CaktoWebhookPayload): boolean {
  const email = payload.data.customer?.email;
  return typeof email === "string" && email.includes("@");
}
