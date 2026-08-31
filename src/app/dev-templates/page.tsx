"use client";

// Página de trabalho, temporária — pra iterar nos Templates Visuais vendo o
// PNG real do satori. APAGAR depois.

import { useEffect, useState } from "react";
import { TEMPLATES, type TemplateId } from "@/lib/imagem/templates";

const PRODUTO = {
  nome: "Percarbonato 100% Puro Tira Manchas Roupas Brancas e Coloridas",
  preco: 16.99,
};
const IMAGEM_URL = "https://cf.shopee.com.br/file/br-11134207-820lm-mqdb9tob0xdu3d";

export default function DevTemplates() {
  const ids = Object.keys(TEMPLATES) as TemplateId[];
  return (
    <main style={{ padding: 24, display: "flex", gap: 32, flexWrap: "wrap", background: "#e5e5e5" }}>
      {ids.map((id) => (
        <Cartao key={id} id={id} />
      ))}
    </main>
  );
}

function Cartao({ id }: { id: TemplateId }) {
  const info = TEMPLATES[id];
  const [png, setPng] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/imagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: id, produto: PRODUTO, imagemUrl: IMAGEM_URL }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.blob();
      })
      .then((b) => vivo && setPng(URL.createObjectURL(b)))
      .catch((e) => vivo && setErro(String(e)));
    return () => {
      vivo = false;
    };
  }, [id]);

  return (
    <div style={{ width: 340 }}>
      <h3 style={{ fontFamily: "system-ui", fontSize: 14 }}>
        {info.nome} · {info.rotulo} ({id})
      </h3>
      {erro && <p style={{ color: "red", fontSize: 12 }}>{erro}</p>}
      {png ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={png} alt="" style={{ width: 340, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.15)" }} />
      ) : (
        !erro && <p style={{ fontFamily: "system-ui", fontSize: 12 }}>gerando…</p>
      )}
    </div>
  );
}
