"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import { registrarDivulgacao } from "./divulgacao-acao";
import { linkShopeeValido } from "@/lib/seguranca/urls";

type ModalGeradorProps = {
  produto: Produto;
  onClose: () => void;
  /** Chamado quando a afiliada compartilha e o produto entra nas divulgações. */
  onDivulgou?: (itemId: string) => void;
  /** A afiliada já salvou as credenciais da API da Shopee em Configurações. */
  temApiShopee?: boolean;
  /**
   * Produto do catálogo do dia (true) ou resultado da busca ao vivo (false).
   * A vitrine pública e a legenda por IA leem o snapshot do banco, então só
   * valem pra produto do catálogo — ver busca-acao.ts.
   */
  permiteVitrine?: boolean;
};

/** Espaco que o preview pode ocupar. O template real e bem maior e e escalado. */
const PREVIEW_LARGURA_MAX = 240;
const PREVIEW_ALTURA_MAX = 320;

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


export function ModalGerador({
  produto,
  onClose,
  onDivulgou,
  temApiShopee = false,
  permiteVitrine = true,
}: ModalGeradorProps) {
  const [aba, setAba] = useState<"whatsapp" | "instagram">("whatsapp");
  const [adicionarNaVitrine, setAdicionarNaVitrine] = useState(permiteVitrine);

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

  // Trava a rolagem da página atrás do modal enquanto ele está aberto — senão
  // no celular ela rola junto e o "puxar pra atualizar" recarregava tudo.
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);

  // Arrastar a folha pra baixo pra fechar (é o que a alcinha promete). Só começa
  // se o conteúdo já está no topo, pra não brigar com a rolagem interna.
  const rolagemRef = useRef<HTMLDivElement>(null);
  const inicioArrasto = useRef<number | null>(null);
  const [arrastoY, setArrastoY] = useState(0);
  const [arrastando, setArrastando] = useState(false);

  function aoTocarInicio(e: React.TouchEvent) {
    if ((rolagemRef.current?.scrollTop ?? 0) > 0) return;
    inicioArrasto.current = e.touches[0].clientY;
    setArrastando(true);
  }
  function aoTocarMover(e: React.TouchEvent) {
    if (inicioArrasto.current === null) return;
    const dy = e.touches[0].clientY - inicioArrasto.current;
    setArrastoY(dy > 0 ? dy : 0);
  }
  function aoTocarFim() {
    if (arrastoY > 90) onClose();
    else setArrastoY(0);
    inicioArrasto.current = null;
    setArrastando(false);
  }

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

  const linkValido = linkShopeeValido(meuLink);
  // Link colado no passo 2 tem prioridade; senão usa o `linkAtivo` (o link
  // gerado pela API dela quando configurada, ou o link da casa).
  const linkParaCopy =
    linkValido && !usarLinkDaCasa ? meuLink.trim() : linkAtivo;
  const podeGerar = linkValido || usarLinkDaCasa || temApiShopee;

  // "Próprio" = qualquer link que não seja o offerLink da casa. Cobre tanto o
  // link colado no passo 2 quanto o gerado pelas credenciais dela (linkAtivo).
  const usouLinkProprio =
    linkParaCopy !== "" && linkParaCopy !== produto.offerLink;
  // Com API configurada o link dela já é o padrão — não avisa (e evita o flash
  // enquanto o linkAtivo ainda não resolveu).
  const avisaLinkGenerico =
    adicionarNaVitrine && !usouLinkProprio && !temApiShopee;

  /** Registra a divulgação quando ela compartilha (bookkeeping, não bloqueia). */
  function registrarSeMarcado() {
    if (!adicionarNaVitrine) return;
    registrarDivulgacao({
      itemId: produto.itemId,
      linkAfiliado: linkParaCopy || produto.offerLink,
      usouLinkProprio,
    }).then((r) => {
      if (r.ok) onDivulgou?.(produto.itemId);
    });
  }

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
      const r = await legendaDoProduto(produto.itemId);
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/55 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={aoTocarInicio}
        onTouchMove={aoTocarMover}
        onTouchEnd={aoTocarFim}
        style={{
          transform: arrastoY ? `translateY(${arrastoY}px)` : undefined,
          transition: arrastando ? "none" : "transform .2s ease-out",
        }}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-superficie pb-3 shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        {/* Alcinha de bottom-sheet: arraste pra baixo pra fechar (no celular). */}
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-black/15 sm:hidden" />

        {/* Cabeçalho: o produto que está sendo divulgado, sempre à vista. */}
        <div className="flex shrink-0 items-center gap-3 border-b border-black/[0.06] px-4 py-3 sm:px-5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-tela ring-1 ring-black/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={produto.imagemUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-1 text-sm font-semibold text-tinta">
              {produto.nome}
            </h2>
            <p className="mt-0.5 text-xs text-tinta-fraca">
              <span className="fonte-display text-tinta">
                {emReais(produto.preco)}
              </span>
              <span className="mx-1.5 text-black/20">·</span>
              você ganha{" "}
              <span className="font-semibold text-emerald-700">
                {emReais(produto.comissao)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-1 shrink-0 rounded-full p-2 text-tinta-fraca transition-colors hover:bg-tela"
          >
            <FecharIcone className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={rolagemRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 sm:px-5"
        >
          {/* Passos do link — mudam conforme ela já tem a API configurada. */}
          {temApiShopee ? (
            <div className="border-b border-black/[0.06] py-5">
              <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                <span className="mt-px shrink-0 font-bold">✓</span>
                <span>
                  Sua API da Shopee está configurada — o link sai com a{" "}
                  <strong>sua</strong> afiliação automaticamente. É só gerar e
                  postar.
                </span>
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-tinta-fraca">
                  Usar outro link só neste produto
                </summary>
                <input
                  type="url"
                  inputMode="url"
                  value={meuLink}
                  onChange={(e) => setMeuLink(e.target.value)}
                  placeholder="https://s.shopee.com.br/..."
                  className="mt-2 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 text-sm outline-none focus:border-marca-500"
                />
                {meuLink && !linkValido && (
                  <p className="mt-1 text-xs text-red-600">
                    Isso não parece um link da Shopee.
                  </p>
                )}
              </details>
            </div>
          ) : (
            <div className="space-y-5 border-b border-black/[0.06] py-5">
              <div className="space-y-2.5">
                <p className="flex items-center gap-2 text-sm font-semibold text-tinta">
                  <PassoBadge>1</PassoBadge>
                  Abra o produto na Shopee
                </p>
                <p className="text-xs text-tinta-fraca">
                  Abra, escolha suas opções e copie o <strong>seu</strong> link
                  de afiliada lá na Shopee.
                </p>
                <button
                  onClick={abrirProduto}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-marca-600 px-4 py-3.5 font-semibold text-white transition-all hover:bg-marca-700 active:scale-[0.99] active:bg-marca-800"
                >
                  Abrir produto na Shopee
                  <SairIcone className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="meu-link"
                  className="flex items-center gap-2 text-sm font-semibold text-tinta"
                >
                  <PassoBadge>2</PassoBadge>
                  Cole aqui o seu link de afiliada
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
                  className="w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none transition-colors focus:border-marca-500"
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
                    não tenho um link de afiliada
                  </button>
                ) : (
                  <p className="rounded-lg bg-tela px-3 py-2 text-xs text-tinta-fraca">
                    Sem o seu link, a promoção não conta comissão pra você.{" "}
                    <button
                      onClick={() => setUsarLinkDaCasa(false)}
                      className="font-semibold text-marca-700 underline underline-offset-2"
                    >
                      colar meu link
                    </button>
                  </p>
                )}
              </div>

              <p className="rounded-lg bg-tela px-3 py-2 text-xs text-tinta-fraca">
                Cansada de fazer isso a cada produto? Salve sua API da Shopee em{" "}
                <strong>Configurações → API Shopee</strong> e o seu link passa a
                sair sozinho.
              </p>
            </div>
          )}

          {/* Toggle da vitrine pública — vale pras duas abas. Só pra produto do
              catálogo: o resultado de busca ao vivo não está no banco, e a
              vitrine pública lê o snapshot de lá. */}
          {permiteVitrine && (
          <div className="border-b border-black/[0.06] py-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={adicionarNaVitrine}
                onChange={(e) => setAdicionarNaVitrine(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-marca-600"
              />
              <span className="text-sm">
                <span className="font-semibold text-tinta">
                  Adicionar à minha vitrine
                </span>
                <span className="mt-0.5 block text-xs text-tinta-fraca">
                  Salva a promoção pra suas clientes acharem depois no seu link.
                </span>
              </span>
            </label>
            {avisaLinkGenerico && (
              <p className="mt-2.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
                Cole o <strong>seu</strong> link acima — senão a promoção entra
                na vitrine mandando pro link genérico e não conta comissão pra
                você.
              </p>
            )}

            {adicionarNaVitrine && (
              <button
                onClick={() => {
                  registrarSeMarcado();
                  onClose();
                }}
                className="mt-3 w-full rounded-xl border border-marca-200 bg-marca-50 px-4 py-2.5 text-sm font-semibold text-marca-700 transition-colors hover:bg-marca-100"
              >
                Só adicionar à vitrine (sem gerar post)
              </button>
            )}
          </div>
          )}

          {/* Passo 3 — onde vai postar. */}
          <p className="flex items-center gap-2 pt-5 pb-3 text-sm font-semibold text-tinta">
            <PassoBadge>3</PassoBadge>
            Onde você vai postar?
          </p>

          <div className="flex gap-1 border-b border-black/[0.06]">
            {(["whatsapp", "instagram"] as const).map((nome) => (
              <button
                key={nome}
                onClick={() => setAba(nome)}
                className={`-mb-px border-b-2 px-3 pb-2.5 text-sm font-semibold transition-colors ${
                  aba === nome
                    ? "border-marca-600 text-marca-700"
                    : "border-transparent text-tinta-fraca hover:text-tinta"
                }`}
              >
                {nome === "whatsapp" ? "WhatsApp" : "Instagram"}
              </button>
            ))}
          </div>

          <div className="pt-5">
            {aba === "whatsapp" ? (
              <div className="space-y-3">
                <button
                  onClick={gerarCopyClick}
                  disabled={!podeGerar}
                  className="w-full rounded-xl bg-marca-700 px-4 py-3.5 font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-tinta-fraca"
                >
                  {copy ? "Gerar outra mensagem" : "Gerar mensagem"}
                </button>
                {!podeGerar && (
                  <p className="text-center text-xs text-tinta-fraca">
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
                      Os <code className="rounded bg-tela px-1">*asteriscos*</code>{" "}
                      viram negrito quando você cola no WhatsApp.
                    </p>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(copy)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={registrarSeMarcado}
                      className="block w-full rounded-xl bg-[#25D366] px-4 py-3.5 text-center font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Enviar no WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        copiarTexto(copy, "copy");
                        registrarSeMarcado();
                      }}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        copiado === "copy"
                          ? "bg-emerald-600 text-white"
                          : "bg-tela text-tinta hover:bg-black/5"
                      }`}
                    >
                      {copiado === "copy" ? "Copiado!" : "Copiar mensagem"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="template" className="block text-sm font-semibold text-tinta">
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
                  <span className="block text-sm font-semibold text-tinta">
                    Foto da imagem
                  </span>
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

                <div className="flex justify-center rounded-2xl bg-tela p-4">
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
                  onClick={() => {
                    compartilhar(legenda || undefined);
                    registrarSeMarcado();
                  }}
                  disabled={!pronta}
                  className="w-full rounded-xl bg-marca-700 px-4 py-3.5 font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-tinta-fraca"
                >
                  {!pronta
                    ? "Preparando imagem…"
                    : entregue
                      ? "Pronto!"
                      : "Compartilhar imagem"}
                </button>
                <button
                  onClick={() => {
                    baixar();
                    registrarSeMarcado();
                  }}
                  disabled={!pronta}
                  className="w-full rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5 disabled:opacity-60"
                >
                  Baixar imagem
                </button>

                {/* Legenda pra colar junto do post. */}
                <div className="space-y-2 border-t border-black/[0.06] pt-4">
                  <label htmlFor="legenda" className="block text-sm font-semibold text-tinta">
                    Legenda pro post
                  </label>
                  {!permiteVitrine ? (
                    <>
                      <textarea
                        id="legenda"
                        value={legenda}
                        onChange={(e) => setLegenda(e.target.value)}
                        rows={6}
                        placeholder="Escreva a legenda do seu post aqui…"
                        className="w-full resize-y rounded-xl border border-black/10 bg-tela p-4 text-sm outline-none focus:border-marca-500"
                      />
                      <p className="text-xs text-tinta-fraca">
                        A legenda automática só vale pros produtos da Vitrine do
                        dia. Neste, escreva a sua.
                      </p>
                      {legenda && (
                        <button
                          onClick={() => copiarTexto(legenda, "legenda")}
                          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                            copiado === "legenda"
                              ? "bg-emerald-600 text-white"
                              : "bg-tela text-tinta hover:bg-black/5"
                          }`}
                        >
                          {copiado === "legenda" ? "Copiado!" : "Copiar legenda"}
                        </button>
                      )}
                    </>
                  ) : legenda ? (
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
                        {copiado === "legenda" ? "Copiado!" : "Copiar legenda"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={gerarLegendaClick}
                      disabled={gerandoLegenda}
                      className="w-full rounded-xl bg-tela px-4 py-2.5 text-sm font-semibold text-tinta transition-colors hover:bg-black/5 disabled:opacity-60"
                    >
                      {gerandoLegenda ? "Escrevendo a legenda…" : "Gerar legenda"}
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

function PassoBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-marca-100 text-[11px] font-bold text-marca-700">
      {children}
    </span>
  );
}

function FecharIcone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SairIcone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
