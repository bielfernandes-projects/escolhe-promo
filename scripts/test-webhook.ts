/**
 * Simula um webhook de compra da Cakto.
 * Usa o secret real do .env.local pra gerar assinatura HMAC válida.
 *
 * Run: npx tsx scripts/test-webhook.ts
 */
process.loadEnvFile(".env.local");

import { createHmac } from "node:crypto";

const SECRET = process.env.CAKTO_WEBHOOK_SECRET;
const WEBHOOK_URL = "http://localhost:3000/api/webhooks/cakto";

if (!SECRET) {
  console.error("CAKTO_WEBHOOK_SECRET não configurado");
  process.exit(1);
}

// Payload simulado de uma compra (Lifetime Deal + e-book Turbinar)
const payload = {
  id: "evt_test_123",
  event: "purchase.completed",
  created_at: Math.floor(Date.now() / 1000),
  data: {
    order_id: "order_test_123",
    customer_email: "teste@example.com",
    customer_name: "Testador",
    total_price: 74.0, // 47 (lifetime) + 27 (ebook)
    currency: "BRL",
    items: [
      {
        id: "item_1",
        name: "Lifetime Deal",
        sku: "lifetime-deal",
        price: 47.0,
        quantity: 1,
      },
      {
        id: "item_2",
        name: "E-book Turbinar",
        sku: "ebook-turbinar",
        price: 27.0,
        quantity: 1,
      },
    ],
  },
};

const corpo = JSON.stringify(payload);
const assinatura = createHmac("sha256", SECRET).update(corpo).digest("hex");

console.log(`Enviando webhook simulado pra ${WEBHOOK_URL}\n`);
console.log(`Payload: ${JSON.stringify(payload, null, 2)}\n`);
console.log(`Assinatura: ${assinatura}\n`);

fetch(WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-cakto-signature": assinatura,
  },
  body: corpo,
})
  .then((res) => {
    console.log(`Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    console.log(`Resposta:`, data);
  })
  .catch((err) => {
    console.error("Erro:", err);
  });
