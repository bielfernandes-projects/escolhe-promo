/**
 * Detecta se a requisição veio de um navegador embutido (in-app browser) de
 * apps como Gmail, WhatsApp, Instagram, Facebook.
 *
 * Isso importa no fluxo de magic link: o token é de uso único e é consumido no
 * servidor. Se o clique acontece dentro do in-app browser, a sessão fica presa
 * nele — o usuário "some" quando volta pro navegador de verdade. A solução é
 * interceptar antes de consumir o token e empurrar pro navegador padrão.
 *
 * Assinaturas conhecidas de User-Agent:
 *   FBAN / FBAV / FB_IAB  → Facebook
 *   Instagram             → Instagram
 *   Line                  → Line
 *   GSA                   → Google Search App
 *   ; wv)                 → Android WebView genérico (usado pelo Gmail app)
 *   DuckDuckGo            → DuckDuckGo
 */
const ASSINATURAS_IN_APP = [
  "FBAN",
  "FBAV",
  "FB_IAB",
  "Instagram",
  "Line/",
  "Twitter",
  "Snapchat",
  "Pinterest",
  "DuckDuckGo",
  "; wv)", // Android WebView (Gmail, apps em geral)
];

export function ehNavegadorInApp(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return ASSINATURAS_IN_APP.some((assinatura) => userAgent.includes(assinatura));
}

export function ehAndroid(userAgent: string | null | undefined): boolean {
  return !!userAgent && /Android/i.test(userAgent);
}
