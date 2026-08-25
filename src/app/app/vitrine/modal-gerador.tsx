"use client";

import { useState, useRef } from "react";
import type { Produto } from "@/lib/shopee/products";
import { gerarCopy, criarGeradorDeCopy, type Canal } from "@/lib/copy/gerador";
import { TEMPLATES, renderTemplate, type TemplateId } from "@/lib/imagem/templates";
import { capturarImagem, download } from "@/lib/imagem/capturador";

type ModalGeradorProps = {
  produto: Produto;
  onClose: () => void;
};

export function ModalGerador({ produto, onClose }: ModalGeradorProps) {
  const [aba, setAba] = useState<"copy" | "imagem">("copy");

  const [canalCopy, setCanalCopy] = useState<Canal>("whatsapp");
  const [copyGerada, setCopyGerada] = useState<string>("");
  const [geradorCopy] = useState(() => criarGeradorDeCopy());

  const [templateImagem, setTemplateImagem] = useState<TemplateId>("feed-simples");
  const refTemplateDOM = useRef<HTMLDivElement>(null);
  const [estadoCaptura, setEstadoCaptura] = useState<
    "ocioso" | "capturando" | "sucesso"
  >("ocioso");

  const gerarCopyClick = () => {
    const copy = geradorCopy.proxima(produto, {
      canal: canalCopy,
      linkAfiliado: produto.offerLink,
    });
    setCopyGerada(copy);
  };

  const copiarCopy = () => {
    if (!copyGerada) return;
    navigator.clipboard.writeText(copyGerada).then(() => {
      alert("Copy copiada!");
    });
  };

  const gerarImagemClick = async () => {
    if (!refTemplateDOM.current) return;
    setEstadoCaptura("capturando");
    try {
      const blob = await capturarImagem(refTemplateDOM.current);
      const nome = `${produto.nome.slice(0, 30).replace(/\s+/g, "-")}-${Date.now()}.png`;
      await download(blob, nome);
      setEstadoCaptura("sucesso");
      setTimeout(() => setEstadoCaptura("ocioso"), 2000);
    } catch (err) {
      console.error("Erro ao capturar:", err);
      alert(`Erro: ${err instanceof Error ? err.message : "desconhecido"}`);
      setEstadoCaptura("ocioso");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold truncate">{produto.nome}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-4 border-b px-4 pt-4">
          <button
            onClick={() => setAba("copy")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
              aba === "copy"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Copy
          </button>
          <button
            onClick={() => setAba("imagem")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
              aba === "imagem"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Imagem
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          {aba === "copy" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Canal
                </label>
                <select
                  value={canalCopy}
                  onChange={(e) => setCanalCopy(e.target.value as Canal)}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="whatsapp">WhatsApp (com negrito *)</option>
                  <option value="instagram">Instagram (sem negrito)</option>
                </select>
              </div>

              <button
                onClick={gerarCopyClick}
                className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700"
              >
                Gerar Copy ✨
              </button>

              {copyGerada && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-4 text-sm whitespace-pre-wrap text-gray-900">
                    {copyGerada}
                  </div>
                  <button
                    onClick={copiarCopy}
                    className="w-full bg-green-600 text-white rounded py-2 font-semibold hover:bg-green-700"
                  >
                    Copiar Copy 📋
                  </button>
                </div>
              )}
            </div>
          )}

          {aba === "imagem" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Template
                </label>
                <select
                  value={templateImagem}
                  onChange={(e) => setTemplateImagem(e.target.value as TemplateId)}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  {Object.entries(TEMPLATES).map(([id, info]) => (
                    <option key={id} value={id}>
                      {info.nome} ({info.aspecto})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview do template (oculto) */}
              <div className="hidden">
                <div ref={refTemplateDOM}>
                  {renderTemplate(templateImagem, produto)}
                </div>
              </div>

              {/* Preview visível (redimensionado) */}
              <div className="bg-gray-100 rounded overflow-auto flex items-center justify-center p-4">
                <div
                  style={{
                    width: TEMPLATES[templateImagem].aspecto === "1:1" ? 200 : 120,
                    aspectRatio: TEMPLATES[templateImagem].aspecto,
                  }}
                  className="bg-white rounded overflow-hidden shadow"
                >
                  {renderTemplate(templateImagem, produto)}
                </div>
              </div>

              <button
                onClick={gerarImagemClick}
                disabled={estadoCaptura === "capturando"}
                className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {estadoCaptura === "capturando"
                  ? "Capturando..."
                  : estadoCaptura === "sucesso"
                    ? "Baixada! ✅"
                    : "Gerar Imagem 📸"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
