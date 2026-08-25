import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validarAssinaturaCakto, validarPayloadCakto } from "@/lib/cakto/validacao";
import { temLifetimeDeal, temOrderBump } from "@/lib/cakto/tipos";
import { dispararCompraMeta } from "@/lib/meta/conversions";

const SECRET = process.env.CAKTO_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/cakto
 *
 * Recebe compras completadas do Cakto. Fluxo:
 * 1. Validar assinatura HMAC-SHA256
 * 2. Parsear payload e validar estrutura
 * 3. Criar/encontrar user no Supabase Auth
 * 4. Gravar flags de liberação (`lifetime`, `ebook_turbinar`) na tabela `compras`
 * 5. Disparar magic link pra dar acesso ao app
 *
 * Documentação Cakto: https://docs.cakto.com.br/webhooks
 */
export async function POST(request: NextRequest) {
  if (!SECRET) {
    console.error("[webhook] CAKTO_WEBHOOK_SECRET não configurado");
    return NextResponse.json(
      { erro: "Secret não configurado (falha do servidor)" },
      { status: 500 },
    );
  }

  // 1. Ler corpo como string pra validar assinatura
  let corpo: string;
  try {
    corpo = await request.text();
  } catch (err) {
    console.error("[webhook] Falha ao ler corpo:", err);
    return NextResponse.json(
      { erro: "Corpo inválido" },
      { status: 400 },
    );
  }

  const assinatura = request.headers.get("x-cakto-signature");
  if (!validarAssinaturaCakto(corpo, assinatura, SECRET)) {
    return NextResponse.json(
      { erro: "Assinatura inválida" },
      { status: 401 },
    );
  }

  // 2. Parsear e validar payload
  let payload;
  try {
    payload = JSON.parse(corpo);
  } catch (err) {
    console.error("[webhook] JSON inválido:", err);
    return NextResponse.json(
      { erro: "JSON inválido" },
      { status: 400 },
    );
  }

  if (!validarPayloadCakto(payload)) {
    console.error("[webhook] Payload não bate com o esquema esperado");
    return NextResponse.json(
      { erro: "Payload inválido" },
      { status: 400 },
    );
  }

  // Idempotência: ignore se já processamos essa compra
  if (
    payload.event !== "purchase.completed" &&
    payload.event !== "purchase.confirmed"
  ) {
    console.log(`[webhook] Ignorando evento ${payload.event} (não é compra)`);
    return NextResponse.json({ ok: true });
  }

  const { order_id, customer_email, customer_name } = payload.data;
  const lifetime = temLifetimeDeal(payload);
  const ebook = temOrderBump(payload);

  if (!lifetime) {
    // Order bump sem Lifetime Deal? Algo errado — rejeita.
    console.warn(
      `[webhook] Order ${order_id} não tem Lifetime Deal (ordem inválida)`,
    );
    return NextResponse.json(
      { erro: "Compra sem Lifetime Deal" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();

    // 3. Criar/encontrar usuário
    // Tenta criar; se já existe, a função vai retornar o user_already_exists.
    const { data: userData, error: createError } = await supabase.auth.admin.createUser(
      {
        email: customer_email,
        user_metadata: {
          nome: customer_name,
        },
      },
    );

    // Se o erro é "User already exists", é ok — vamos usar o user existente
    let userId: string;
    if (createError) {
      if (createError.message.includes("already exists")) {
        // Buscar o user existente
        const { data: listData } = await supabase.auth.admin.listUsers();
        const user = listData?.users?.find((u) => u.email === customer_email);
        if (!user) {
          console.error(`[webhook] User não encontrado: ${customer_email}`);
          return NextResponse.json(
            { erro: "User não encontrado" },
            { status: 500 },
          );
        }
        userId = user.id;
      } else {
        console.error(`[webhook] Falha ao criar user:`, createError);
        return NextResponse.json(
          { erro: "Falha ao criar user" },
          { status: 500 },
        );
      }
    } else {
      userId = userData.user.id;
    }

    // 4. Gravar compra na tabela
    const { error: insertError } = await supabase
      .from("compras")
      .insert({
        user_id: userId,
        email: customer_email,
        lifetime,
        ebook_turbinar: ebook,
        cakto_order_id: order_id,
      });

    if (insertError) {
      console.error(`[webhook] Falha ao gravar compra:`, insertError);
      return NextResponse.json(
        { erro: "Falha ao gravar compra" },
        { status: 500 },
      );
    }

    // 5. Disparar magic link de acesso.
    //
    // Precisa ser signInWithOtp, nao admin.generateLink: generateLink apenas
    // devolve o link, sem enviar e-mail nenhum — o comprador ficaria sem nada.
    //
    // O emailRedirectTo aponta pro /auth/confirm, nunca direto pra uma pagina
    // protegida: e la que o token vira sessao. Mandar direto pro /app faz o
    // comprador cair no login sem nunca ter sido logado.
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email: customer_email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/confirm?next=/app/vitrine`,
        // O usuario ja foi criado no passo anterior.
        shouldCreateUser: false,
      },
    });

    if (linkError) {
      // Não é falha fatal — o user foi criado e a compra foi gravada.
      // A magic link pode ser disparada manualmente depois.
      console.warn(`[webhook] Falha ao gerar magic link:`, linkError);
    }

    // Conversion API do Meta: nao bloqueia a resposta do webhook nem falha
    // se der erro (metrica de anuncio nunca pode impedir a liberacao real).
    dispararCompraMeta({
      email: customer_email,
      valor: payload.data.total_price,
      moeda: payload.data.currency,
      origem: request.nextUrl.origin,
    });

    console.log(`[webhook] ✓ Processado order ${order_id} para ${customer_email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[webhook] Erro inesperado:`, err);
    return NextResponse.json(
      { erro: "Erro inesperado" },
      { status: 500 },
    );
  }
}
