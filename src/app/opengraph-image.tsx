import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Escolhe Promo — copiou, postou, vendeu";

/**
 * Cartão de compartilhamento (link no WhatsApp, anúncio, preview no Google).
 * Tráfego pago vive de primeira impressão, então esse preview importa.
 */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "src/app/icon.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 100px",
          background: "#f7f7f8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={148} height={148} src={logoSrc} alt="" style={{ borderRadius: 40 }} />
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#18181b" }}>
            <span>Escolhe</span>
            <span style={{ color: "#ee4d2d" }}>&nbsp;Promo</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 52,
            fontWeight: 700,
            color: "#18181b",
          }}
        >
          Copiou, postou, vendeu.
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#52525b", maxWidth: 840 }}>
          Texto e imagem prontos pra você divulgar produto da Shopee no WhatsApp e no Instagram.
        </div>
      </div>
    ),
    { ...size },
  );
}
