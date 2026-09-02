import { describe, it, expect } from "vitest";
import {
  segredoConfere,
  validarPayloadCakto,
  temEmailComprador,
} from "../validacao";

const SECRET = "ef9da319-dceb-41ac-905d-8cc8479368f9";

const payloadValido = {
  secret: SECRET,
  event: "purchase_approved",
  data: {
    id: "87956abe-940e-4e8b-8a27-82c482920f64",
    baseAmount: 47,
    customer: { name: "John Doe", email: "john.doe@example.com" },
    product: { id: "ff3", name: "Escolhe Promo" },
  },
};

describe("segredoConfere", () => {
  it("aceita o segredo certo", () => {
    expect(segredoConfere(SECRET, SECRET)).toBe(true);
  });

  it("rejeita segredo errado (mesmo tamanho)", () => {
    expect(segredoConfere("ef9da319-dceb-41ac-905d-8cc8479368f0", SECRET)).toBe(false);
  });

  it("rejeita vazio, null, undefined e não-string", () => {
    expect(segredoConfere("", SECRET)).toBe(false);
    expect(segredoConfere(null, SECRET)).toBe(false);
    expect(segredoConfere(undefined, SECRET)).toBe(false);
    expect(segredoConfere(42, SECRET)).toBe(false);
  });
});

describe("validarPayloadCakto", () => {
  it("aceita o payload real da Cakto", () => {
    expect(validarPayloadCakto(payloadValido)).toBe(true);
  });

  it("aceita evento sem customer (ex: refund só com data.id)", () => {
    const refund = { secret: SECRET, event: "refund", data: { id: "ord_1" } };
    expect(validarPayloadCakto(refund)).toBe(true);
  });

  it("rejeita sem data.id", () => {
    const { id, ...semId } = payloadValido.data;
    void id;
    expect(validarPayloadCakto({ ...payloadValido, data: semId })).toBe(false);
  });

  it("rejeita sem secret", () => {
    const { secret, ...semSecret } = payloadValido;
    void secret;
    expect(validarPayloadCakto(semSecret)).toBe(false);
  });

  it("rejeita null, string e número", () => {
    expect(validarPayloadCakto(null)).toBe(false);
    expect(validarPayloadCakto("string")).toBe(false);
    expect(validarPayloadCakto(42)).toBe(false);
  });
});

describe("temEmailComprador", () => {
  it("true quando tem e-mail válido", () => {
    expect(temEmailComprador(payloadValido)).toBe(true);
  });

  it("false sem customer ou sem e-mail", () => {
    expect(temEmailComprador({ ...payloadValido, data: { id: "x" } })).toBe(false);
    expect(
      temEmailComprador({ ...payloadValido, data: { id: "x", customer: { name: "J" } } }),
    ).toBe(false);
  });
});
