import { SLOTS, type Slot, type SlotId } from "./slots";

/**
 * Where the copy is going to be pasted. WhatsApp renders *asterisks* as bold
 * and turns bare URLs into taps; Instagram captions do neither, so the same
 * markers there would show up as literal punctuation.
 */
export type Canal = "whatsapp" | "instagram";

export type DadosCopy = {
  nome: string;
  preco: number;
  vendas?: number;
  avaliacao?: number;
};

export type OpcoesCopy = {
  canal: Canal;
  /**
   * The affiliate's own link. Falls back to the app owner's offer link when the
   * user has not pasted one — that fallback is the Double-Dip.
   */
  linkAfiliado: string;
  /** Injectable for tests; defaults to a uniform random pick. */
  escolher?: <T>(opcoes: T[]) => T;
};

const escolhaAleatoria = <T>(opcoes: T[]): T =>
  opcoes[Math.floor(Math.random() * opcoes.length)];

function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Long product titles are Shopee's keyword soup; past ~60 characters they read
 * as spam in a WhatsApp message, so they are cut at a word boundary.
 */
function encurtarNome(nome: string, maximo = 60): string {
  if (nome.length <= maximo) return nome;
  const corte = nome.slice(0, maximo);
  const ultimoEspaco = corte.lastIndexOf(" ");
  return `${(ultimoEspaco > 30 ? corte.slice(0, ultimoEspaco) : corte).trimEnd()}...`;
}

function aplicarNegrito(texto: string, canal: Canal): string {
  return canal === "whatsapp"
    ? texto.replace(/\{b\}/g, "*").replace(/\{\/b\}/g, "*")
    : texto.replace(/\{b\}|\{\/b\}/g, "");
}

function preencher(
  modelo: string,
  dados: DadosCopy,
  link: string,
  canal: Canal,
): string {
  const valores: Record<string, string> = {
    nome: encurtarNome(dados.nome),
    preco: formatarPreco(dados.preco),
    vendas: String(dados.vendas ?? 0),
    avaliacao: (dados.avaliacao ?? 0).toFixed(1),
    link,
  };

  const preenchido = modelo.replace(
    /\{(nome|preco|vendas|avaliacao|link)\}/g,
    (_, chave: string) => valores[chave],
  );

  return aplicarNegrito(preenchido, canal);
}

/** Which variation each slot contributed, so the next draw can avoid them. */
type Escolhas = Partial<Record<SlotId, string>>;

function montar(
  dados: DadosCopy,
  opcoes: OpcoesCopy,
  evitar: Escolhas,
): { texto: string; escolhas: Escolhas } {
  const { canal, linkAfiliado, escolher = escolhaAleatoria } = opcoes;
  const escolhas: Escolhas = {};

  const partes = SLOTS.map((slot: Slot) => {
    // Drawing from everything except last time's pick is what makes a second
    // click feel like a new copy. With a single-variation slot there is
    // nothing else to draw, so the filter would empty the pool.
    const anterior = evitar[slot.id];
    const disponiveis =
      slot.variacoes.length > 1
        ? slot.variacoes.filter((v) => v !== anterior)
        : slot.variacoes;

    const variacao = escolher(disponiveis);
    escolhas[slot.id] = variacao;
    return preencher(variacao, dados, linkAfiliado, canal);
  });

  return { texto: partes.join("\n\n"), escolhas };
}

/**
 * Draws one variation per slot and assembles them into a ready-to-paste post.
 * Use this for one-shot generation; for a "gerar outra" button use
 * {@link criarGeradorDeCopy}, which will not repeat the previous phrasing.
 */
export function gerarCopy(dados: DadosCopy, opcoes: OpcoesCopy): string {
  return montar(dados, opcoes, {}).texto;
}

/**
 * A generator that remembers what it just produced, so consecutive calls never
 * reuse a slot's phrasing back to back. Without this, a slot with eight
 * variations repeats itself about one click in eight — enough to make the
 * "copy única" promise look broken.
 */
export function criarGeradorDeCopy() {
  let anteriores: Escolhas = {};

  return {
    proxima(dados: DadosCopy, opcoes: OpcoesCopy): string {
      const { texto, escolhas } = montar(dados, opcoes, anteriores);
      anteriores = escolhas;
      return texto;
    },
  };
}

/** How many distinct copies the current Template de Copy can produce. */
export function totalCombinacoes(): number {
  return SLOTS.reduce((total, slot) => total * slot.variacoes.length, 1);
}
