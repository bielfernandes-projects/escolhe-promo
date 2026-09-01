import { describe, it, expect } from "vitest";
import { chaveProduto, deduplicarProdutos } from "../dedupe";
import type { Produto } from "../tipos";

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

describe("dedupe da Vitrine", () => {
  it("colapsa a mesma listagem de vendedores diferentes", () => {
    const a = "Percarbonato 100% Puro Tira Manchas Roupas Brancas Calisul 1kg";
    const b = "PERCARBONATO 100% PURO Tira Manchas Roupas Brancas - Calisul";
    expect(chaveProduto(a)).toBe(chaveProduto(b));
  });

  it("mantem produtos de verdade distintos", () => {
    const a = chaveProduto("Balança Digital de Vidro até 180Kg Portátil");
    const b = chaveProduto("Kit Organizador de Gaveta com 4 Peças");
    expect(a).not.toBe(b);
  });

  it("guarda a primeira ocorrencia (maior comissao vem primeiro na query)", () => {
    const lista = [
      produto({ itemId: "1", nome: "Caneca Térmica Inox 500ml", comissao: 20 }),
      produto({ itemId: "2", nome: "caneca térmica, inox 500ml!", comissao: 5 }),
      produto({ itemId: "3", nome: "Tapete Antiderrapante", comissao: 8 }),
    ];
    const saida = deduplicarProdutos(lista);
    expect(saida.map((p) => p.itemId)).toEqual(["1", "3"]);
  });
});
