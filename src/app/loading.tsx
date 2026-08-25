export default function Carregando() {
  return (
    <main className="flex flex-1 items-center justify-center py-24">
      <div
        role="status"
        aria-label="Carregando"
        className="h-8 w-8 animate-spin rounded-full border-4 border-marca-200 border-t-marca-600"
      />
    </main>
  );
}
