"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { excedeuLimite } from "@/lib/seguranca/limite-tentativas";

const DIAS_TESTE = 7;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Cria a conta do teste grátis de 7 dias.
 *
 * Espelha o webhook da Cakto: cria o user no Auth (service role, então o
 * "Allow new users to sign up" do painel segue desligado), grava uma linha em
 * `compras` — mas SEM `cakto_order_id` e com `trial_expira_em = agora + 7d` —
 * e dispara o magic link de acesso.
 *
 * ponytail: sem dedup por e-mail+truque (joao+1@, joao+2@...). É abuso aceito
 * nesta escala; se aparecer de verdade, adicionar heurística de e-mail/IP.
 */
export async function criarContaTeste(
  email: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (typeof email !== "string" || email.length < 3 || email.length > 320) {
    return { ok: false, erro: "Digite um e-mail válido." };
  }
  const alvo = email.trim().toLowerCase();
  if (!EMAIL_RE.test(alvo)) {
    return { ok: false, erro: "Digite um e-mail válido." };
  }

  const cab = await headers();
  const ip =
    (cab.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "sem-ip";
  // Teto por IP: cadastro em massa scriptado não passa. Não trava e-mail
  // individual (retentativa legítima de quem não recebeu o link).
  if (excedeuLimite(`cadastro:${ip}`, 5, 10 * 60 * 1000)) {
    return {
      ok: false,
      erro: "Muitas tentativas deste dispositivo. Tente de novo mais tarde.",
    };
  }

  const origem =
    cab.get("origin") ??
    `https://${cab.get("host") ?? "www.escolhepromo.com.br"}`;
  const admin = createAdminClient();

  // Já existe conta com esse e-mail? Não cria outra nem reinicia o teste —
  // manda pro login. (Reiniciar o teste no mesmo e-mail seria acesso grátis
  // pra sempre.)
  const { data: existentes } = await admin
    .from("compras")
    .select("id")
    .eq("email", alvo)
    .limit(1);
  if (existentes && existentes.length > 0) {
    return {
      ok: false,
      erro: "Esse e-mail já tem conta. Use a tela de login pra entrar.",
    };
  }

  const { data: criado, error: erroCriar } = await admin.auth.admin.createUser({
    email: alvo,
    email_confirm: true,
  });

  if (erroCriar || !criado?.user) {
    if (erroCriar && /already|exists|registered/i.test(erroCriar.message)) {
      return {
        ok: false,
        erro: "Esse e-mail já tem conta. Use a tela de login pra entrar.",
      };
    }
    console.error("[cadastro] falha ao criar user:", erroCriar?.message);
    return { ok: false, erro: "Não deu pra criar a conta agora. Tente de novo." };
  }

  // ponytail: o relógio do teste começa AGORA (no cadastro), não no 1º login.
  // O e-mail chega em segundos e 7 dias é folgado; "começou no login" seria
  // estado a mais pra rastrear.
  const expira = new Date(Date.now() + DIAS_TESTE * 864e5).toISOString();
  const { error: erroInsert } = await admin.from("compras").insert({
    user_id: criado.user.id,
    email: alvo,
    lifetime: false,
    trial_expira_em: expira,
  });

  if (erroInsert) {
    console.error("[cadastro] falha ao gravar teste:", erroInsert.message);
    return { ok: false, erro: "Não deu pra criar a conta agora. Tente de novo." };
  }

  const { error: erroLink } = await admin.auth.signInWithOtp({
    email: alvo,
    options: {
      emailRedirectTo: `${origem}/auth/confirm?next=/app/vitrine`,
      shouldCreateUser: false,
    },
  });
  if (erroLink) {
    // A conta já existe; a pessoa pode pedir o link de novo na tela de login.
    console.warn("[cadastro] falha ao enviar magic link:", erroLink.message);
  }

  return { ok: true };
}
