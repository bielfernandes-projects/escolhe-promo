import { createHmac } from "node:crypto";
import { describe, it, expect } from "vitest";
import { validarAssinaturaCakto, validarPayloadCakto } from "../validacao";

const SECRET = "segredo-de-teste";

function assinar(corpo: string, secret = SECRET) {
  return createHmac("sha256", secret).update(corpo).digest("hex");
}

describe("validarAssinaturaCakto", () => {
  const corpo = JSON.stringify({ order_id: "123" });

  it("aceita uma assinatura HMAC valida", () => {
    expect(validarAssinaturaCakto(corpo, assinar(corpo), SECRET)).toBe(true);
  });

  it("rejeita assinatura de corpo diferente (corpo alterado em transito)", () => {
    const assinaturaDoOutroCorpo = assinar(JSON.stringify({ order_id: "999" }));
    expect(validarAssinaturaCakto(corpo, assinaturaDoOutroCorpo, SECRET)).toBe(false);
  });

  it("rejeita assinatura assinada com secret errado", () => {
    expect(validarAssinaturaCakto(corpo, assinar(corpo, "secret-errado"), SECRET)).toBe(false);
  });

  it("rejeita quando o header nao veio", () => {
    expect(validarAssinaturaCakto(corpo, null, SECRET)).toBe(false);
  });
});

describe("validarPayloadCakto", () => {
  const payloadValido = {
    id: "evt_1",
    event: "purchase.completed",
    created_at: 1700000000,
    data: {
      order_id: "123",
      customer_email: "a@b.com",
      total_price: 47,
      currency: "BRL",
      items: [{ id: "1", name: "x", price: 47, quantity: 1 }],
    },
  };

  it("aceita um payload valido", () => {
    expect(validarPayloadCakto(payloadValido)).toBe(true);
  });

  it("rejeita payload sem items (nada foi comprado, esquema quebrado)", () => {
    expect(
      validarPayloadCakto({ ...payloadValido, data: { ...payloadValido.data, items: [] } }),
    ).toBe(false);
  });

  it("rejeita payload sem customer_email", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- descartado de proposito
    const { customer_email, ...semEmail } = payloadValido.data;
    expect(validarPayloadCakto({ ...payloadValido, data: semEmail })).toBe(false);
  });

  it("rejeita null/undefined/tipos primitivos", () => {
    expect(validarPayloadCakto(null)).toBe(false);
    expect(validarPayloadCakto("string")).toBe(false);
    expect(validarPayloadCakto(42)).toBe(false);
  });
});
