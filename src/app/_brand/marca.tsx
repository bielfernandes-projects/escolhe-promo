import type { CSSProperties } from "react";

/**
 * Identidade do Escolhe Promo num lugar só — cabeçalho do app, cabeçalho e rodapé
 * da landing e a tela de login puxam daqui.
 *
 * O símbolo é a arte feita no Canva: um balão de conversa (WhatsApp) em forma
 * de etiqueta de preço (achadinho) desenhando um "E", com um raio (rapidez). O
 * PNG original (2000²) fica em `arte-canva/logo.png`; o que a página serve é o
 * `src/app/icon.png` (512²), que também é o favicon/ícone do PWA pelas
 * convenções do Next (junto de `apple-icon.png` e `favicon.ico`).
 */

/** Só o símbolo. Cantos arredondados porque a arte tem fundo creme sólido. */
export function MarcaSimbolo({
  size = 28,
  style,
}: {
  size?: number;
  style?: CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.png"
      alt="Escolhe Promo"
      width={size}
      height={size}
      style={{ borderRadius: size * 0.28, display: "block", ...style }}
    />
  );
}

/** "Escolhe Promo" — "Escolhe" na tinta, "Promo" no laranja da marca. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className ?? ""}`}>
      Escolhe<span className="text-marca-600"> Promo</span>
    </span>
  );
}

/** Lockup padrão: símbolo + palavra. É o que vai nos cabeçalhos. */
export function Marca({
  className,
  simbolo = 26,
  texto = "text-base",
}: {
  className?: string;
  simbolo?: number;
  texto?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <MarcaSimbolo size={simbolo} />
      <Wordmark className={texto} />
    </span>
  );
}
