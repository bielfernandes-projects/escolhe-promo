"use client";

import { useState } from "react";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    try {
      const response = await fetch("/api/test/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { url?: string; erro?: string };

      if (!response.ok) {
        setMensagem(`❌ ${data.erro || "Erro ao gerar magic link"}`);
        return;
      }

      if (data.url) {
        setMensagem(
          `✅ Magic link gerado! Clique aqui pra fazer login:\n${data.url}`,
        );
      }
    } catch (err) {
      setMensagem(`❌ ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login de Teste</h1>
        <p className="text-gray-600 mb-6 text-sm">
          (Página de teste — não existe no app real)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@example.com"
              required
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {carregando ? "Gerando..." : "Gerar Magic Link"}
          </button>
        </form>

        {mensagem && (
          <div
            className={`mt-6 p-4 rounded text-sm whitespace-pre-wrap ${
              mensagem.startsWith("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {mensagem}
            {mensagem.startsWith("✅") && (
              <div className="mt-3">
                <a
                  href={mensagem.split("\n")[1]}
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 text-sm"
                >
                  👉 Clica aqui pra fazer login
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">
            Ou volta pra:{" "}
          </p>
          <a href="/" className="text-blue-600 font-semibold hover:underline">
            ← Landing
          </a>
        </div>
      </div>
    </div>
  );
}
