import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  segredoConfere,
  validarPayloadCakto,
  temEmailComprador,
} from "@/lib/cakto/validacao";
import { EVENTO_COMPRA_APROVADA, EVENTOS_REEMBOLSO } from "@/lib/cakto/tipos";
import { dispararCompraMeta } from "@/lib/meta/conversions";

const SECRET = process.env.CAKTO_WEBHOOK_SECRET;

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Acha o id de um usuario que ja existe, pelo e-mail.
 *
 * NAO usa `listUsers()` sem paginar: ele so devolve os 50 primeiros usuarios,
 * entao um comprador recorrente alem do #50 caia em "user_sumido" (500), a
 * Cakto reenviava 5x, todas falhavam, e o cliente pagava sem receber acesso.
 *
 * Caminho rapido: quem ja comprou tem linha em `compras` com o user_id.
 * Fallback: varre as paginas do Auth (poucas nesta escala).
 */
async function acharUserPorEmail(
  admin: Admin,
  email: string,
): Promise<string | null> {
  const { data: compra } = await admin
    .from("compras")
    .select("user_id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (compra?.user_id) return compra.user_id as string;

  for (let pagina = 1; pagina <= 40; pagina++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page: pagina,
      perPage: 1000,
    });
    if (error) break;
    const achado = data.users.find((u) => u.email === email);
    if (achado) return achado.id;
    if (data.users.length < 1000) break;
  }
  return null;
}

/**
 * POST /api/webhooks/cakto
 *
 * "Compra aprovada" (`purchase_approved`) libera o acesso:
 * 1. Confere o `secret` do corpo (a Cakto não usa HMAC).
 * 2. Cria o user no Supabase Auth (ou reaproveita se já existe).
 * 3. Grava a compra em `compras` — `cakto_order_id` é a chave de idempotência.
 * 4. Dispara o magic link de acesso.
 *
 * "Reembolso"/"Chargeback" (`refund`/`chargeback`) revogam: marcam
 * `compras.reembolsada_em`, e o layout de /app passa a barrar o user.
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

  // Reembolso / chargeback: marca a compra e encerra. O layout de /app cuida
  // de barrar o acesso na próxima navegação.
  // ponytail: assume que `data.id` no evento de refund é o mesmo order_id da
  // compra. Confirmar no primeiro reembolso real; se a Cakto mandar outro
  // campo, ajustar aqui.
  if ((EVENTOS_REEMBOLSO as readonly string[]).includes(payload.event)) {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("compras")
      .update({ reembolsada_em: new Date().toISOString() })
      .eq("cakto_order_id", payload.data.id)
      .is("reembolsada_em", null);

    if (error) {
      console.error("[webhook] falha ao revogar acesso:", error);
      return NextResponse.json({ erro: "revogar" }, { status: 500 });
    }

    console.log(
      `[webhook] acesso revogado — ordem ${payload.data.id} (${payload.event})`,
    );
    return NextResponse.json({ ok: true, revogado: true });
  }

  // Os demais eventos (pix_gerado, boleto_gerado...) são reconhecidos sem ação.
  if (payload.event !== EVENTO_COMPRA_APROVADA) {
    return NextResponse.json({ ok: true, ignorado: payload.event });
  }

  const emailBruto = payload.data.customer?.email;
  if (!temEmailComprador(payload) || !emailBruto) {
    console.error("[webhook] compra aprovada sem customer.email");
    return NextResponse.json({ erro: "sem_email" }, { status: 400 });
  }

  const orderId = payload.data.id;
  const email = emailBruto.trim().toLowerCase();
  const nome = payload.data.customer?.name;

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
      const existente = await acharUserPorEmail(supabase, email);
      if (!existente) {
        console.error("[webhook] user não encontrado após conflito:", email);
        return NextResponse.json({ erro: "user_sumido" }, { status: 500 });
      }
      userId = existente;
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

    // O acesso (user + compra) ja esta gravado — a partir daqui e "melhor
    // esforco". Sai DEPOIS da resposta pra Cakto: o handshake SMTP do Resend
    // custava ~3s e, somado ao resto, empurrava o webhook pros 8s de timeout
    // da Cakto, que entao reenviava e podia acabar desistindo.
    const origem = request.nextUrl.origin;
    const valorMeta = payload.data.baseAmount ?? 0;

    after(async () => {
      const { error: erroLink } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origem}/auth/confirm?next=/app/vitrine`,
          shouldCreateUser: false,
        },
      });
      if (erroLink) {
        console.warn("[webhook] falha ao enviar magic link:", erroLink.message);
      }
      await dispararCompraMeta({
        email,
        valor: valorMeta,
        moeda: "BRL",
        origem,
      });
    });

    console.log(`[webhook] ok — ordem ${orderId} liberada pra ${email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] erro inesperado:", err);
    return NextResponse.json({ erro: "inesperado" }, { status: 500 });
  }
}
