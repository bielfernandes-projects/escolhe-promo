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

/**
 * Teto de chaves distintas guardadas.
 *
 * Sem isto o Map so crescia: cada e-mail novo numa tentativa de login criava
 * uma entrada que nunca era removida, entao bastava um script mandando e-mails
 * aleatorios pra estourar a memoria da instancia e derrubar o app. Agora as
 * entradas vencidas sao varridas, e se ainda assim passar do teto, o Map inteiro
 * e zerado (perder a contagem por um instante e melhor que ficar sem memoria).
 */
const MAX_CHAVES = 10_000;

function limpar(agora: number) {
  for (const [chave, registro] of tentativas) {
    if (registro.expiraEm < agora) tentativas.delete(chave);
  }
  if (tentativas.size > MAX_CHAVES) tentativas.clear();
}

export function excedeuLimite(
  chave: string,
  maximo = 5,
  janelaMs = 5 * 60 * 1000,
): boolean {
  const agora = Date.now();
  const registro = tentativas.get(chave);

  if (!registro || registro.expiraEm < agora) {
    // Varre so quando o Map ja tem tamanho pra justificar o custo.
    if (tentativas.size > 500) limpar(agora);
    tentativas.set(chave, { contagem: 1, expiraEm: agora + janelaMs });
    return false;
  }

  registro.contagem++;
  return registro.contagem > maximo;
}
