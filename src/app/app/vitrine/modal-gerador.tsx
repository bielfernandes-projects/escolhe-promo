"use client";

import { useMemo, useState } from "react";
import type { Produto } from "@/lib/produtos/tipos";
import { criarGeradorDeCopy, type Canal } from "@/lib/copy/gerador";
import { TEMPLATES, renderTemplate, type TemplateId } from "@/lib/imagem/templates";
import { useGeradorImagem } from "@/lib/imagem/useGerador";

type ModalGeradorProps = {
  produto: Produto;
  onClose: () => void;
};

/** Espaco que o preview pode ocupar. O template real e bem maior e e escalado. */
const PREVIEW_LARGURA_MAX = 240;
const PREVIEW_ALTURA_MAX = 320;

export function ModalGerador({ produto, onClose }: ModalGeradorProps) {
  const [aba, setAba] = useState<"copy" | "imagem">("copy");

  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [copy, setCopy] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [gerador] = useState(() => criarGeradorDeCopy());

  const { refTemplate, templateAtual, setTemplateAtual, estado, erro, gerar } =
    useGeradorImagem(produto);

  const info = TEMPLATES[templateAtual];

  /**
   * O template e desenhado em 1080px. Antes ele era jogado cru dentro de uma
   * caixa de 200px com overflow:auto, entao aparecia so um canto cortado.
   * Aqui ele e reduzido de verdade, com transform: scale.
   */
  const preview = useMemo(() => {
    const escala = Math.min(
      PREVIEW_LARGURA_MAX / info.largura,
      PREVIEW_ALTURA_MAX / info.altura,
    );
    return {
      escala,
      largura: Math.round(info.largura * escala),
      altura: Math.round(info.altura * escala),
    };
  }, [info]);

  function gerarCopyClick() {
    setCopy(gerador.proxima(produto, { canal, linkAfiliado: produto.offerLink }));
    setCopiado(false);
  }

  async function copiarClick() {
    if (!copy) return;
    try {
      await navigator.clipboard.writeText(copy);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={produto.nome}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-superficie sm:max-h-[88vh] sm:rounded-2xl"
      >
        {/* Alcinha de bottom-sheet: so faz sentido no celular. */}
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-black/15 sm:hidden" />

        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-3 pb-3">
          <h2 className="line-clamp-2 text-sm font-semibold">{produto.nome}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="-mt-1 shrink-0 rounded-full p-2 text-xl leading-none text-tinta-fraca hover:bg-tela"
          >
            ✕
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-black/5 px-5">
          {(["copy", "imagem"] as const).map((nome) => (
            <button
              key={nome}
              onClick={() => setAba(nome)}
              className={`-mb-px border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${
                aba === nome
                  ? "border-marca-600 text-marca-700"
                  : "border-transparent text-tinta-fraca"
              }`}
            >
              {nome === "copy" ? "Copy" : "Imagem"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {aba === "copy" ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="canal" className="block text-sm font-semibold">
                  Onde você vai postar?
                </label>
                <select
                  id="canal"
                  value={canal}
                  onChange={(e) => setCanal(e.target.value as Canal)}
                  className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
                >
                  <option value="whatsapp">WhatsApp (com *negrito*)</option>
                  <option value="instagram">Instagram (sem negrito)</option>
                </select>
              </div>

              <button
                onClick={gerarCopyClick}
                className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800"
              >
                {copy ? "Gerar outra copy ✨" : "Gerar copy ✨"}
              </button>

              {copy && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-tela p-4 text-sm whitespace-pre-wrap">
                    {copy}
                  </div>
                  <button
                    onClick={copiarClick}
                    className={`w-full rounded-xl px-4 py-3.5 font-semibold text-white transition-colors ${
                      copiado ? "bg-emerald-600" : "bg-tinta hover:opacity-90"
                    }`}
                  >
                    {copiado ? "Copiado! ✅" : "Copiar copy 📋"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="template" className="block text-sm font-semibold">
                  Modelo da imagem
                </label>
                <select
                  id="template"
                  value={templateAtual}
                  onChange={(e) => setTemplateAtual(e.target.value as TemplateId)}
                  className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
                >
                  {Object.entries(TEMPLATES).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.nome} ({t.rotulo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center rounded-xl bg-tela p-4">
                <div
                  style={{ width: preview.largura, height: preview.altura }}
                  className="overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
                >
                  <div
                    style={{
                      width: info.largura,
                      height: info.altura,
                      transform: `scale(${preview.escala})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {renderTemplate(templateAtual, produto)}
                  </div>
                </div>
              </div>

              {erro && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {erro}
                </p>
              )}

              <button
                onClick={gerar}
                disabled={estado === "capturando"}
                className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800 disabled:opacity-60"
              >
                {estado === "capturando"
                  ? "Gerando..."
                  : estado === "sucesso"
                    ? "Pronto! ✅"
                    : "Baixar imagem 📸"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/*
        Alvo real da captura, em tamanho natural. Fica fora da tela em vez de
        display:none: o html2canvas nao consegue capturar elemento escondido —
        sairia uma imagem em branco.
      */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          pointerEvents: "none",
        }}
      >
        <div ref={refTemplate}>{renderTemplate(templateAtual, produto)}</div>
      </div>
    </div>
  );
}
