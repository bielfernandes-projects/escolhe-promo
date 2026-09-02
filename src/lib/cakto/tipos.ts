/**
 * Payload do webhook da Cakto.
 *
 * Formato real confirmado em https://docs.cakto.com.br/conceitos/webhooks
 * A Cakto NÃO assina o corpo com HMAC nem manda header de assinatura: a
 * autenticidade é o campo `secret` dentro do próprio corpo.
 */

export type CaktoWebhookPayload = {
  /** Chave secreta do webhook — comparar com CAKTO_WEBHOOK_SECRET. */
  secret: string;
  /** Ex.: "purchase_approved", "refund", "chargeback". */
  event: string;
  data: {
    /** ID da compra. Chave de idempotência (a Cakto reenvia até 5x). */
    id: string;
    refId?: string;
    status?: string;
    baseAmount?: number;
    checkoutUrl?: string;
    offer_type?: string;
    customer?: {
      name?: string;
      email?: string;
      docNumber?: string;
      docType?: string;
    };
    product?: {
      id: string;
      short_id?: string;
      name: string;
    };
    offer?: {
      id: string;
      name?: string;
      price?: number;
    };
    subscription?: unknown;
  };
};

/** O único evento que libera acesso. */
export const EVENTO_COMPRA_APROVADA = "purchase_approved";

/** Eventos que revogam o acesso (reembolso, contestação de cartão). */
export const EVENTOS_REEMBOLSO = ["refund", "chargeback"] as const;
