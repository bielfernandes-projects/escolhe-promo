"use client";

import Script from "next/script";

/**
 * Base do Meta Pixel (client-side), so pra PageView/retargeting — a conversao
 * de compra de verdade e disparada server-side no webhook da Cakto (ver
 * src/lib/meta/conversions.ts), porque o checkout acontece no dominio da
 * Cakto, nao no nosso: nao ha pagina de "compra concluida" aqui pra disparar
 * um evento client-side de Purchase.
 *
 * Fica em branco (nao renderiza nada) sem NEXT_PUBLIC_META_PIXEL_ID — assim
 * o codigo ja existe e so precisa da env var pra ligar.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
