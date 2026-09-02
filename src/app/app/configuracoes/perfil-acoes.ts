"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizarHandle, validarHandle } from "@/lib/perfil/handle";
import { linkShopeeValido } from "@/lib/seguranca/urls";

type Resultado = { ok: boolean; erro?: string };

async function usuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Cria ou atualiza o perfil (handle + nome de exibição) da afiliada. */
export async function salvarPerfil(
  handleBruto: string,
  nomeExibicao: string,
): Promise<Resultado> {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false, erro: "Sessão expirada." };

  const handle = normalizarHandle(handleBruto);
  const check = validarHandle(handle);
  if (!check.ok) return { ok: false, erro: check.erro };

  const nome = nomeExibicao.trim();
  if (nome.length < 2) return { ok: false, erro: "Coloque seu nome." };
  if (nome.length > 60) return { ok: false, erro: "Nome muito longo." };

  // Handle já usado por outra pessoa?
  const { data: dono } = await supabase
    .from("perfis")
    .select("user_id")
    .eq("handle", handle)
    .maybeSingle();
  if (dono && dono.user_id !== user.id) {
    return { ok: false, erro: "Esse @ já está em uso." };
  }

  const { error } = await supabase.from("perfis").upsert({
    user_id: user.id,
    handle,
    nome_exibicao: nome,
    atualizado_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/@${handle}`);
  revalidatePath("/app/configuracoes");
  return { ok: true };
}

/** Reordena a vitrine: a posição no array vira o campo `ordem`. */
export async function reordenarVitrine(ids: string[]): Promise<Resultado> {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false, erro: "Sessão expirada." };

  if (!Array.isArray(ids) || ids.length > 500) {
    return { ok: false, erro: "Lista invalida." };
  }

  // Um update por linha; a lista da afiliada é pequena (dezenas, não milhares).
  const updates = ids.map((id, ordem) =>
    supabase
      .from("divulgacoes")
      .update({ ordem })
      .eq("id", id)
      .eq("user_id", user.id),
  );
  const resultados = await Promise.all(updates);
  const falhou = resultados.find((r) => r.error);
  if (falhou?.error) return { ok: false, erro: falhou.error.message };

  await revalidarVitrine(supabase, user.id);
  return { ok: true };
}

export async function alternarNaVitrine(
  id: string,
  valor: boolean,
): Promise<Resultado> {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false, erro: "Sessão expirada." };

  const { error } = await supabase
    .from("divulgacoes")
    .update({ na_vitrine: valor })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, erro: error.message };

  await revalidarVitrine(supabase, user.id);
  return { ok: true };
}

export async function removerDivulgacao(id: string): Promise<Resultado> {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false, erro: "Sessão expirada." };

  const { error } = await supabase
    .from("divulgacoes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, erro: error.message };

  await revalidarVitrine(supabase, user.id);
  return { ok: true };
}

/**
 * Para um produto que foi divulgado com o link genérico da casa: a afiliada
 * cola o link dela e o produto passa a valer na vitrine pública.
 */
export async function publicarComLinkProprio(
  id: string,
  link: string,
): Promise<Resultado> {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false, erro: "Sessão expirada." };

  const limpo = link.trim();
  if (!/shopee\.com\.br|shp\.ee|s\.shopee|shope\.ee/i.test(limpo)) {
    return { ok: false, erro: "Isso não parece um link da Shopee." };
  }

  const { error } = await supabase
    .from("divulgacoes")
    .update({ link_afiliado: limpo, usou_link_proprio: true, na_vitrine: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, erro: error.message };

  await revalidarVitrine(supabase, user.id);
  return { ok: true };
}

async function revalidarVitrine(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("perfis")
    .select("handle")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.handle) revalidatePath(`/@${data.handle}`);
  revalidatePath("/app/configuracoes");
}
