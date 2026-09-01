"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Produto } from "@/lib/produtos/tipos";
import { criarGeradorDeCopy } from "@/lib/copy/gerador";
import {
  TEMPLATES,
  arquivoDaMoldura,
  renderTemplate,
  type TemplateId,
} from "@/lib/imagem/templates";
import { useGeradorImagem } from "@/lib/imagem/useGerador";
import { linkAfiliadoPessoal } from "./link-afiliado";
import { legendaDoProduto } from "./legenda-acao";

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
  const [aba, setAba] = useState<"whatsapp" | "instagram">("whatsapp");

  const [copy, setCopy] = useState("");
  const [gerador] = useState(() => criarGeradorDeCopy());
  /** Qual texto acabou de ser copiado, pra o botão certo dar o feedback. */
  const [copiado, setCopiado] = useState<"copy" | "legenda" | null>(null);

  // Os dois primeiros passos valem pras duas abas, por isso ficam acima delas:
  // o usuário abre o produto pelo link da casa (Double-Dip), pega o próprio
  // link de afiliado na Shopee e cola aqui. Quem não tem link segue pelo
  // escape hatch, usando o link da casa.
  const [meuLink, setMeuLink] = useState("");
  const [usarLinkDaCasa, setUsarLinkDaCasa] = useState(false);

  const [legenda, setLegenda] = useState("");
  const [erroLegenda, setErroLegenda] = useState<string | null>(null);
  const [gerandoLegenda, iniciarLegenda] = useTransition();

  // Foto propria opcional pra imagem (a API da Shopee so da uma foto por
  // produto). Guardada como data URI: serve tanto pro preview quanto pra
  // mandar pra rota que monta a imagem.
  const [fotoPropria, setFotoPropria] = useState<string | null>(null);

  function escolherFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = () =>
      setFotoPropria(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(arquivo);
  }

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

  const {
    templateAtual,
    setTemplateAtual,
    erro,
    pronta,
    entregue,
    compartilhar,
    baixar,
  } = useGeradorImagem(produto, {
    // Só prepara a imagem quando a aba está aberta — não faz sentido gastar
    // uma geração pra quem só vai postar no WhatsApp.
    ativo: aba === "instagram",
    foto: fotoPropria ?? undefined,
  });

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

  /** Modelos separados por formato, pra ficar claro o que é Feed e o que é Story. */
  const modelosPorFormato = useMemo(() => {
    const ids = Object.keys(TEMPLATES) as TemplateId[];
    return {
      feed: ids.filter((id) => TEMPLATES[id].altura === 1350),
      story: ids.filter((id) => TEMPLATES[id].altura !== 1350),
    };
  }, []);

  const linkValido = pareceLinkShopee(meuLink);
  const linkParaCopy = usarLinkDaCasa ? linkAtivo : meuLink.trim();
  const podeGerar = linkValido || usarLinkDaCasa;

  function abrirProduto() {
    window.open(produto.offerLink, "_blank", "noopener,noreferrer");
  }

  function gerarCopyClick() {
    if (!podeGerar) return;
    // Sempre WhatsApp aqui: a aba já diz onde o texto vai ser colado, então o
    // negrito com asterisco é sempre o certo e não precisa perguntar.
    setCopy(
      gerador.proxima(
        {
          nome: produto.nome,
          preco: produto.preco,
          vendas: produto.vendas,
          avaliacao: produto.avaliacao,
          taxaDesconto: produto.taxaDesconto,
        },
        { canal: "whatsapp", linkAfiliado: linkParaCopy },
      ),
    );
    setCopiado(null);
  }

  function gerarLegendaClick() {
    setErroLegenda(null);
    iniciarLegenda(async () => {
      const r = await legendaDoProduto(produto);
      if (r.ok) setLegenda(r.legenda);
      else setErroLegenda(r.erro);
    });
  }

  async function copiarTexto(texto: string, qual: "copy" | "legenda") {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      setCopiado(null);
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

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Passos 1 e 2 — comuns às duas abas. */}
          <div className="space-y-4 border-b border-black/5 pb-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                <span className="text-marca-700">1.</span> Abra o produto na
                Shopee
              </p>
              <p className="text-xs text-tinta-fraca">
                Abra, escolha suas opções e copie o <strong>seu</strong> link de
                afiliado lá na Shopee.
              </p>
              <button
                onClick={abrirProduto}
                className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800"
              >
                Abrir produto na Shopee 🛒
              </button>
            </div>

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
                  Ok, vai sair com um link genérico.{" "}
                  <button
                    onClick={() => setUsarLinkDaCasa(false)}
                    className="font-semibold underline underline-offset-2 hover:text-marca-700"
                  >
                    colar meu link
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Passo 3 — onde vai postar. */}
          <p className="pt-5 pb-2 text-sm font-semibold">
            <span className="text-marca-700">3.</span> Onde você vai postar?
          </p>

          <div className="flex gap-1 border-b border-black/5">
            {(["whatsapp", "instagram"] as const).map((nome) => (
              <button
                key={nome}
                onClick={() => setAba(nome)}
                className={`-mb-px border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${
                  aba === nome
                    ? "border-marca-600 text-marca-700"
                    : "border-transparent text-tinta-fraca"
                }`}
              >
                {nome === "whatsapp" ? "WhatsApp 💬" : "Instagram 📸"}
              </button>
            ))}
          </div>

          <div className="pt-5">
            {aba === "whatsapp" ? (
              <div className="space-y-3">
                <button
                  onClick={gerarCopyClick}
                  disabled={!podeGerar}
                  className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800 disabled:opacity-50"
                >
                  {copy ? "Gerar outra mensagem ✨" : "Gerar mensagem ✨"}
                </button>
                {!podeGerar && (
                  <p className="text-xs text-tinta-fraca">
                    Cole o seu link no passo 2 pra liberar.
                  </p>
                )}

                {copy && (
                  <>
                    <textarea
                      value={copy}
                      onChange={(e) => {
                        setCopy(e.target.value);
                        setCopiado(null);
                      }}
                      rows={9}
                      className="w-full resize-y rounded-xl border border-black/10 bg-tela p-4 text-sm outline-none focus:border-marca-500"
                    />
                    <p className="text-xs text-tinta-fraca">
                      Os <code>*asteriscos*</code> viram negrito quando você cola
                      no WhatsApp.
                    </p>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(copy)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl bg-[#25D366] px-4 py-3.5 text-center font-semibold text-white transition-colors hover:opacity-90"
                    >
                      Enviar no WhatsApp 💬
                    </a>
                    <button
                      onClick={() => copiarTexto(copy, "copy")}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        copiado === "copy"
                          ? "bg-emerald-600 text-white"
                          : "bg-tela text-tinta hover:bg-black/5"
                      }`}
                    >
                      {copiado === "copy" ? "Copiado! ✅" : "Copiar 📋"}
                    </button>
                  </>
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
                    <optgroup label="Feed (4:5)">
                      {modelosPorFormato.feed.map((id) => (
                        <option key={id} value={id}>
                          {TEMPLATES[id].nome}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Story (9:16)">
                      {modelosPorFormato.story.map((id) => (
                        <option key={id} value={id}>
                          {TEMPLATES[id].nome}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Foto: a do produto (padrao) ou uma que o usuario mandar. */}
                <div className="space-y-2">
                  <span className="block text-sm font-semibold">Foto da imagem</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5">
                      {fotoPropria ? "Trocar minha foto" : "Usar uma foto minha"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => escolherFoto(e.target.files?.[0])}
                      />
                    </label>
                    {fotoPropria && (
                      <button
                        onClick={() => setFotoPropria(null)}
                        className="rounded-xl px-3 py-2.5 text-sm font-semibold text-tinta-fraca underline underline-offset-2 hover:text-marca-700"
                      >
                        voltar pra foto do produto
                      </button>
                    )}
                  </div>
                  {fotoPropria && (
                    <p className="text-xs text-tinta-fraca">
                      Sua foto é usada só pra montar a imagem e não fica guardada.
                    </p>
                  )}
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
                      {renderTemplate(
                        templateAtual,
                        { nome: produto.nome, preco: produto.preco },
                        fotoPropria ?? produto.imagemUrl,
                        // No preview a arte é servida pelo /public mesmo; só a
                        // rota que gera o PNG precisa dela como data URI.
                        arquivoDaMoldura(templateAtual) ?? undefined,
                      )}
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

                {/* Sem await de rede entre o clique e o navigator.share: a
                    imagem já vem pronta, senão o celular recusa a folha de
                    compartilhamento e o app acabava baixando o arquivo. */}
                <button
                  onClick={() => compartilhar(legenda || undefined)}
                  disabled={!pronta}
                  className="w-full rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-marca-700 active:bg-marca-800 disabled:opacity-60"
                >
                  {!pronta
                    ? "Preparando imagem…"
                    : entregue
                      ? "Pronto! ✅"
                      : "Compartilhar imagem 📸"}
                </button>
                <button
                  onClick={() => baixar()}
                  disabled={!pronta}
                  className="w-full rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5 disabled:opacity-60"
                >
                  Baixar imagem
                </button>

                {/* Legenda pra colar junto do post. */}
                <div className="space-y-2 border-t border-black/5 pt-4">
                  <label htmlFor="legenda" className="block text-sm font-semibold">
                    Legenda pro post
                  </label>
                  {legenda ? (
                    <>
                      <textarea
                        id="legenda"
                        value={legenda}
                        onChange={(e) => setLegenda(e.target.value)}
                        rows={10}
                        className="w-full resize-y rounded-xl border border-black/10 bg-tela p-4 text-sm outline-none focus:border-marca-500"
                      />
                      <button
                        onClick={() => copiarTexto(legenda, "legenda")}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                          copiado === "legenda"
                            ? "bg-emerald-600 text-white"
                            : "bg-tela text-tinta hover:bg-black/5"
                        }`}
                      >
                        {copiado === "legenda" ? "Copiado! ✅" : "Copiar legenda 📋"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={gerarLegendaClick}
                      disabled={gerandoLegenda}
                      className="w-full rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5 disabled:opacity-60"
                    >
                      {gerandoLegenda ? "Escrevendo a legenda…" : "Gerar legenda ✨"}
                    </button>
                  )}
                  {erroLegenda && (
                    <p role="alert" className="text-xs text-red-600">
                      {erroLegenda}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
