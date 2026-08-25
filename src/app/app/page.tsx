"use client";

import Link from "next/link";

export default function AppHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo, Afiliado! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Crie copy única e imagens impactantes para vender mais produtos
            Shopee
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Card Vitrine */}
          <Link href="/app/vitrine">
            <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🛍️</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Vitrine</h2>
              <p className="text-gray-600 mb-4">
                Navegue pelos produtos em alta. Escolha um e comece a gerar!
              </p>
              <div className="text-blue-600 font-semibold">
                Explorar produtos →
              </div>
            </div>
          </Link>

          {/* Card Copy */}
          <div className="bg-white rounded-lg p-8 shadow-lg opacity-75">
            <div className="text-4xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Copy</h2>
            <p className="text-gray-600 mb-4">
              Gera copy única com Spintax. Sem repetição, sem LLM caro.
            </p>
            <div className="text-gray-400 font-semibold">
              Use na Vitrine ↓
            </div>
          </div>

          {/* Card Imagem */}
          <div className="bg-white rounded-lg p-8 shadow-lg opacity-75">
            <div className="text-4xl mb-4">📸</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Imagem</h2>
            <p className="text-gray-600 mb-4">
              Renderiza templates HTML direto no navegador. Zero servidor.
            </p>
            <div className="text-gray-400 font-semibold">
              Use na Vitrine ↓
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">5.760</div>
              <p className="text-gray-600 mt-2">Combinações de copy</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">3</div>
              <p className="text-gray-600 mt-2">Templates de imagem</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">100%</div>
              <p className="text-gray-600 mt-2">Client-side (zero custo)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
