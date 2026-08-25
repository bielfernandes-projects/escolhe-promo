/**
 * Prints sample copies so the phrasing can be eyeballed before it ships, and
 * checks that consecutive generations never repeat a slot.
 *
 * Run: npx tsx scripts/test-copy.ts
 */
import { criarGeradorDeCopy, totalCombinacoes } from "../src/lib/copy/gerador";

const produto = {
  nome: "Vídeo Game Portátil Retrô 400 Jogos Tela IPS 3.5 64GB Console Emulador Clássico KP-GX02",
  preco: 119.28,
  vendas: 13,
  avaliacao: 3.2,
};

const link = "https://s.shopee.com.br/6L3vHFc4Ak";

console.log(
  `Combinações possíveis: ${totalCombinacoes().toLocaleString("pt-BR")}\n`,
);

for (const canal of ["whatsapp", "instagram"] as const) {
  console.log(`${"=".repeat(58)}\n${canal.toUpperCase()}\n${"=".repeat(58)}`);
  const gerador = criarGeradorDeCopy();
  for (let i = 0; i < 2; i++) {
    console.log(gerador.proxima(produto, { canal, linkAfiliado: link }));
    console.log("-".repeat(58));
  }
}

// Simula o usuário clicando "gerar outra" repetidamente.
console.log("\nVerificando repetição em 500 gerações seguidas...");
const gerador = criarGeradorDeCopy();
let anterior = "";
let repeticoesDeLinha = 0;

for (let i = 0; i < 500; i++) {
  const atual = gerador.proxima(produto, {
    canal: "whatsapp",
    linkAfiliado: link,
  });
  if (anterior) {
    const linhasAnteriores = new Set(anterior.split("\n\n"));
    for (const linha of atual.split("\n\n")) {
      if (linhasAnteriores.has(linha)) repeticoesDeLinha++;
    }
  }
  anterior = atual;
}

console.log(
  repeticoesDeLinha === 0
    ? "OK — nenhum slot repetiu em relação à geração anterior."
    : `FALHA — ${repeticoesDeLinha} repetições consecutivas.`,
);
