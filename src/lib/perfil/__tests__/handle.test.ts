import { describe, it, expect } from "vitest";
import { normalizarHandle, validarHandle } from "../handle";

describe("normalizarHandle", () => {
  it("tira @, espaços, acentos e maiúsculas", () => {
    expect(normalizarHandle("  @Ana-Promos ")).toBe("ana-promos");
    expect(normalizarHandle("@Fulana")).toBe("fulana");
    expect(normalizarHandle("Maria João")).toBe("mariajoao");
  });

  it("descarta caracteres inválidos", () => {
    expect(normalizarHandle("ana.promos!")).toBe("anapromos");
    expect(normalizarHandle("nome_com_underline")).toBe("nomecomunderline");
  });
});

describe("validarHandle", () => {
  it("aceita um handle normal", () => {
    expect(validarHandle("ana-promos")).toEqual({ ok: true });
    expect(validarHandle("fulana123")).toEqual({ ok: true });
  });

  it("rejeita curto/longo demais", () => {
    expect(validarHandle("ab").ok).toBe(false);
    expect(validarHandle("a".repeat(31)).ok).toBe(false);
  });

  it("rejeita hífen no começo ou fim", () => {
    expect(validarHandle("-ana").ok).toBe(false);
    expect(validarHandle("ana-").ok).toBe(false);
  });

  it("rejeita palavras reservadas", () => {
    expect(validarHandle("app").ok).toBe(false);
    expect(validarHandle("login").ok).toBe(false);
    expect(validarHandle("api").ok).toBe(false);
  });
});
