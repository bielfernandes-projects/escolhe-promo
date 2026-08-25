/**
 * Payload do webhook de compra da Cakto.
 *
 * Documentação: https://docs.cakto.com.br/webhooks
 * Evento: purchase_completed (Lifetime Deal + Order Bump)
 */

export type CaktoWebhookPayload = {
  /** Identificador único do evento no Cakto. */
  id: string;
  /** "purchase.completed" ou similar — sempre verificar. */
  event: string;
  /** Unix timestamp do evento. */
  created_at: number;
  /** Os dados da compra. */
  data: {
    /** ID da compra no Cakto. */
    order_id: string;
    /** E-mail do comprador — usado pra criar user no Supabase Auth. */
    customer_email: string;
    /** Nome do comprador (opcional). */
    customer_name?: string;
    /** Valor total pago. */
    total_price: number;
    /** Moeda: "BRL" pro Brasil. */
    currency: string;
    /** Items comprados: cada um tem um `sku` ou `product_id`. */
    items: Array<{
      id: string;
      name: string;
      sku?: string;
      product_id?: string;
      price: number;
      quantity: number;
    }>;
  };
};

/**
 * Detecta quais itens foram comprados.
 * Você vai preencher esses SKUs com os valores que o Cakto atribuiu
 * aos seus produtos (Lifetime Deal, e-book Turbinar, etc.).
 */
export const CAKTO_SKUS = {
  LIFETIME_DEAL: "lifetime-deal",
  EBOOK_TURBINAR: "ebook-turbinar",
} as const;

export function temLifetimeDeal(payload: CaktoWebhookPayload): boolean {
  return payload.data.items.some(
    (item) => item.sku === CAKTO_SKUS.LIFETIME_DEAL || item.product_id === CAKTO_SKUS.LIFETIME_DEAL,
  );
}

export function temOrderBump(payload: CaktoWebhookPayload): boolean {
  return payload.data.items.some(
    (item) => item.sku === CAKTO_SKUS.EBOOK_TURBINAR || item.product_id === CAKTO_SKUS.EBOOK_TURBINAR,
  );
}
