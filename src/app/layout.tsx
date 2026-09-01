import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/lib/meta/pixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ee4d2d",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://eitapromo.bf.dev.br"),
  title: {
    default: "Eita Promo — Copiou, postou, vendeu",
    template: "%s · Eita Promo",
  },
  description:
    "Gerador de copy e imagem pronta pra afiliado da Shopee divulgar no WhatsApp e no Instagram. Escolhe o produto, cola seu link, copia e posta.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Eita Promo",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
