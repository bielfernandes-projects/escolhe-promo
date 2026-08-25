import { createHmac } from "node:crypto";
import type { CaktoWebhookPayload } from "./tipos";

/**
 * Valida a assinatura do webhook da Cakto.
 *
 * Cakto envia um header `X-Cakto-Signature` com HMAC-SHA256 do corpo
 * (JSON em string order determinística). A verificação impede replay attacks
 * e garante que só o Cakto é capaz de disparar eventos.
 *
 * Documentação: https://docs.cakto.com.br/webhooks#verificacao-de-autenticidade
 */
export function validarAssinaturaCakto(
  corpo: string, // Raw body como recebido (string, não parsed)
  assinatura: string | null, // Header X-Cakto-Signature
  secret: string, // CAKTO_WEBHOOK_SECRET do .env
): boolean {
  if (!assinatura) {
    console.warn("[Cakto] Webhook sem X-Cakto-Signature header");
    return false;
  }

  const hash = createHmac("sha256", secret).update(corpo).digest("hex");
  const valida = hash === assinatura;

  if (!valida) {
    console.warn(
      `[Cakto] Assinatura inválida (esperava ${hash.slice(0, 12)}..., recebeu ${assinatura.slice(0, 12)}...)`,
    );
  }

  return valida;
}

/**
 * Valida o payload do webhook quanto a estrutura básica.
 * Não é segurança, é data integrity check — se o Cakto mudar seu esquema,
 * preferimos falhar cedo do que gravar um estado inválido.
 */
export function validarPayloadCakto(payload: unknown): payload is CaktoWebhookPayload {
  if (typeof payload !== "object" || !payload) return false;

  const p = payload as Record<string, unknown>;
  if (!p.data || typeof p.data !== "object") return false;

  const data = p.data as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.event === "string" &&
    typeof p.created_at === "number" &&
    typeof data.order_id === "string" &&
    typeof data.customer_email === "string" &&
    Array.isArray(data.items) &&
    data.items.length > 0
  );
}
