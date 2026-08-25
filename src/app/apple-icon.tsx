import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icone da tela inicial no iOS — o publico-alvo instala pelo Safari. */
export default function AppleIcon() {
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
          fontSize: 82,
          fontWeight: 700,
        }}
      >
        EP
      </div>
    ),
    { ...size },
  );
}
