import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Protects every route under /app: only a Supabase session created by the
 * Cakto webhook's magic link grants access. There is no self-signup — see
 * "Arquitetura Pós-Pagamento" in PLAN.md.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <>{children}</>;
}
