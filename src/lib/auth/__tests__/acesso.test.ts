import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { temAcessoAtivo } from "../acesso";

/** Fake mínimo: só o encadeamento from().select().eq() que temAcessoAtivo usa. */
function fakeSupabase(resultado: {
  data?: Array<{ reembolsada_em: string | null }> | null;
  error?: { message: string } | null;
}): SupabaseClient {
  const query = {
    select: () => query,
    eq: () => Promise.resolve({ data: resultado.data ?? null, error: resultado.error ?? null }),
  };
  return { from: () => query } as unknown as SupabaseClient;
}

describe("temAcessoAtivo", () => {
  it("barra quem nunca comprou (auto-cadastro nao da acesso ao produto pago)", async () => {
    expect(await temAcessoAtivo(fakeSupabase({ data: [] }), "u1")).toBe(false);
  });

  it("libera com uma compra ativa", async () => {
    expect(
      await temAcessoAtivo(fakeSupabase({ data: [{ reembolsada_em: null }] }), "u1"),
    ).toBe(true);
  });

  it("libera se ao menos uma compra segue ativa", async () => {
    const data = [
      { reembolsada_em: "2026-01-01T00:00:00Z" },
      { reembolsada_em: null },
    ];
    expect(await temAcessoAtivo(fakeSupabase({ data }), "u1")).toBe(true);
  });

  it("barra quando todas as compras foram reembolsadas", async () => {
    const data = [{ reembolsada_em: "2026-01-01T00:00:00Z" }];
    expect(await temAcessoAtivo(fakeSupabase({ data }), "u1")).toBe(false);
  });

  it("fail-open: erro de banco não tranca quem pagou", async () => {
    expect(
      await temAcessoAtivo(fakeSupabase({ error: { message: "timeout" } }), "u1"),
    ).toBe(true);
  });
});
