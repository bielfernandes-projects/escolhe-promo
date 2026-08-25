import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Criptografa/descriptografa segredos de terceiros que o usuario cola no app
 * (hoje: o App Secret da Shopee em Configuracoes). AES-256-GCM com IV
 * aleatorio por chamada — nunca reusa IV com a mesma chave.
 *
 * Formato de saida: "iv:authTag:ciphertext", tudo em hex.
 */

function chave(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) {
    throw new Error("ENCRYPTION_KEY nao configurada");
  }
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY precisa ter 32 bytes (AES-256)");
  }
  return buf;
}

export function criptografar(texto: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", chave(), iv);
  const ciphertext = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

export function descriptografar(valor: string): string {
  const [ivHex, authTagHex, ciphertextHex] = valor.split(":");
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("valor criptografado em formato invalido");
  }
  const decipher = createDecipheriv("aes-256-gcm", chave(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const texto = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);
  return texto.toString("utf8");
}
