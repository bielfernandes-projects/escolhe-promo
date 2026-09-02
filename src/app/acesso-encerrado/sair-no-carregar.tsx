"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Encerra a sessão ao abrir a página. Quem foi reembolsado ainda chega aqui
 * logado (a checagem que barra é do layout de /app, não do cookie); sem isso a
 * sessão morta ficaria pra sempre no navegador.
 */
export function SairNoCarregar() {
  useEffect(() => {
    createClient().auth.signOut();
  }, []);

  return null;
}
