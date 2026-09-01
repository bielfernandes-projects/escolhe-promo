"use client";

import { useCallback, useState } from "react";
import { gerarImagem, compartilharImagem, baixarImagem } from "./capturador";
import type { TemplateId } from "./templates";
import type { Produto } from "@/lib/produtos/tipos";

export type EstadoCaptura = "ocioso" | "capturando" | "sucesso" | "erro";
type Entrega = "compartilhar" | "baixar";

export function useGeradorImagem(produto: Produto) {
  const [templateAtual, setTemplateAtual] = useState<TemplateId>("feed-cartao");
  const [estado, setEstado] = useState<EstadoCaptura>("ocioso");
  const [erro, setErro] = useState<string | null>(null);

  const gerar = useCallback(
    async (
      entrega: Entrega = "compartilhar",
      opcoes?: { legenda?: string; foto?: string },
    ) => {
      setEstado("capturando");
      setErro(null);

      try {
        const blob = await gerarImagem({
          template: templateAtual,
          produto: { nome: produto.nome, preco: produto.preco },
          imagemUrl: produto.imagemUrl,
          foto: opcoes?.foto,
        });
        const nomeArquivo = `${produto.nome.slice(0, 30).replace(/\s+/g, "-")}-${Date.now()}.png`;
        await (entrega === "compartilhar"
          ? compartilharImagem(blob, nomeArquivo, opcoes?.legenda)
          : baixarImagem(blob, nomeArquivo));
        setEstado("sucesso");
        setTimeout(() => setEstado("ocioso"), 2000);
      } catch (err) {
        const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
        setErro(`Falha ao gerar imagem: ${mensagem}`);
        setEstado("erro");
      }
    },
    [produto, templateAtual],
  );

  return { templateAtual, setTemplateAtual, estado, erro, gerar };
}
