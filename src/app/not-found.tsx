import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-16 text-center">
      <div className="text-5xl">🔎</div>
      <h1 className="mt-4 text-xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-sm text-tinta-fraca">
        O link que você abriu não existe mais.
      </p>
      <Link
        href="/app/vitrine"
        className="mt-6 rounded-xl bg-marca-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-marca-700"
      >
        Ir pra Vitrine
      </Link>
    </main>
  );
}
