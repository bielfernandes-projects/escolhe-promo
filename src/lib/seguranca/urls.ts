/**
 * Allowlist de URLs que o app aceita de fora.
 *
 * Um `String.includes("shopee.com.br")` nao serve como validacao: passa em
 * `https://evil.com/?r=shopee.com.br` e passa em `javascript:alert(1)//shopee.com.br`.
 * Como o link de afiliada vira `<a href>` numa pagina PUBLICA (a vitrine em
 * /@handle), um `javascript:` ali seria XSS armazenado. Por isso a checagem e
 * sempre: parseia a URL, exige https, e compara o hostname com uma lista.
 */

/** Onde um link de afiliada da Shopee pode morar. */
const HOSTS_LINK_SHOPEE = new Set([
  "shopee.com.br",
  "www.shopee.com.br",
  "s.shopee.com.br",
  "id.shopee.com.br",
  "affiliate.shopee.com.br",
  "shp.ee",
  "shope.ee",
]);

/** Sufixos de host que servem imagem de produto (CDN da Shopee). */
const SUFIXOS_IMAGEM = [".susercontent.com", ".shopee.com.br", ".supabase.co"];

function parsear(bruto: string): URL | null {
  if (typeof bruto !== "string" || bruto.length > 2048) return null;
  try {
    const u = new URL(bruto.trim());
    // Sem isso, `javascript:`, `data:` e `file:` passariam.
    return u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

/** Link de afiliada aceitavel — o que vai pro `href` da vitrine publica. */
export function linkShopeeValido(bruto: string): boolean {
  const u = parsear(bruto);
  return !!u && HOSTS_LINK_SHOPEE.has(u.hostname.toLowerCase());
}

/** URL de imagem que o servidor pode buscar (ver SSRF em /api/imagem). */
export function imagemPermitida(bruto: string): boolean {
  const u = parsear(bruto);
  if (!u) return false;
  const host = u.hostname.toLowerCase();
  return SUFIXOS_IMAGEM.some(
    (sufixo) => host === sufixo.slice(1) || host.endsWith(sufixo),
  );
}
