"use client";

import { useState } from "react";
import { FormularioSenha } from "./formulario-senha";
import { FormularioShopee } from "./formulario-shopee";
import { PainelVitrine, type DivulgacaoGestao } from "./painel-vitrine";

type Aba = "conta" | "shopee" | "vitrine";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "conta", rotulo: "Conta" },
  { id: "shopee", rotulo: "API Shopee" },
  { id: "vitrine", rotulo: "Vitrine de Afiliada" },
];

export function ConfiguracoesClient({
  email,
  appIdShopee,
  perfil,
  divulgacoes,
}: {
  email: string;
  appIdShopee: string | null;
  perfil: { handle: string; nome_exibicao: string } | null;
  divulgacoes: DivulgacaoGestao[];
}) {
  const [aba, setAba] = useState<Aba>("conta");

  return (
    <div className="mt-7">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-tela p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              aba === a.id
                ? "bg-superficie text-tinta shadow-sm"
                : "text-tinta-fraca hover:text-tinta"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {aba === "conta" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-superficie p-5 ring-1 ring-black/[0.06]">
              <h2 className="text-base font-bold text-tinta">Seu e-mail</h2>
              <p className="mt-1 text-sm text-tinta-fraca">{email}</p>
            </div>
            <FormularioSenha />
          </div>
        )}

        {aba === "shopee" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-marca-50 p-5 text-sm text-tinta-fraca">
              <p className="font-semibold text-tinta">Pra que serve?</p>
              <p className="mt-1.5">
                Uma promoção só gera comissão pra você quando o link sai com o{" "}
                <strong>seu</strong> link de afiliada da Shopee.
              </p>
              <p className="mt-2">
                Salvando aqui o seu <strong>App ID</strong> e{" "}
                <strong>App Secret</strong>, o app monta o seu link sozinho em
                todo produto — você não precisa gerar link nenhum na hora de
                divulgar.
              </p>
              <p className="mt-2">
                Sem configurar, você tem que gerar o link de cada produto na
                Shopee e colar no campo indicado no momento da divulgação. Se não
                fizer isso, o link sai sem afiliação e você não ganha nada.
              </p>
              <p className="mt-2">
                O App ID e o App Secret ficam em{" "}
                <a
                  href="https://affiliate.shopee.com.br/open_api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-marca-700 underline underline-offset-2"
                >
                  affiliate.shopee.com.br/open_api
                </a>
                .
              </p>
            </div>
            <FormularioShopee appIdSalvo={appIdShopee} />
          </div>
        )}

        {aba === "vitrine" && (
          <PainelVitrine perfil={perfil} divulgacoes={divulgacoes} />
        )}
      </div>
    </div>
  );
}
