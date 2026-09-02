"use client";

import { useState } from "react";
import { salvarCredencialShopee } from "./acoes";
import { CampoSenha } from "@/app/_ui/campo-senha";

type Props = { appIdSalvo: string | null };

/**
 * Integracao de Afiliado Propria: com credenciais salvas, os links gerados nas
 * copies passam a ser assinados com a conta do proprio usuario em vez do link
 * da casa. Sem isso, nada muda — continua o Double-Dip de hoje.
 */
export function FormularioShopee({ appIdSalvo }: Props) {
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvo, setSalvo] = useState(appIdSalvo);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setMensagem(null);

    // Precisa ser server action: o App Secret e cifrado com uma chave que
    // nunca pode chegar ao browser.
    const resultado = await salvarCredencialShopee(appId, appSecret);

    if (!resultado.ok) {
      setMensagem({ tipo: "erro", texto: resultado.erro ?? "Erro ao salvar." });
    } else {
      setMensagem({ tipo: "ok", texto: "Credenciais salvas." });
      setSalvo(appId);
      setAppId("");
      setAppSecret("");
    }
    setCarregando(false);
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="rounded-2xl bg-superficie p-5 ring-1 ring-black/[0.06]"
    >
      <h2 className="text-base font-bold text-tinta">Sua API da Shopee</h2>
      <p className="mt-1 text-sm text-tinta-fraca">
        {salvo
          ? `Credenciais salvas (App ID: ${salvo}). Os links das suas copies usam sua própria conta de afiliado.`
          : "Sem credenciais, os links usam a conta padrão do Escolhe Promo."}
      </p>

      <label htmlFor="app-id" className="mt-3 block text-sm font-semibold">
        App ID
      </label>
      <input
        id="app-id"
        required
        autoComplete="off"
        value={appId}
        onChange={(e) => setAppId(e.target.value)}
        placeholder={salvo ?? "Seu App ID da Shopee Affiliate"}
        className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-4 py-3 outline-none focus:border-marca-500"
      />

      <label htmlFor="app-secret" className="mt-3 block text-sm font-semibold">
        App Secret
      </label>
      <CampoSenha
        id="app-secret"
        required
        autoComplete="off"
        value={appSecret}
        onChange={(e) => setAppSecret(e.target.value)}
        placeholder="Seu App Secret da Shopee Affiliate"
        className="mt-1.5"
      />

      {mensagem && (
        <p
          role="alert"
          className={`mt-3 text-sm ${mensagem.tipo === "ok" ? "text-emerald-700" : "text-red-700"}`}
        >
          {mensagem.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="mt-4 rounded-xl bg-marca-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-marca-600 active:scale-[0.99] disabled:opacity-60"
      >
        {carregando ? "Salvando..." : "Salvar credenciais"}
      </button>
    </form>
  );
}
