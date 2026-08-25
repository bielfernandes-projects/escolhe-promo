"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Fecha o login quando o token vem no fragmento da URL (#access_token=...).
 *
 * O template de e-mail padrao do Supabase usa {{ .ConfirmationURL }}, que passa
 * pelo /verify do GoTrue e devolve os tokens no fragmento — e fragmento nunca
 * chega ao servidor. Trocar o template exigiria plano pago ou SMTP proprio,
 * entao esse caso e resolvido aqui no cliente: o supabase-js le o fragmento
 * sozinho na inicializacao (detectSessionInUrl) e grava a sessao no cookie.
 */
export function ConfirmarNoCliente({ proximo }: { proximo: string }) {
  const router = useRouter();
  const [demorou, setDemorou] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let vivo = true;

    function entrar() {
      if (!vivo) return;
      vivo = false;
      // refresh() faz o servidor reler o cookie recem-gravado antes de navegar.
      router.refresh();
      router.replace(proximo);
    }

    const { data: inscricao } = supabase.auth.onAuthStateChange((_e, sessao) => {
      if (sessao) entrar();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) entrar();
    });

    // Se nada chegou, o link era invalido ou ja tinha sido usado.
    const prazo = setTimeout(() => {
      if (!vivo) return;
      vivo = false;
      router.replace("/login?erro=link_invalido");
    }, 8000);

    const aviso = setTimeout(() => setDemorou(true), 3000);

    return () => {
      vivo = false;
      inscricao.subscription.unsubscribe();
      clearTimeout(prazo);
      clearTimeout(aviso);
    };
  }, [router, proximo]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center">
      <div
        role="status"
        aria-label="Entrando"
        className="h-8 w-8 animate-spin rounded-full border-4 border-marca-200 border-t-marca-600"
      />
      <p className="text-sm text-tinta-fraca">
        {demorou ? "Quase lá..." : "Entrando..."}
      </p>
    </main>
  );
}
