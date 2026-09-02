import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checarAcesso } from "../acesso";

type Linha = {
  reembolsada_em?: string | null;
  cakto_order_id?: string | null;
  trial_expira_em?: string | null;
};

/** Fake mínimo: só o encadeamento from().select().eq() que checarAcesso usa. */
function fakeSupabase(resultado: {
  data?: Linha[] | null;
  error?: { message: string } | null;
}): SupabaseClient {
  const linhas =
    resultado.data?.map((l) => ({
      reembolsada_em: l.reembolsada_em ?? null,
      cakto_order_id: l.cakto_order_id ?? null,
      trial_expira_em: l.trial_expira_em ?? null,
    })) ?? null;
  const query = {
    select: () => query,
    eq: () => Promise.resolve({ data: linhas, error: resultado.error ?? null }),
  };
  return { from: () => query } as unknown as SupabaseClient;
}

const futuro = new Date(Date.now() + 3 * 864e5).toISOString();
const passado = new Date(Date.now() - 864e5).toISOString();

describe("checarAcesso", () => {
  it("barra quem não tem linha nenhuma", async () => {
    expect(await checarAcesso(fakeSupabase({ data: [] }), "u1")).toEqual({
      ativo: false,
      motivo: "teste_expirado",
    });
  });

  it("libera compra paga ativa, sem faixa de teste", async () => {
    expect(
      await checarAcesso(
        fakeSupabase({ data: [{ cakto_order_id: "ord_1" }] }),
        "u1",
      ),
    ).toEqual({ ativo: true, trial: false, trialExpiraEm: null });
  });

  it("libera se ao menos uma compra paga segue ativa", async () => {
    const data = [
      { cakto_order_id: "ord_1", reembolsada_em: passado },
      { cakto_order_id: "ord_2" },
    ];
    expect(await checarAcesso(fakeSupabase({ data }), "u1")).toEqual({
      ativo: true,
      trial: false,
      trialExpiraEm: null,
    });
  });

  it("barra e diz 'reembolso' quando toda compra paga foi reembolsada", async () => {
    const data = [{ cakto_order_id: "ord_1", reembolsada_em: passado }];
    expect(await checarAcesso(fakeSupabase({ data }), "u1")).toEqual({
      ativo: false,
      motivo: "reembolso",
    });
  });

  it("libera teste em andamento e devolve a data de expiração", async () => {
    const data = [{ trial_expira_em: futuro }];
    expect(await checarAcesso(fakeSupabase({ data }), "u1")).toEqual({
      ativo: true,
      trial: true,
      trialExpiraEm: futuro,
    });
  });

  it("barra e diz 'teste_expirado' quando o teste já passou", async () => {
    const data = [{ trial_expira_em: passado }];
    expect(await checarAcesso(fakeSupabase({ data }), "u1")).toEqual({
      ativo: false,
      motivo: "teste_expirado",
    });
  });

  it("compra paga vence teste expirado (sem faixa)", async () => {
    const data = [{ trial_expira_em: passado }, { cakto_order_id: "ord_1" }];
    expect(await checarAcesso(fakeSupabase({ data }), "u1")).toEqual({
      ativo: true,
      trial: false,
      trialExpiraEm: null,
    });
  });

  it("fail-open: erro de banco não tranca quem pagou", async () => {
    expect(
      await checarAcesso(fakeSupabase({ error: { message: "timeout" } }), "u1"),
    ).toEqual({ ativo: true, trial: false, trialExpiraEm: null });
  });
});
