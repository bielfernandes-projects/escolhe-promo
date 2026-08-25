/**
 * Probe the Shopee Affiliate Open API to answer the open question in PLAN.md:
 * does `productOfferV2` expose a category/nicho field for authenticated
 * accounts? If it does, the keyword-based Nicho tagger is unnecessary.
 *
 * Run: npx tsx scripts/test-shopee-api.ts
 */
import { createHash } from "node:crypto";

process.loadEnvFile(".env.local");

const APP_ID = process.env.SHOPEE_AFFILIATE_APP_ID;
const APP_SECRET = process.env.SHOPEE_AFFILIATE_APP_SECRET;
const GRAPHQL_URL = "https://open-api.affiliate.shopee.com.br/graphql";

if (!APP_ID || !APP_SECRET) {
  console.error(
    "Faltam SHOPEE_AFFILIATE_APP_ID / SHOPEE_AFFILIATE_APP_SECRET em .env.local",
  );
  process.exit(1);
}

/**
 * Shopee signs each request as SHA256(appId + timestamp + payload + secret),
 * sent as `Authorization: SHA256 Credential=..., Timestamp=..., Signature=...`.
 * The timestamp is Unix seconds and the payload is the exact JSON body sent.
 */
async function callShopee(query: string) {
  const payload = JSON.stringify({ query });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha256")
    .update(`${APP_ID}${timestamp}${payload}${APP_SECRET}`)
    .digest("hex");

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`,
    },
    body: payload,
  });

  return response.json() as Promise<{
    data?: Record<string, unknown>;
    errors?: Array<{ message: string }>;
  }>;
}

/** Lists every field the API exposes on a product node, via introspection. */
const INTROSPECTION_QUERY = `
  query {
    __type(name: "ProductOfferV2") {
      fields { name type { name kind ofType { name } } }
    }
  }
`;

/** Falls back to a plain fetch when introspection is disabled. */
const SAMPLE_QUERY = `
  query {
    productOfferV2(limit: 3) {
      nodes {
        itemId
        productName
        imageUrl
        priceMin
        commissionRate
        sales
        ratingStar
        productLink
        offerLink
      }
    }
  }
`;

async function main() {
  console.log("→ Tentando introspection do tipo ProductOfferV2...\n");
  const introspection = await callShopee(INTROSPECTION_QUERY);

  const fields = (
    introspection.data?.__type as { fields?: Array<{ name: string }> } | null
  )?.fields;

  if (fields?.length) {
    const names = fields.map((f) => f.name);
    console.log(`Campos expostos (${names.length}):`);
    console.log(names.join(", "));

    const categoryFields = names.filter((n) => /categor|nich/i.test(n));
    console.log(
      "\nRESULTADO:",
      categoryFields.length
        ? `API EXPÕE categoria → ${categoryFields.join(", ")} (tagueador por palavra-chave é desnecessário)`
        : "API NÃO expõe categoria → manter o tagueador de Nicho por palavra-chave",
    );
    return;
  }

  if (introspection.errors) {
    console.log("Introspection indisponível:", introspection.errors[0]?.message);
  }

  console.log("\n→ Buscando produtos de amostra...\n");
  const sample = await callShopee(SAMPLE_QUERY);

  if (sample.errors) {
    console.error("Erro:", sample.errors);
    return;
  }

  const nodes = (
    sample.data?.productOfferV2 as { nodes?: Array<Record<string, unknown>> }
  )?.nodes;

  console.log(JSON.stringify(nodes?.[0] ?? sample.data, null, 2));
}

main().catch((error) => {
  console.error("Falha inesperada:", error);
  process.exit(1);
});
