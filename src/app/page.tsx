'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Star, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Visagio Pro
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Transforme Seu
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent">
                Potencial Facial
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Descubra seu verdadeiro potencial com análise facial avançada por IA.
              Receba um plano personalizado de 30 dias para realçar sua beleza natural.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <button
              onClick={handleStart}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8A2BE2 0%, #9D4EDD 100%)',
                boxShadow: '0 10px 40px rgba(138, 43, 226, 0.5)'
              }}
            >
              <Sparkles className="w-6 h-6" />
              <span>Descobrir Meu Potencial Facial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8A2BE2] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Análise por IA</h3>
              <p className="text-gray-400">
                Tecnologia avançada analisa sua morfologia facial e identifica pontos de harmonia únicos.
              </p>
            </div>

            <div className="glass-card">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8A2BE2] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Plano Personalizado</h3>
              <p className="text-gray-400">
                Receba um cronograma detalhado de 30 dias com dicas práticas e produtos recomendados.
              </p>
            </div>

            <div className="glass-card">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8A2BE2] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Resultados Reais</h3>
              <p className="text-gray-400">
                Transforme sua aparência com orientações especializadas baseadas em sua estrutura facial.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-gray-500 mb-4">Tecnologia confiável e segura</p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <span>🔒 Privacidade garantida</span>
              <span>🤖 IA avançada</span>
              <span>⭐ Resultados comprovados</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}