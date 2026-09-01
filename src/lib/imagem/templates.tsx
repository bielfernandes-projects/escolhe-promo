/**
 * Template Visual: layout pra gerar a imagem de Feed no estilo "achadinho"
 * (preço gritado, cor forte, urgência). Renderizado pelo satori/next-og no
 * servidor (rota /api/imagem), não no DOM.
 *
 * Regras do satori: todo elemento com mais de um filho precisa de
 * `display: flex`; sem grid; `backgroundImage` com url() e linear-gradient ok;
 * boxShadow, borderRadius, transform, border ok. Fontes: "Anton" (display) e
 * "Inter" (600/700).
 *
 * Os modelos do Canva (moldura PNG + retângulos coloridos marcando onde vai a
 * foto e o preço) entram aqui depois — cada um vira mais um TemplateId.
 */
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- satori renderiza <img>; não é DOM */
import React from "react";
import type { ReactElement } from "react";

export type TemplateId = "feed-cartao";

export type TemplateInfo = {
  nome: string;
  /** Só pra mostrar na tela. */
  rotulo: string;
  largura: number;
  altura: number;
};

export const TEMPLATES: Record<TemplateId, TemplateInfo> = {
  "feed-cartao": { nome: "Cartão", rotulo: "Feed 4:5", largura: 1080, altura: 1350 },
};

const LARANJA = "#ee4d2d";
const AMARELO = "#ffd400";
const TINTA = "#18181b";

export type DadosImagem = { nome: string; preco: number };

function fmtPreco(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function encurtar(nome: string, max = 52): string {
  if (nome.length <= max) return nome;
  const corte = nome.slice(0, max);
  const esp = corte.lastIndexOf(" ");
  return `${(esp > 24 ? corte.slice(0, esp) : corte).trimEnd()}…`;
}

/** Preço numa fontSize só, fonte Anton. */
function Preco({ valor, cor, tamanho }: { valor: number; cor: string; tamanho: number }) {
  return (
    <div style={{ fontFamily: "Anton", fontSize: tamanho, lineHeight: 1, color: cor }}>
      {fmtPreco(valor)}
    </div>
  );
}

/**
 * "Cartão": fundo gradiente, foto flutuando num card branco, preço numa
 * pílula, fita "SÓ HOJE" na diagonal.
 */
function FeedCartao({ dados, foto }: { dados: DadosImagem; foto: string }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(160deg, ${AMARELO} 0%, ${LARANJA} 100%)`,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <div style={{ fontFamily: "Anton", fontSize: 68, color: "#fff", marginBottom: 32 }}>
        ACHADINHO
      </div>

      <div
        style={{
          width: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 48,
          boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
          padding: "0 0 48px",
        }}
      >
        <img
          src={foto}
          width={780}
          height={700}
          style={{ objectFit: "contain", marginTop: 24 }}
        />
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#52525b",
            textAlign: "center",
            padding: "0 64px",
            lineHeight: 1.3,
          }}
        >
          {encurtar(dados.nome, 46)}
        </div>
        <div
          style={{
            marginTop: 28,
            padding: "16px 72px",
            display: "flex",
            backgroundColor: LARANJA,
            borderRadius: 999,
          }}
        >
          <Preco valor={dados.preco} cor="#fff" tamanho={150} />
        </div>
      </div>

      <div style={{ marginTop: 36, fontFamily: "Anton", fontSize: 50, color: "#fff" }}>
        COMPRA PELO LINK
      </div>

      <div
        style={{
          position: "absolute",
          top: 130,
          right: -90,
          display: "flex",
          padding: "20px 130px",
          backgroundColor: TINTA,
          color: "#fff",
          fontFamily: "Anton",
          fontSize: 46,
          transform: "rotate(38deg)",
        }}
      >
        SÓ HOJE
      </div>
    </div>
  );
}

export function renderTemplate(
  templateId: TemplateId,
  dados: DadosImagem,
  foto: string,
): ReactElement {
  switch (templateId) {
    case "feed-cartao":
      return <FeedCartao dados={dados} foto={foto} />;
  }
}
