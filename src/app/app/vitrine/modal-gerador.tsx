"use client";

import { useEffect, useMemo, useState } from "react";
import type { Produto } from "@/lib/produtos/tipos";
import { criarGeradorDeCopy, gerarCopy, type Canal } from "@/lib/copy/gerador";
import { TEMPLATES, renderTemplate, type TemplateId } from "@/lib/imagem/templates";
import { useGeradorImagem } from "@/lib/imagem/useGerador";
import { linkAfiliadoPessoal } from "./link-afiliado";

type ModalGeradorProps = {
  produto: Produto;
  onClose: () => void;
};

/** Espaco que o preview pode ocupar. O template real e bem maior e e escalado. */
const PREVIEW_LARGURA_MAX = 240;
const PREVIEW_ALTURA_MAX = 320;

/** Aceita link cru da Shopee ou os encurtadores (shp.ee, s.shopee, shope.ee). */
function pareceLinkShopee(valor: string): boolean {
  return /shopee\.com\.br|shp\.ee|s\.shopee|shope\.ee/i.test(valor.trim());
}

export function ModalGerador({ produto, onClose }: ModalGeradorProps) {
  const [aba, setAba] = useState<"copy" | "imagem">("copy");

  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [copy, setCopy] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [gerador] = useState(() => criarGeradorDeCopy());

  // Fluxo em 3 passos: o usuario abre o produto pelo link da casa (Double-Dip),
  // pega o proprio link de afiliado la na Shopee, cola aqui, e so entao gera a
  // copy. Quem nao tem link segue pelo escape hatch usando o link da casa.
  const [meuLink, setMeuLink] = useState("");
  const [usarLinkDaCasa, setUsarLinkDaCasa] = useState(false);

  // Legenda pro Instagram na aba de imagem — some caption pra colar junto do post.
  const [legenda, setLegenda] = useState("");

  // Comeca com o link da casa (Double-Dip) e troca pro pessoal se o usuario
  // tiver credenciais salvas — ver src/app/app/vitrine/link-afiliado.ts.
  // O modal e remontado por produto (nunca troca de produto em vida), entao o
  // estado inicial ja cobre o link da casa; o efeito so troca pro pessoal.
  const [linkAtivo, setLinkAtivo] = useState(produto.offerLink);
  useEffect(() => {
    linkAfiliadoPessoal(produto.produtoLink).then((pessoal) => {
      if (pessoal) setLinkAtivo(pessoal);
    });
  }, [produto.produtoLink]);

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

  const linkValido = pareceLinkShopee(meuLink);
  const linkParaCopy = usarLinkDaCasa ? linkAtivo : meuLink.trim();
  const podeGerar = linkValido || usarLinkDaCasa;

  function abrirProduto() {
    window.open(produto.offerLink, "_blank", "noopener,noreferrer");
  }

  function gerarCopyClick() {
    if (!podeGerar) return;
    setCopy(gerador.proxima(produto, { canal, linkAfiliado: linkParaCopy }));
    setCopiado(false);
  }

  function gerarLegendaClick() {
    setLegenda(
      gerarCopy(produto, {
        canal: "instagram",
        linkAfiliado: linkParaCopy || linkAtivo,
      }),
    );
  }

  async function copiarTexto(texto: string) {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
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
            <div className="space-y-5">
              {/* Passo 1 — abrir o produto pelo link da casa (Double-Dip). */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  <span className="text-marca-700">1.</span> Abra o produto na
                  Shopee
                </p>
                <p className="text-xs text-tinta-fraca">
                  Abra, escolha suas opções e copie o <strong>seu</strong> link
                  de afiliado lá na Shopee.
                </p>
                <button
                  onClick={abrirProduto}
                  className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800"
                >
                  Abrir produto na Shopee 🛒
                </button>
              </div>

              {/* Passo 2 — colar o link de afiliado do proprio usuario. */}
              <div className="space-y-2">
                <label htmlFor="meu-link" className="block text-sm font-semibold">
                  <span className="text-marca-700">2.</span> Cole aqui o seu link
                  de afiliado
                </label>
                <input
                  id="meu-link"
                  type="url"
                  inputMode="url"
                  value={meuLink}
                  onChange={(e) => {
                    setMeuLink(e.target.value);
                    if (e.target.value) setUsarLinkDaCasa(false);
                  }}
                  placeholder="https://s.shopee.com.br/..."
                  className="w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
                />
                {meuLink && !linkValido && (
                  <p className="text-xs text-red-600">
                    Isso não parece um link da Shopee. Confira e cole de novo.
                  </p>
                )}
                {!usarLinkDaCasa ? (
                  <button
                    onClick={() => setUsarLinkDaCasa(true)}
                    className="text-xs font-semibold text-tinta-fraca underline underline-offset-2 hover:text-marca-700"
                  >
                    não tenho um link de afiliado →
                  </button>
                ) : (
                  <p className="text-xs text-tinta-fraca">
                    Ok, a copy vai sair com um link genérico.{" "}
                    <button
                      onClick={() => setUsarLinkDaCasa(false)}
                      className="font-semibold underline underline-offset-2 hover:text-marca-700"
                    >
                      colar meu link
                    </button>
                  </p>
                )}
              </div>

              {/* Passo 3 — gerar, editar e copiar a copy. */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">
                  <span className="text-marca-700">3.</span> Gere a copy
                </p>
                <select
                  aria-label="Onde você vai postar?"
                  value={canal}
                  onChange={(e) => setCanal(e.target.value as Canal)}
                  className="w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
                >
                  <option value="whatsapp">WhatsApp (com *negrito*)</option>
                  <option value="instagram">Instagram (sem negrito)</option>
                </select>

                <button
                  onClick={gerarCopyClick}
                  disabled={!podeGerar}
                  className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800 disabled:opacity-50"
                >
                  {copy ? "Gerar outra copy ✨" : "Gerar copy ✨"}
                </button>
                {!podeGerar && (
                  <p className="text-xs text-tinta-fraca">
                    Cole o seu link no passo 2 pra liberar.
                  </p>
                )}

                {copy && (
                  <div className="space-y-3">
                    <textarea
                      value={copy}
                      onChange={(e) => {
                        setCopy(e.target.value);
                        setCopiado(false);
                      }}
                      rows={8}
                      className="w-full resize-y rounded-xl border border-black/10 bg-tela p-4 text-sm outline-none focus:border-marca-500"
                    />
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(copy)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl bg-[#25D366] px-4 py-3.5 text-center font-semibold text-white transition-colors hover:opacity-90"
                    >
                      Enviar no WhatsApp 💬
                    </a>
                    <div className="flex gap-2">
                      {typeof navigator !== "undefined" &&
                        "share" in navigator && (
                          <button
                            onClick={() =>
                              navigator.share({ text: copy }).catch(() => {})
                            }
                            className="flex-1 rounded-xl bg-tinta px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
                          >
                            Compartilhar
                          </button>
                        )}
                      <button
                        onClick={() => copiarTexto(copy)}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                          copiado
                            ? "bg-emerald-600 text-white"
                            : "bg-tela text-tinta hover:bg-black/5"
                        }`}
                      >
                        {copiado ? "Copiado! ✅" : "Copiar 📋"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

              {/* Legenda pra colar junto do post no Instagram. */}
              <div className="space-y-2">
                <label htmlFor="legenda" className="block text-sm font-semibold">
                  Legenda pro Instagram
                </label>
                {legenda ? (
                  <>
                    <textarea
                      id="legenda"
                      value={legenda}
                      onChange={(e) => setLegenda(e.target.value)}
                      rows={6}
                      className="w-full resize-y rounded-xl border border-black/10 bg-tela p-4 text-sm outline-none focus:border-marca-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={gerarLegendaClick}
                        className="flex-1 rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5"
                      >
                        Gerar outra ✨
                      </button>
                      <button
                        onClick={() => copiarTexto(legenda)}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                          copiado
                            ? "bg-emerald-600 text-white"
                            : "bg-tela text-tinta hover:bg-black/5"
                        }`}
                      >
                        {copiado ? "Copiado! ✅" : "Copiar legenda 📋"}
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={gerarLegendaClick}
                    className="w-full rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5"
                  >
                    Gerar legenda ✨
                  </button>
                )}
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
                onClick={() => gerar("compartilhar", legenda || undefined)}
                disabled={estado === "capturando"}
                className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800 disabled:opacity-60"
              >
                {estado === "capturando"
                  ? "Gerando..."
                  : estado === "sucesso"
                    ? "Pronto! ✅"
                    : "Compartilhar imagem 📸"}
              </button>
              <button
                onClick={() => gerar("baixar")}
                disabled={estado === "capturando"}
                className="w-full rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5 disabled:opacity-60"
              >
                Baixar imagem
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
