import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { segredoConfere, validarPayloadCakto } from "@/lib/cakto/validacao";
import { EVENTO_COMPRA_APROVADA } from "@/lib/cakto/tipos";
import { dispararCompraMeta } from "@/lib/meta/conversions";

const SECRET = process.env.CAKTO_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/cakto
 *
 * Recebe "Compra aprovada" da Cakto e libera o acesso:
 * 1. Confere o `secret` do corpo (a Cakto não usa HMAC).
 * 2. Cria o user no Supabase Auth (ou reaproveita se já existe).
 * 3. Grava a compra em `compras` — `cakto_order_id` é a chave de idempotência.
 * 4. Dispara o magic link de acesso.
 *
 * Payload: https://docs.cakto.com.br/conceitos/webhooks
 * A Cakto reenvia até 5x e espera um 2xx em até 8s.
 */
export async function POST(request: NextRequest) {
  if (!SECRET) {
    console.error("[webhook] CAKTO_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ erro: "config" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ erro: "json_invalido" }, { status: 400 });
  }

  if (!validarPayloadCakto(payload)) {
    console.error("[webhook] payload fora do esquema esperado");
    return NextResponse.json({ erro: "payload_invalido" }, { status: 400 });
  }

  if (!segredoConfere(payload.secret, SECRET)) {
    console.warn("[webhook] secret inválido");
    return NextResponse.json({ erro: "nao_autorizado" }, { status: 401 });
  }

  // Só "compra aprovada" libera acesso. Os outros eventos (pix_gerado,
  // refund, etc.) chegam aqui e são reconhecidos sem ação.
  if (payload.event !== EVENTO_COMPRA_APROVADA) {
    return NextResponse.json({ ok: true, ignorado: payload.event });
  }

  const orderId = payload.data.id;
  const email = payload.data.customer.email.trim().toLowerCase();
  const nome = payload.data.customer.name;

  try {
    const supabase = createAdminClient();

    // Idempotência: se já gravamos essa ordem, o acesso já foi liberado.
    const { data: jaProcessada } = await supabase
      .from("compras")
      .select("id")
      .eq("cakto_order_id", orderId)
      .maybeSingle();

    if (jaProcessada) {
      return NextResponse.json({ ok: true, repetido: true });
    }

    // Cria o user; se já existe, acha o id na lista.
    const { data: criado, error: erroCriar } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: nome ? { nome } : undefined,
      });

    let userId: string;
    if (erroCriar) {
      if (!/already|exists|registered/i.test(erroCriar.message)) {
        console.error("[webhook] falha ao criar user:", erroCriar);
        return NextResponse.json({ erro: "criar_user" }, { status: 500 });
      }
      const { data: lista } = await supabase.auth.admin.listUsers();
      const existente = lista?.users.find((u) => u.email === email);
      if (!existente) {
        console.error("[webhook] user não encontrado após conflito:", email);
        return NextResponse.json({ erro: "user_sumido" }, { status: 500 });
      }
      userId = existente.id;
    } else {
      userId = criado.user.id;
    }

    const { error: erroInsert } = await supabase.from("compras").insert({
      user_id: userId,
      email,
      lifetime: true,
      ebook_turbinar: false,
      cakto_order_id: orderId,
    });

    // Corrida: dois webhooks simultâneos da mesma ordem. O unique constraint
    // barra o segundo — não é erro real, o acesso já está liberado.
    if (erroInsert && erroInsert.code !== "23505") {
      console.error("[webhook] falha ao gravar compra:", erroInsert);
      return NextResponse.json({ erro: "gravar_compra" }, { status: 500 });
    }

    const { error: erroLink } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/confirm?next=/app/vitrine`,
        shouldCreateUser: false,
      },
    });

    if (erroLink) {
      // Não é fatal: user e compra já existem. Dá pra reenviar o link à mão.
      console.warn("[webhook] falha ao enviar magic link:", erroLink.message);
    }

    dispararCompraMeta({
      email,
      valor: payload.data.baseAmount ?? 0,
      moeda: "BRL",
      origem: request.nextUrl.origin,
    });

    console.log(`[webhook] ok — ordem ${orderId} liberada pra ${email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] erro inesperado:", err);
    return NextResponse.json({ erro: "inesperado" }, { status: 500 });
  }
}
