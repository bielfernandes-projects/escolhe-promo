import "server-only";

/**
 * Limite de tentativas por chave (ex.: e-mail de login), em memoria.
 *
 * ponytail: em memoria por instancia — nao compartilha estado entre
 * instancias/regioes do Vercel nem sobrevive a cold start. Sobe a barra bem
 * acima de "sem limite nenhum" pro caso comum (uma instancia quente
 * respondendo a maior parte do trafego), mas nao e uma defesa distribuida de
 * verdade. Upgrade quando importar: trocar por um contador no Postgres
 * (Supabase, ja e dependencia) ou Upstash Redis.
 */
const tentativas = new Map<string, { contagem: number; expiraEm: number }>();

export function excedeuLimite(
  chave: string,
  maximo = 5,
  janelaMs = 5 * 60 * 1000,
): boolean {
  const agora = Date.now();
  const registro = tentativas.get(chave);

  if (!registro || registro.expiraEm < agora) {
    tentativas.set(chave, { contagem: 1, expiraEm: agora + janelaMs });
    return false;
  }

  registro.contagem++;
  return registro.contagem > maximo;
}
