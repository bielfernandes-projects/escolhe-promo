import { describe, it, expect } from "vitest";
import { precoDe } from "../tipos";
import type { Produto } from "../tipos";

/**
 * O "de" não vem pronto da Shopee: ela manda a % de desconto e o preço atual.
 * Estes testes prendem a regra de credibilidade — anunciar "de R$ 99,95 por
 * R$ 20,99" (o que a Shopee informa como -79%) faria quem posta parecer picareta.
 */
function produto(campos: Partial<Produto>): Produto {
  return {
    itemId: "1",
    nome: "Produto de teste",
    imagemUrl: "https://exemplo/foto.jpg",
    preco: 100,
    taxaComissao: 0.18,
    comissao: 18,
    vendas: 100,
    avaliacao: 4.8,
    taxaDesconto: 0,
    nicho: "Casa",
    offerLink: "#",
    produtoLink: "#",
    ...campos,
  };
}

describe("precoDe", () => {
  it("calcula o preço cheio a partir da taxa de desconto", () => {
    // 50 com 50% de desconto veio de 100.
    const de = precoDe(produto({ preco: 50, taxaDesconto: 50 }));
    expect(de).toBeCloseTo(100, 2);
  });

  it("devolve null quando não há desconto", () => {
    expect(precoDe(produto({ preco: 50, taxaDesconto: 0 }))).toBeNull();
  });

  it("omite o 'de' quando o desconto é grande demais pra ser crível", () => {
    // Caso real da API: R$ 20,99 com -79% daria "de R$ 99,95".
    expect(precoDe(produto({ preco: 20.99, taxaDesconto: 79 }))).toBeNull();
    expect(precoDe(produto({ preco: 175.99, taxaDesconto: 65 }))).toBeNull();
  });

  it("aceita descontos até o teto de 50%", () => {
    expect(precoDe(produto({ preco: 100, taxaDesconto: 50 }))).not.toBeNull();
    expect(precoDe(produto({ preco: 100, taxaDesconto: 51 }))).toBeNull();
  });

  it("omite quando a diferença é pequena demais pra valer a pena mostrar", () => {
    // 1% de desconto sobre R$ 10 muda o preço em centavos.
    expect(precoDe(produto({ preco: 10, taxaDesconto: 1 }))).toBeNull();
  });

  it("mantém o 'de' num desconto real e moderado", () => {
    // Caso real da API: R$ 27,92 com -22%.
    const de = precoDe(produto({ preco: 27.92, taxaDesconto: 22 }));
    expect(de).toBeCloseTo(35.79, 1);
  });
});
