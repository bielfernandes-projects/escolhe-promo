/**
 * Smoke-tests the Shopee integration end to end: signed request → parsed
 * products → resolved Nicho. Run after changing the client or the niche map.
 *
 * Run: npx tsx scripts/test-shopee-api.ts
 */
process.loadEnvFile(".env.local");

import { fetchProdutos } from "../src/lib/shopee/products";
import { NICHOS } from "../src/lib/shopee/niches";

async function main() {
  const produtos = await fetchProdutos({ limit: 200 });
  console.log(`${produtos.length} produtos carregados.\n`);

  const porNicho = new Map<string, number>();
  for (const p of produtos) {
    porNicho.set(p.nicho, (porNicho.get(p.nicho) ?? 0) + 1);
  }

  console.log("Distribuição por Nicho:");
  for (const nicho of NICHOS) {
    const count = porNicho.get(nicho) ?? 0;
    const bar = "#".repeat(Math.round((count / produtos.length) * 40));
    console.log(`  ${nicho.padEnd(18)} ${String(count).padStart(3)}  ${bar}`);
  }

  console.log("\nAmostra:");
  console.log(JSON.stringify(produtos[0], null, 2));

  const semImagem = produtos.filter((p) => !p.imagemUrl).length;
  const semLink = produtos.filter((p) => !p.offerLink).length;
  console.log(`\nIntegridade: ${semImagem} sem imagem, ${semLink} sem offerLink`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
