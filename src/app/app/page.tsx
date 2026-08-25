import { redirect } from "next/navigation";

/**
 * A Vitrine e a unica porta de entrada util do app. Uma tela intermediaria so
 * adicionava um toque a mais pra quem esta no celular.
 */
export default function AppHome() {
  redirect("/app/vitrine");
}
