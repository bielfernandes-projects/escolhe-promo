// Guarda de fronteira: este modulo fala com a API da Shopee usando o app
// secret e o node:crypto. Se algum client component voltar a importa-lo, o
// build quebra aqui em vez de falhar silenciosamente no browser.
import "server-only";

import { createHash } from "node:crypto";

const GRAPHQL_URL = "https://open-api.affiliate.shopee.com.br/graphql";

class ShopeeApiError extends Error {
  constructor(message: string) {
    super(`Shopee API: ${message}`);
    this.name = "ShopeeApiError";
  }
}

/**
 * Calls Shopee's affiliate GraphQL API.
 *
 * Shopee authenticates each request with a signature over the exact body being
 * sent — SHA256(appId + timestamp + payload + secret) — so the serialised
 * payload must be reused verbatim as the request body rather than re-stringified.
 * The timestamp is Unix seconds and Shopee rejects it outside a ~5 minute window.
 */
export async function queryShopee<T>(
  query: string,
  variables?: Record<string, unknown>,
  // Permite assinar com as credenciais do PROPRIO usuario (link de afiliado
  // pessoal, em vez do link da casa). Sem isso, cai nas env vars do app.
  credenciais?: { appId: string; appSecret: string },
): Promise<T> {
  const appId = credenciais?.appId ?? process.env.SHOPEE_AFFILIATE_APP_ID;
  const appSecret = credenciais?.appSecret ?? process.env.SHOPEE_AFFILIATE_APP_SECRET;

  if (!appId || !appSecret) {
    throw new ShopeeApiError(
      "SHOPEE_AFFILIATE_APP_ID / SHOPEE_AFFILIATE_APP_SECRET não configurados",
    );
  }

  // O timestamp entra na assinatura, entao o payload/assinatura precisam ser
  // recalculados a cada tentativa — reusar os de uma tentativa anterior faria
  // a Shopee rejeitar por timestamp fora da janela de ~5 minutos.
  const MAX_TENTATIVAS = 3;
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    const payload = JSON.stringify({ query, variables });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash("sha256")
      .update(`${appId}${timestamp}${payload}${appSecret}`)
      .digest("hex");

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
        },
        body: payload,
      });

      // 5xx/429 sao falhas transitorias do lado da Shopee — vale tentar de
      // novo. 4xx (exceto 429) e erro nosso (credencial, query invalida);
      // repetir so atrasa a falha, entao estoura na hora.
      if (!response.ok) {
        if (response.status < 500 && response.status !== 429) {
          throw new ShopeeApiError(`HTTP ${response.status} ${response.statusText}`);
        }
        throw new ShopeeApiError(
          `HTTP ${response.status} ${response.statusText} (tentativa ${tentativa}/${MAX_TENTATIVAS})`,
        );
      }

      const body = (await response.json()) as {
        data?: T;
        errors?: Array<{ message: string }>;
      };

      if (body.errors?.length) {
        throw new ShopeeApiError(body.errors.map((e) => e.message).join("; "));
      }
      if (!body.data) {
        throw new ShopeeApiError("resposta sem dados");
      }

      return body.data;
    } catch (erro) {
      ultimoErro = erro;
      const definitivo =
        erro instanceof ShopeeApiError && !erro.message.includes("tentativa");
      if (definitivo || tentativa === MAX_TENTATIVAS) break;
      // Backoff exponencial: 300ms, 900ms.
      await new Promise((r) => setTimeout(r, 300 * 3 ** (tentativa - 1)));
    }
  }

  throw ultimoErro;
}
