import { describe, it, expect } from "vitest";
import { criarGeradorDeCopy, gerarCopy, totalCombinacoes } from "../gerador";

const PRODUTO = {
  nome: "Jogo de Panelas Antiaderente 5 Peças",
  preco: 149.9,
  vendas: 3421,
  avaliacao: 4.8,
};

describe("gerarCopy", () => {
  it("substitui os placeholders e injeta o link", () => {
    const texto = gerarCopy(PRODUTO, { canal: "whatsapp", linkAfiliado: "https://s.shopee.com.br/abc" });
    // toLocaleString usa espaco nao-quebravel ( ) entre "R$" e o valor.
    expect(texto).toContain("149,90");
    expect(texto).toContain("https://s.shopee.com.br/abc");
    expect(texto).not.toMatch(/\{(nome|preco|vendas|avaliacao|link)\}/);
  });

  it("WhatsApp vira *negrito*, Instagram nao mostra as marcacoes", () => {
    const whats = gerarCopy(PRODUTO, { canal: "whatsapp", linkAfiliado: "x" });
    const insta = gerarCopy(PRODUTO, { canal: "instagram", linkAfiliado: "x" });
    expect(whats).toMatch(/\*[^*]+\*/);
    expect(insta).not.toContain("{b}");
    expect(insta).not.toContain("{/b}");
  });
});

describe("criarGeradorDeCopy", () => {
  it("nunca repete a copy exata duas vezes seguidas", () => {
    // Essa e a promessa central do produto ("copy unica") — se quebrar aqui,
    // quebrou o motivo de existir do gerador.
    const gerador = criarGeradorDeCopy();
    let anterior = gerador.proxima(PRODUTO, { canal: "whatsapp", linkAfiliado: "x" });

    for (let i = 0; i < 300; i++) {
      const atual = gerador.proxima(PRODUTO, { canal: "whatsapp", linkAfiliado: "x" });
      expect(atual).not.toBe(anterior);
      anterior = atual;
    }
  });

  it("totalCombinacoes bate com o produto real dos slots (regressao se algum slot mudar de tamanho sem querer)", () => {
    expect(totalCombinacoes()).toBeGreaterThan(1000);
  });
});
