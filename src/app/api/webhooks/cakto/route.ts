import { NextRequest, NextResponse } from "next/server";

/**
 * Receives payment confirmation events from Cakto (Lifetime Deal purchase,
 * optionally with the "ebook Turbinar" order bump). Real signature
 * verification and the Supabase Admin API calls (create/find user, write to
 * `compras`, send magic link) are implemented in a follow-up session — see
 * "Arquitetura Pós-Pagamento" in PLAN.md.
 */
export async function POST(request: NextRequest) {
  const payload = await request.json();

  console.log("[cakto webhook] received payload", payload);

  return NextResponse.json({ received: true });
}
