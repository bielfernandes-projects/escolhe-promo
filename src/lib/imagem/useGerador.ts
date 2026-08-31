"use client";

import { useCallback, useRef, useState } from "react";
import { capturarImagem, compartilharImagem, baixarImagem } from "./capturador";
import type { TemplateId } from "./templates";
import type { Produto } from "@/lib/produtos/tipos";

export type EstadoCaptura = "ocioso" | "capturando" | "sucesso" | "erro";
type Entrega = "compartilhar" | "baixar";

export function useGeradorImagem(produto: Produto) {
  const refTemplate = useRef<HTMLDivElement>(null);
  const [templateAtual, setTemplateAtual] = useState<TemplateId>("feed-simples");
  const [estado, setEstado] = useState<EstadoCaptura>("ocioso");
  const [erro, setErro] = useState<string | null>(null);

  const gerar = useCallback(async (entrega: Entrega = "compartilhar", legenda?: string) => {
    if (!refTemplate.current) {
      setErro("Template não encontrado (falha interna)");
      setEstado("erro");
      return;
    }

    setEstado("capturando");
    setErro(null);

    try {
      const blob = await capturarImagem(refTemplate.current);
      const nomeArquivo = `${produto.nome.slice(0, 30).replace(/\s+/g, "-")}-${Date.now()}.png`;
      await (entrega === "compartilhar"
        ? compartilharImagem(blob, nomeArquivo, legenda)
        : baixarImagem(blob, nomeArquivo));
      setEstado("sucesso");
      setTimeout(() => setEstado("ocioso"), 2000);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
      setErro(`Falha ao gerar imagem: ${mensagem}`);
      setEstado("erro");
    }
  }, [produto]);

  return {
    refTemplate,
    templateAtual,
    setTemplateAtual,
    estado,
    erro,
    gerar,
  };
}
