"use client";

import { useEffect, useState } from "react";
import { gerarImagem, compartilharImagem, baixarImagem } from "./capturador";
import type { TemplateId } from "./templates";
import type { Produto } from "@/lib/produtos/tipos";

/**
 * Prepara a imagem do produto e entrega ao usuário.
 *
 * A imagem é gerada ANTES do clique, não durante. A Web Share API só abre a
 * folha nativa dentro de uma "transient user activation" — o gesto do usuário
 * vale por poucos segundos e um `await fetch` no meio já o invalida. Com o
 * `navigator.share` acontecendo depois da geração, o celular respondia
 * NotAllowedError e o app caía no download: o usuário pedia compartilhar e
 * recebia um arquivo baixado. Agora o clique só entrega um blob já pronto.
 */
export function useGeradorImagem(
  produto: Produto,
  opcoes: { ativo: boolean; foto?: string },
) {
  const { ativo, foto } = opcoes;
  const [templateAtual, setTemplateAtual] = useState<TemplateId>("feed-1");
  const [erro, setErro] = useState<string | null>(null);
  const [entregue, setEntregue] = useState(false);

  /** Identifica a imagem que os parâmetros atuais deveriam produzir. */
  const chave = `${produto.itemId}|${templateAtual}|${foto ? "propria" : "padrao"}`;
  const [resultado, setResultado] = useState<{ chave: string; blob: Blob } | null>(
    null,
  );

  // Derivar em vez de guardar: quando a chave muda (outro modelo, outra foto),
  // a imagem antiga deixa de valer sozinha, sem precisar limpá-la num efeito.
  const imagem = resultado?.chave === chave ? resultado.blob : null;

  useEffect(() => {
    if (!ativo) return;

    let cancelado = false;
    gerarImagem({
      template: templateAtual,
      produto: { nome: produto.nome, preco: produto.preco },
      imagemUrl: produto.imagemUrl,
      foto,
    })
      .then((blob) => {
        if (cancelado) return;
        setResultado({ chave, blob });
        setErro(null);
      })
      .catch((err) => {
        if (cancelado) return;
        const msg = err instanceof Error ? err.message : "erro desconhecido";
        setErro(`Falha ao gerar imagem: ${msg}`);
      });

    // Troca de modelo enquanto a anterior ainda vinha: a resposta velha não
    // pode sobrescrever a nova.
    return () => {
      cancelado = true;
    };
  }, [
    ativo,
    chave,
    templateAtual,
    foto,
    produto.nome,
    produto.preco,
    produto.imagemUrl,
  ]);

  function nomeArquivo(): string {
    return `${produto.nome.slice(0, 30).replace(/\s+/g, "-")}-${Date.now()}.png`;
  }

  function marcarEntregue() {
    setEntregue(true);
    setTimeout(() => setEntregue(false), 2000);
  }

  /** Chamado direto do onClick — sem await de rede antes do navigator.share. */
  async function compartilhar(legenda?: string) {
    if (!imagem) return;
    try {
      await compartilharImagem(imagem, nomeArquivo(), legenda);
      marcarEntregue();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      setErro(`Não deu pra compartilhar: ${msg}`);
    }
  }

  async function baixar() {
    if (!imagem) return;
    await baixarImagem(imagem, nomeArquivo());
    marcarEntregue();
  }

  return {
    templateAtual,
    setTemplateAtual,
    erro,
    /** false enquanto a imagem ainda está sendo preparada. */
    pronta: imagem !== null,
    /** true por 2s depois de compartilhar ou baixar, só pro feedback do botão. */
    entregue,
    compartilhar,
    baixar,
  };
}
