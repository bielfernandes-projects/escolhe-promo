/**
 * Template Visual: layouts HTML/CSS pra gerar imagens de Feed ou Story.
 * Cada template é um componente React puro — sem hooks, sem network, sem
 * interatividade. Renderizados numa div oculta e capturados via html2canvas.
 */
import React from "react";
import type { ReactNode } from "react";
import type { Produto } from "@/lib/produtos/tipos";

export type TemplateId = "feed-simples" | "story-urgencia" | "feed-destaque";

export type TemplateInfo = {
  nome: string;
  /** Só pra mostrar na tela: "1:1" nao e CSS valido. */
  rotulo: string;
  /** Sintaxe CSS de verdade — `aspect-ratio` exige barra, nao dois-pontos. */
  aspecto: string;
  /** Tamanho real em que o template e capturado. O preview escala a partir daqui. */
  largura: number;
  altura: number;
};

export const TEMPLATES: Record<TemplateId, TemplateInfo> = {
  "feed-simples": {
    nome: "Feed Simples",
    rotulo: "1:1",
    aspecto: "1 / 1",
    largura: 1080,
    altura: 1080,
  },
  "story-urgencia": {
    nome: "Story Urgência",
    rotulo: "9:16",
    aspecto: "9 / 16",
    largura: 1080,
    altura: 1920,
  },
  "feed-destaque": {
    nome: "Feed Destaque",
    rotulo: "1:1",
    aspecto: "1 / 1",
    largura: 1080,
    altura: 1080,
  },
};

type TemplateProps = {
  produto: Produto;
};

/**
 * Feed 1:1 — foto em cima, preço e CTA embaixo.
 * O fundo branco vai virar canvas e pode ser salvo direto do gerador.
 */
export const FeedSimples: React.FC<TemplateProps> = ({ produto }) => (
  <div
    style={{
      width: 1080,
      height: 1080,
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: 0,
      fontSize: "48px",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: 600,
      color: "#000",
    }}
  >
    {/* Imagem: 80% da altura */}
    <div
      style={{
        flex: 1,
        backgroundImage: `url(${produto.imagemUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />

    {/* Footer: 20% da altura, com preço e emoji de aproveita */}
    <div
      style={{
        height: "20%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ fontSize: "56px", color: "#e74c3c", fontWeight: 700 }}>
        {produto.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
      <div style={{ fontSize: "72px" }}>🛍️</div>
    </div>
  </div>
);

/**
 * Story 9:16 — foto grande, overlay com preço e "clica aqui".
 * Bom pra compartilhar em Stories, tem urgência visual.
 */
export const StoryUrgencia: React.FC<TemplateProps> = ({ produto }) => (
  <div
    style={{
      width: 1080,
      height: 1920,
      backgroundColor: "#000",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}
  >
    {/* Background image: full height */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${produto.imagemUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />

    {/* Dark overlay: 30% opacity */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
      }}
    />

    {/* Content: bottom half, white text */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
        justifyContent: "flex-end",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: "40px", marginBottom: "20px", fontWeight: 700 }}>
        ⚡ URGENTE!
      </div>
      <div style={{ fontSize: "56px", fontWeight: 700, marginBottom: "20px" }}>
        {produto.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 600,
          backgroundColor: "#e74c3c",
          padding: "12px 20px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        🔗 Clica no link da bio
      </div>
    </div>
  </div>
);

/**
 * Feed 1:1 — destaque em card com sombra, bom pra carrossel.
 */
export const FeedDestaque: React.FC<TemplateProps> = ({ produto }) => (
  <div
    style={{
      width: 1080,
      height: 1080,
      backgroundColor: "#f8f8f8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    }}
  >
    {/* Card: white, rounded, with shadow */}
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      }}
    >
      {/* Image: 60% */}
      <div
        style={{
          flex: 0.6,
          backgroundImage: `url(${produto.imagemUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Info: 40% */}
      <div
        style={{
          flex: 0.4,
          display: "flex",
          flexDirection: "column",
          padding: "30px",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#e74c3c",
              marginBottom: "10px",
            }}
          >
            {produto.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#666",
              fontWeight: 500,
            }}
          >
            Comissão: R${(produto.comissao).toFixed(2)}
          </div>
        </div>

        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#fff",
            backgroundColor: "#27ae60",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          ✨ ACHADINHO
        </div>
      </div>
    </div>
  </div>
);

export function renderTemplate(templateId: TemplateId, produto: Produto): ReactNode {
  switch (templateId) {
    case "feed-simples":
      return <FeedSimples produto={produto} />;
    case "story-urgencia":
      return <StoryUrgencia produto={produto} />;
    case "feed-destaque":
      return <FeedDestaque produto={produto} />;
  }
}
