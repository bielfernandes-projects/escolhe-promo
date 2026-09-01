/**
 * Template Visual: o layout que vira a imagem de divulgação. Renderizado pelo
 * satori/next-og no servidor (rota /api/imagem), não no DOM.
 *
 * Dois tipos:
 *  - **Moldura**: uma arte feita no Canva, exportada em PNG com a área da foto
 *    furada (transparente). O código encaixa a foto do produto por baixo e
 *    escreve nome e preço por cima. Adicionar uma arte nova = mais uma entrada
 *    em MOLDURAS + o PNG furado em /public/templates.
 *  - **Código**: layout montado inteiro aqui (o "Cartão").
 *
 * Regras do satori: todo elemento com mais de um filho precisa de
 * `display: flex`; sem grid; boxShadow, borderRadius, transform e objectFit ok.
 * Fontes disponíveis: "Anton" (display) e "Inter" (600/700).
 */
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- satori renderiza <img>; não é DOM */
import React from "react";
import type { ReactElement } from "react";

export type TemplateId = "achadinho-do-dia" | "feed-cartao";

export type TemplateInfo = {
  nome: string;
  /** Só pra mostrar na tela. */
  rotulo: string;
  largura: number;
  altura: number;
};

export const TEMPLATES: Record<TemplateId, TemplateInfo> = {
  "achadinho-do-dia": {
    nome: "Achadinho do dia",
    rotulo: "Feed 4:5",
    largura: 1080,
    altura: 1350,
  },
  "feed-cartao": { nome: "Cartão", rotulo: "Feed 4:5", largura: 1080, altura: 1350 },
};

const LARANJA = "#ee4d2d";
const AMARELO = "#ffd400";
const TINTA = "#18181b";

export type DadosImagem = { nome: string; preco: number };

