import { SLOTS, type Slot, type SlotId } from "./slots";

/**
 * Onde a copy vai ser colada. O WhatsApp renderiza *asteriscos* como negrito;
 * a legenda do Instagram não, então lá os marcadores viram pontuação solta e
 * precisam sumir.
 */
export type Canal = "whatsapp" | "instagram";

export type DadosCopy = {
  nome: string;
  preco: number;
  vendas?: number;
  avaliacao?: number;
  /** Percentual de desconto informado pela Shopee (0 a 100). */
  taxaDesconto?: number;
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
 * Títulos da Shopee são sopa de palavra-chave e, muito longos, dão cara de spam
 * na mensagem. O corte é no limite da palavra. O teto acomoda um nome completo
 * de verdade (o exemplo do dono tem 78 caracteres) e só apara os exagerados.
 */
function encurtarNome(nome: string, maximo = 90): string {
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

/**
 * Preço antes da promoção. A Shopee não devolve esse valor: manda o preço atual
 * e a % de desconto, então o "de" é reconstruído. Só existe quando ela informou
 * um desconto — o que acontece em ~87% dos produtos.
 */
function precoAntes(dados: DadosCopy): number | null {
  const taxa = dados.taxaDesconto ?? 0;
  if (taxa <= 0 || taxa >= 100) return null;
  const de = dados.preco / (1 - taxa / 100);
  // Diferença de centavos não merece uma linha "De:" na mensagem.
  return de - dados.preco >= 0.5 ? de : null;
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
    desconto: String(Math.round(dados.taxaDesconto ?? 0)),
    vendas: String(dados.vendas ?? 0),
    avaliacao: (dados.avaliacao ?? 0).toFixed(1),
    link,
  };

  const preenchido = modelo.replace(
    /\{(nome|preco|desconto|vendas|avaliacao|link)\}/g,
    (_, chave: string) => valores[chave],
  );

  return aplicarNegrito(preenchido, canal);
}

/** Which variation each slot contributed, so the next draw can avoid them. */
type Escolhas = Partial<Record<SlotId, string>>;

function sortear(slot: Slot, evitar: Escolhas, escolher: <T>(o: T[]) => T): string {
  // Drawing from everything except last time's pick is what makes a second
  // click feel like a new copy. With a single-variation slot there is
  // nothing else to draw, so the filter would empty the pool.
  const anterior = evitar[slot.id];
  const disponiveis =
    slot.variacoes.length > 1
      ? slot.variacoes.filter((v) => v !== anterior)
      : slot.variacoes;
  return escolher(disponiveis);
}

function slotPorId(id: SlotId): Slot {
  const s = SLOTS.find((x) => x.id === id);
  if (!s) throw new Error(`slot desconhecido: ${id}`);
  return s;
}

function montar(
  dados: DadosCopy,
  opcoes: OpcoesCopy,
  evitar: Escolhas,
): { texto: string; escolhas: Escolhas } {
  const { canal, linkAfiliado, escolher = escolhaAleatoria } = opcoes;
  const escolhas: Escolhas = {};

  const de = precoAntes(dados);
  // Sem percentual de desconto, a abertura não pode prometer "X% OFF".
  const idAbertura: SlotId = de ? "abertura" : "aberturaSemDesconto";

  const abertura = sortear(slotPorId(idAbertura), evitar, escolher);
  escolhas[idAbertura] = abertura;

  const fechamento = sortear(slotPorId("fechamento"), evitar, escolher);
  escolhas.fechamento = fechamento;

  const blocos: string[] = [
    preencher(abertura, dados, linkAfiliado, canal),
    preencher("{b}{nome}{/b}", dados, linkAfiliado, canal),
  ];

  if (de) {
    blocos.push(`🏷️ De: ${formatarPreco(de)}`);
    blocos.push(`💰 Por: ${formatarPreco(dados.preco)}`);
    blocos.push(`🎯 Desconto: ${Math.round(dados.taxaDesconto ?? 0)}%`);
  } else {
    blocos.push(`💰 Por: ${formatarPreco(dados.preco)}`);
  }

  blocos.push(`🔗 Link da oferta:\n${linkAfiliado}`);
  blocos.push(preencher(fechamento, dados, linkAfiliado, canal));

  return { texto: blocos.join("\n\n"), escolhas };
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
  const abertura = slotPorId("abertura").variacoes.length;
  const fechamento = slotPorId("fechamento").variacoes.length;
  return abertura * fechamento;
}
