/**
 * O app tem um dono. Uma allowlist de e-mail resolve o "quem pode administrar"
 * sem precisar de coluna de role no banco. Configuravel por ADMIN_EMAILS
 * (lista separada por virgula).
 */
export function ehAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? "gabriel.fernandeshw@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return lista.includes(email.toLowerCase());
}
