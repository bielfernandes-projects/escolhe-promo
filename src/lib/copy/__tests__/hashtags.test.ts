import { describe, it, expect } from "vitest";
import { hashtagsDoNicho } from "../hashtags";

describe("hashtagsDoNicho", () => {
  it("sempre inclui as hashtags base de achadinho", () => {
    const tags = hashtagsDoNicho("Cozinha", "Panela de pressão");
    expect(tags).toContain("#achadinhos");
    expect(tags).toContain("#shopee");
  });

  it("usa as hashtags do nicho", () => {
    expect(hashtagsDoNicho("Pet", "Comedouro para cães")).toContain("#petshop");
    expect(hashtagsDoNicho("Eletrônicos", "Fone bluetooth")).toContain("#tecnologia");
  });

  it("troca pras hashtags masculinas em produto de barba", () => {
    // O caso que motivou a separação: um barbeador vinha com #maquiagem.
    const tags = hashtagsDoNicho(
      "Beleza",
      "Maquina De Barbear e Aparador Pelos Elétrico 3 Em 1",
    );
    expect(tags).toContain("#barba");
    expect(tags).toContain("#cuidadomasculino");
    expect(tags).not.toContain("#maquiagem");
    expect(tags).not.toContain("#skincare");
  });

  it("mantém as femininas no restante de Beleza", () => {
    const tags = hashtagsDoNicho("Beleza", "Kit Skincare Ácido Hialurônico");
    expect(tags).toContain("#skincare");
    expect(tags).not.toContain("#barba");
  });

  it("só aplica a heurística masculina dentro de Beleza", () => {
    // "Homem" no nome de um produto de Casa não deve virar hashtag de barbearia.
    const tags = hashtagsDoNicho("Casa", "Chinelo Masculino Confortável");
    expect(tags).toContain("#casa");
    expect(tags).not.toContain("#barbearia");
  });
});
