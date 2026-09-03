"use server";

import { createClient } from "@/lib/supabase/server";
import { descriptografar } from "@/lib/seguranca/criptografia";
import { excedeuLimite } from "@/lib/seguranca/limite-tentativas";
import { fetchProdutos } from "@/lib/shopee/products";
import type { Produto } from "@/lib/produtos/tipos";

/** Quantos resultados a busca ao vivo traz. Sem paginação (ver AGENTS/design). */
const LIMITE_BUSCA = 20;

export type ResultadoBusca =
  | { ok: true; produtos: Produto[] }
  | { ok: false; erro: string };

/**
 * Busca produtos na Shopee por palavra-chave, sob demanda da afiliada.
 *
 * Diferente do catálogo do dia (curado pelo cron), isto é uma chamada ao vivo
 * disparada por um clique. Por isso: exige sessão, tem teto por usuário, e os
 * resultados são efêmeros — não entram na tabela `produtos`. Como não estão no
 * banco, `legendaDoProduto` e `registrarDivulgacao` não funcionam pra eles (as
 * duas leem o snapshot do banco de propósito); o modal esconde essas partes
 * quando o produto vem daqui.
 *
 * Assina com a credencial da própria afiliada se ela configurou a API dela em
 * Configurações; senão, cai na credencial da casa (env vars).
 */
export async function buscarProdutosShopee(
  termo: string,
): Promise<ResultadoBusca> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Faça login de novo pra continuar." };

  const limpo = typeof termo === "string" ? termo.trim() : "";
  if (limpo.length < 2 || limpo.length > 60) {
    return { ok: false, erro: "Digite entre 2 e 60 caracteres pra buscar." };
  }

  // Teto por usuário: a busca ao vivo consome cota da API da Shopee.
  if (excedeuLimite(`busca-shopee:${user.id}`, 20, 10 * 60 * 1000)) {
    return {
      ok: false,
      erro: "Muitas buscas seguidas. Espere alguns minutos.",
    };
  }

  const { data: credencial } = await supabase
    .from("credenciais_afiliado")
    .select("shopee_app_id, shopee_app_secret")
    .eq("user_id", user.id)
    .maybeSingle();

  let credenciais: { appId: string; appSecret: string } | undefined;
  if (credencial?.shopee_app_id && credencial?.shopee_app_secret) {
    try {
      credenciais = {
        appId: credencial.shopee_app_id,
        appSecret: descriptografar(credencial.shopee_app_secret),
      };
    } catch {
      // Credencial ilegível: ignora e usa a da casa.
      credenciais = undefined;
    }
  }

  try {
    const produtos = await fetchProdutos({
      keyword: limpo,
      limit: LIMITE_BUSCA,
      credenciais,
    });
    return { ok: true, produtos };
  } catch (erro) {
    console.error(
      "[busca-shopee] falhou:",
      erro instanceof Error ? erro.message : erro,
    );
    return { ok: false, erro: "Não deu pra buscar na Shopee agora. Tenta de novo." };
  }
}