function fmtPreco(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

function encurtar(nome: string, max = 52): string {
  if (nome.length <= max) return nome;
  const corte = nome.slice(0, max);
  const esp = corte.lastIndexOf(" ");
  return `${(esp > 24 ? corte.slice(0, esp) : corte).trimEnd()}…`;
}

/**
 * Corpo do preço no maior tamanho que ainda cabe na largura do slot. A largura
 * por dígito é uma estimativa por família (vírgula/ponto contam metade) — boa o
 * bastante pra escolher o tamanho sem medir glifo.
 */
function tamanhoQueCabe(
  texto: string,
  larguraMax: number,
  tamanhoMax: number,
  fonte: FonteDisplay,
): number {
  const digito = LARGURA_DIGITO[fonte];
  let ems = 0;
  for (const c of texto) ems += c === "," || c === "." ? digito * 0.52 : digito;
  return Math.min(tamanhoMax, Math.floor(larguraMax / ems));
}

// ---------------------------------------------------------------- molduras

/** Retângulo do slot, em pixels da arte. `rot` em graus (negativo = anti-horário). */
type Slot = { x: number; y: number; largura: number; altura: number; rot?: number };

type Moldura = {
  /** Caminho em /public — PNG com a área da foto transparente. */
  arquivo: string;
  largura: number;
  altura: number;
  /** Onde a foto do produto entra. Um pouco maior que o furo, pra não sobrar borda. */
  foto: Slot;
  nome: Slot & { tamanho: number; cor: string; maxChars: number };
  /** O "R$" fica numa linha e o valor na de baixo — cabe em coluna estreita. */
  preco: {
    x: number;
    y: number;
    largura: number;
    cor: string;
    tamanhoMax: number;
    tamanhoMoeda: number;
    /** Família da fonte; escolhida pra combinar com a letra da arte. */
    fonte: FonteDisplay;
  };
};

/** Fontes de display disponíveis (a rota /api/imagem carrega todas). */
export type FonteDisplay = "Anton" | "Titan One" | "Baloo 2";

export const FONTES_DISPLAY: Record<FonteDisplay, string> = {
  Anton: "anton.woff",
  "Titan One": "titan-one.woff",
  "Baloo 2": "baloo2.woff",
};

/** Quanto cada família ocupa por dígito, em em. Usado pra achar o tamanho. */
const LARGURA_DIGITO: Record<FonteDisplay, number> = {
  Anton: 0.5,
  "Titan One": 0.62,
  "Baloo 2": 0.58,
};

export const MOLDURAS: Partial<Record<TemplateId, Moldura>> = {
  // Medidas tiradas pixel a pixel do PNG exportado do Canva: o furo magenta
  // tem bbox x 236..851 / y 419..1006, que corresponde a um retângulo de
  // 573x543 girado -4,7° com centro em (543.5, 712.5).
  "achadinho-do-dia": {
    arquivo: "/templates/achadinho-do-dia.png",
    largura: 1080,
    altura: 1350,
    foto: { x: 249, y: 433, largura: 589, altura: 559, rot: -4.7 },
    nome: {
      x: 312,
      y: 1020,
      largura: 520,
      altura: 60,
      rot: -4.7,
      tamanho: 32,
      cor: "#141414",
      maxChars: 30,
    },
    preco: {
      x: 26,
      y: 996,
      largura: 240,
      cor: "#141414",
      tamanhoMax: 112,
      tamanhoMoeda: 44,
      fonte: "Baloo 2",
    },
  },
};

export function arquivoDaMoldura(id: TemplateId): string | null {
  return MOLDURAS[id]?.arquivo ?? null;
}

function ImagemComMoldura({
  moldura,
  dados,
  foto,
  arte,
}: {
  moldura: Moldura;
  dados: DadosImagem;
  foto: string;
  arte: string;
}) {
  const valor = fmtPreco(dados.preco);
  const tamanhoValor = tamanhoQueCabe(
    valor,
    moldura.preco.largura,
    moldura.preco.tamanhoMax,
    moldura.preco.fonte,
  );

  return (
    <div
      style={{
        width: moldura.largura,
        height: moldura.altura,
        display: "flex",
        position: "relative",
        fontFamily: "Inter",
      }}
    >
      {/* 1. Foto do produto, por baixo — aparece pelo furo da arte. */}
      <img
        src={foto}
        width={moldura.foto.largura}
        height={moldura.foto.altura}
        style={{
          position: "absolute",
          left: moldura.foto.x,
          top: moldura.foto.y,
          objectFit: "cover",
          transform: `rotate(${moldura.foto.rot ?? 0}deg)`,
        }}
      />

      {/* 2. A arte do Canva por cima, tapando tudo menos o furo. */}
      <img
        src={arte}
        width={moldura.largura}
        height={moldura.altura}
        style={{ position: "absolute", left: 0, top: 0 }}
      />

      {/* 3. Nome do produto, na tarja branca. */}
      <div
        style={{
          position: "absolute",
          left: moldura.nome.x,
          top: moldura.nome.y,
          width: moldura.nome.largura,
          height: moldura.nome.altura,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${moldura.nome.rot ?? 0}deg)`,
          fontSize: moldura.nome.tamanho,
          fontWeight: 700,
          color: moldura.nome.cor,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {encurtar(dados.nome, moldura.nome.maxChars)}
      </div>

      {/* 4. Preço, embaixo do "APENAS:" da arte. */}
      <div
        style={{
          position: "absolute",
          left: moldura.preco.x,
          top: moldura.preco.y,
          width: moldura.preco.largura,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: moldura.preco.fonte,
          color: moldura.preco.cor,
        }}
      >
        <div style={{ fontSize: moldura.preco.tamanhoMoeda, lineHeight: 1 }}>R$</div>
        <div style={{ fontSize: tamanhoValor, lineHeight: 1 }}>{valor}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- em código

/**
 * "Cartão": fundo gradiente, foto flutuando num card branco, preço numa
 * pílula, fita "SÓ HOJE" na diagonal. Montado inteiro em código.
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
          <div style={{ fontFamily: "Anton", fontSize: 150, lineHeight: 1, color: "#fff" }}>
            R$ {fmtPreco(dados.preco)}
          </div>
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
  /** Data URI da arte, obrigatória pros templates de moldura. */
  arte?: string,
): ReactElement {
  const moldura = MOLDURAS[templateId];
  if (moldura) {
    if (!arte) throw new Error(`template ${templateId} precisa da arte`);
    return (
      <ImagemComMoldura moldura={moldura} dados={dados} foto={foto} arte={arte} />
    );
  }
  return <FeedCartao dados={dados} foto={foto} />;
}
