/**
 * Traduz mensagens de erro do Supabase pra PT-BR.
 */

const TRADUCOES: Record<string, string> = {
  // Rate limiting
  "For security purposes, you can only request this after 3 seconds.":
    "Por segurança, aguarde 3 segundos antes de tentar novamente.",
  "email rate limit exceeded":
    "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
  "rate limit exceeded":
    "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",

  // User not found / invalid credentials
  "Invalid login credentials":
    "E-mail ou senha incorretos.",
  "User not found":
    "Nenhuma conta com esse e-mail.",

  // Email issues
  "Email not confirmed":
    "Confirme seu e-mail antes de fazer login.",
  "Email already exists":
    "Esse e-mail já está cadastrado.",

  // Senha
  "Password should be at least 6 characters":
    "A senha precisa ter no mínimo 6 caracteres.",
  "New password should be different from the old password":
    "A nova senha precisa ser diferente da atual.",

  // Network/connection
  "Failed to fetch":
    "Erro de conexão. Verifique sua internet.",
  "Network error":
    "Erro de conexão. Verifique sua internet.",
};

export function traduzirErro(mensagem: string | null | undefined): string {
  if (!mensagem) return "Ocorreu um erro. Tente novamente.";

  // Procura tradução exata
  if (TRADUCOES[mensagem]) {
    return TRADUCOES[mensagem];
  }

  // Procura substring (case-insensitive)
  const lower = mensagem.toLowerCase();
  for (const [chave, valor] of Object.entries(TRADUCOES)) {
    if (lower.includes(chave.toLowerCase())) {
      return valor;
    }
  }

  // Se não encontrar, retorna a original (pode ser útil pra debug)
  return mensagem;
}
