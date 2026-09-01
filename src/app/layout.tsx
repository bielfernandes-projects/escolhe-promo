import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
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

// Display "achadinho": grotesca expressiva, peso alto pro preço/manchete.
// Só a landing usa; o app segue na Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // O dono pediu pra travar o zoom: sem pinça e sem duplo-toque, em qualquer sentido.
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: "#ee4d2d",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://escolhepromo.com.br"),
  title: {
    default: "Escolhe Promo — Copiou, postou, vendeu",
    template: "%s · Escolhe Promo",
  },
  description:
    "Gerador de copy e imagem pronta pra afiliado da Shopee divulgar no WhatsApp e no Instagram. Escolhe o produto, cola seu link, copia e posta.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Escolhe Promo",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
