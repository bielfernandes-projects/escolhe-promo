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
 * Checagem de estrutura — não é segurança, é evitar gravar estado quebrado
 * se a Cakto mudar o esquema.
 */
export function validarPayloadCakto(
  payload: unknown,
): payload is CaktoWebhookPayload {
  if (typeof payload !== "object" || !payload) return false;
  const p = payload as Record<string, unknown>;

  if (typeof p.secret !== "string" || typeof p.event !== "string") return false;
  if (typeof p.data !== "object" || !p.data) return false;

  const data = p.data as Record<string, unknown>;
  if (typeof data.id !== "string") return false;

  const customer = data.customer as Record<string, unknown> | undefined;
  return (
    typeof customer === "object" &&
    !!customer &&
    typeof customer.email === "string" &&
    customer.email.includes("@")
  );
}
