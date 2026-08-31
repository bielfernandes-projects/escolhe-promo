"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Cabecalho({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [saindo, setSaindo] = useState(false);
  const naVitrine = pathname === "/app/vitrine";

  async function sair() {
    setSaindo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-superficie/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-base font-bold tracking-tight">
            Eita<span className="text-marca-600">Promo</span>
          </Link>
          <Link
            href="/app/vitrine"
            aria-current={naVitrine ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              naVitrine
                ? "bg-marca-50 text-marca-700"
                : "text-tinta-fraca hover:bg-tela"
            }`}
          >
            Vitrine
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[16ch] truncate text-xs text-tinta-fraca sm:block">
            {email}
          </span>
          <Link
            href="/app/configuracoes"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-tinta-fraca transition-colors hover:bg-tela"
          >
            Configurações
          </Link>
          <button
            onClick={sair}
            disabled={saindo}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-tinta-fraca transition-colors hover:bg-tela disabled:opacity-50"
          >
            {saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}
