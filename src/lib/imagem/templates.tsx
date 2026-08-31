/**
 * Template Visual: layouts pra gerar imagens de Feed/Story no estilo
 * "achadinho" (preço gritado, cor forte, urgência). São renderizados pelo
 * satori/next-og no servidor (rota /api/imagem), não no DOM.
 *
 * Regras do satori: todo elemento com mais de um filho precisa de
 * `display: flex`; sem grid; `backgroundImage` com url() e linear-gradient ok;
 * boxShadow, borderRadius, transform, border ok. Fontes: "Anton" (display) e
 * "Inter" (600/700).
 */
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- satori renderiza <img>; não é DOM */
import React from "react";
import type { ReactElement } from "react";

export type TemplateId = "feed-oferta" | "feed-cartao" | "story-achadinho";

export type TemplateInfo = {
  nome: string;
  /** Só pra mostrar na tela. */
  rotulo: string;
  largura: number;
  altura: number;
};

export const TEMPLATES: Record<TemplateId, TemplateInfo> = {
  "feed-oferta": { nome: "Oferta", rotulo: "Feed 4:5", largura: 1080, altura: 1350 },
  "feed-cartao": { nome: "Cartão", rotulo: "Feed 4:5", largura: 1080, altura: 1350 },
  "story-achadinho": {
    nome: "Achadinho",
    rotulo: "Story 9:16",
    largura: 1080,
    altura: 1920,
  },
};

const LARANJA = "#ee4d2d";
const LARANJA_ESCURO = "#c43a1e";
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
 * Direção A — "Oferta": foto em cima, faixa laranja gritando o preço, selo
 * "CORRE" sobreposto na emenda.
 */
function FeedOferta({ dados, foto }: { dados: DadosImagem; foto: string }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        display: "flex",
        flexDirection: "column",
        backgroundColor: LARANJA,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <img src={foto} width={1080} height={620} style={{ objectFit: "cover" }} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px 56px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Anton", fontSize: 44, color: AMARELO }}>
            DE TUDO ISSO POR
          </div>
          <Preco valor={dados.preco} cor="#fff" tamanho={240} />
          <div
            style={{
              marginTop: 24,
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.3,
            }}
          >
            {encurtar(dados.nome, 60)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "28px 0",
            backgroundColor: "#fff",
            borderRadius: 999,
            fontFamily: "Anton",
            fontSize: 46,
            color: LARANJA,
          }}
        >
          LINK NA DESCRIÇÃO
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 470,
          right: 56,
          width: 290,
          height: 290,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: 145,
          border: "10px solid #fff",
          backgroundColor: AMARELO,
          transform: "rotate(-12deg)",
          fontFamily: "Anton",
          fontSize: 56,
          color: LARANJA_ESCURO,
          lineHeight: 1.05,
          textAlign: "center",
        }}
      >
        <div>CORRE</div>
        <div>QUE ACABA</div>
      </div>
    </div>
  );
}

/**
 * Direção B — "Cartão": fundo gradiente, foto flutuando num card branco, preço
 * numa pílula, fita "SÓ HOJE" na diagonal.
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

/**
 * Direção C — "Achadinho" (Story): foto full-bleed, etiqueta de preço girada,
 * chamada pra ação no rodapé.
 */
function StoryAchadinho({ dados, foto }: { dados: DadosImagem; foto: string }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        display: "flex",
        backgroundColor: TINTA,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <img
        src={foto}
        width={1080}
        height={1920}
        style={{ objectFit: "cover", position: "absolute", top: 0, left: 0 }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.12) 20%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.94) 76%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 84,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          fontFamily: "Anton",
          fontSize: 52,
          color: "#fff",
        }}
      >
        ACHADINHO DO DIA
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 1170,
          width: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "18px 60px",
            backgroundColor: AMARELO,
            borderRadius: 24,
            boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
            transform: "rotate(-4deg)",
          }}
        >
          <Preco valor={dados.preco} cor={LARANJA_ESCURO} tamanho={230} />
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 44,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {encurtar(dados.nome, 62)}
        </div>

        <div
          style={{
            marginTop: 52,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "34px 0",
            backgroundColor: LARANJA,
            borderRadius: 999,
            fontFamily: "Anton",
            fontSize: 58,
            color: "#fff",
          }}
        >
          CLICA NO LINK
        </div>
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
    case "feed-oferta":
      return <FeedOferta dados={dados} foto={foto} />;
    case "feed-cartao":
      return <FeedCartao dados={dados} foto={foto} />;
    case "story-achadinho":
      return <StoryAchadinho dados={dados} foto={foto} />;
  }
}
