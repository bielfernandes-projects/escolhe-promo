import { createAdminClient } from "@/lib/supabase/admin";

type CaktoOrder = {
  id: string;
  customer_email: string;
  customer_name?: string;
  status: string;
};

export async function POST(req: Request) {
  try {
    const order: CaktoOrder = await req.json();

    if (!order.customer_email) {
      return Response.json(
        { erro: "email_obrigatorio" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { data: existente } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", order.customer_email)
      .single();

    if (!existente) {
      // Cria user novo e envia magic link
      await supabase.auth.admin.createUser({
        email: order.customer_email,
        email_confirm: true,
      });
    }

    // Envia magic link (Supabase manda email automaticamente)
    await supabase.auth.signInWithOtp({
      email: order.customer_email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/app/vitrine`,
      },
    });

    return Response.json(
      { ok: true, order_id: order.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("[webhook] erro:", err);
    return Response.json(
      { erro: err instanceof Error ? err.message : "webhook_error" },
      { status: 500 }
    );
  }
}
