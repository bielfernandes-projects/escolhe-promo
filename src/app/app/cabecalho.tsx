"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Cabecalho({ email }: { email: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

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
        <Link href="/app" className="text-base font-bold tracking-tight">
          Eita<span className="text-marca-600">Promo</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[16ch] truncate text-xs text-tinta-fraca sm:block">
            {email}
          </span>
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
