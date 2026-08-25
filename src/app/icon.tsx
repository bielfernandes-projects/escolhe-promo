import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Icone do PWA gerado em build. Antes o manifest apontava pro next.svg, o logo
 * padrao do starter — instalar o app na tela inicial mostrava o logo do Next.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #ff7f5e 0%, #ee4d2d 55%, #c43a1e 100%)",
          color: "#ffffff",
          fontSize: 232,
          fontWeight: 700,
        }}
      >
        EP
      </div>
    ),
    { ...size },
  );
}
