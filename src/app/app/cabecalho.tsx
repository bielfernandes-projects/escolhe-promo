"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Marca } from "@/app/_brand/marca";

export function Cabecalho({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [saindo, setSaindo] = useState(false);
  const naVitrine = pathname === "/app/vitrine";
  const naConfig = pathname === "/app/configuracoes";

  const abaClasse = (ativa: boolean) =>
    `shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
      ativa ? "bg-marca-50 text-marca-700" : "text-tinta-fraca hover:bg-tela"
    }`;

  async function sair() {
    setSaindo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-superficie/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link href="/app" aria-label="Eita Promo" className="shrink-0">
            {/* Só o símbolo no celular: o nome ao lado brigava com a aba "Vitrine". */}
            <Marca texto="hidden text-base sm:inline" />
          </Link>
          <Link
            href="/app/vitrine"
            aria-current={naVitrine ? "page" : undefined}
            className={abaClasse(naVitrine)}
          >
            Vitrine
          </Link>
          <Link
            href="/app/configuracoes"
            aria-current={naConfig ? "page" : undefined}
            className={abaClasse(naConfig)}
          >
            Configurações
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-[16ch] truncate text-xs text-tinta-fraca sm:block">
            {email}
          </span>
          <button
            onClick={sair}
            disabled={saindo}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-tinta-fraca transition-colors hover:bg-tela disabled:opacity-50"
          >
            {saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}
