/**
 * Regras do @handle da vitrine pública.
 *
 * Vive como rota de primeiro nível (`escolhepromo.com.br/@fulana`), então não
 * pode colidir com nenhuma rota real nem parecer uma.
 */

const RESERVADOS = new Set([
  "app",
  "login",
  "auth",
  "api",
  "cakto",
  "termos",
  "privacidade",
  "acesso-encerrado",
  "admin",
  "sobre",
  "ajuda",
  "suporte",
  "contato",
  "www",
  "escolhepromo",
  "vitrine",
  "afiliado",
  "afiliada",
]);

const FORMATO = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
const DIACRITICOS = /[̀-ͯ]/g;

/** Normaliza o que a afiliada digitou: tira o "@", espaços e acentos, minúsculo. */
export function normalizarHandle(bruto: string): string {
  return bruto
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .replace(/[^a-z0-9-]/g, "");
}

export function validarHandle(
  handle: string,
): { ok: true } | { ok: false; erro: string } {
  if (handle.length < 3) return { ok: false, erro: "Mínimo 3 caracteres." };
  if (handle.length > 30) return { ok: false, erro: "Máximo 30 caracteres." };
  if (!FORMATO.test(handle)) {
    return {
      ok: false,
      erro: "Use só letras, números e hífen — sem começar ou terminar com hífen.",
    };
  }
  if (RESERVADOS.has(handle)) {
    return { ok: false, erro: "Esse nome não está disponível." };
  }
  return { ok: true };
}
