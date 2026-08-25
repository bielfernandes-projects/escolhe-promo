"use client";

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-16 text-center">
      <div className="text-5xl">😕</div>
      <h1 className="mt-4 text-xl font-bold">Deu ruim aqui</h1>
      <p className="mt-2 text-sm text-tinta-fraca">
        Algo falhou do nosso lado. Tente de novo — se insistir, feche e abra o app.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-marca-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-marca-700"
      >
        Tentar de novo
      </button>
      {error.digest && (
        <p className="mt-4 font-mono text-[11px] text-tinta-fraca">
          código: {error.digest}
        </p>
      )}
    </main>
  );
}
