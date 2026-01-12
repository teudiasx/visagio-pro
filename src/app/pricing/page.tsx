import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Standard',
    oldPrice: 'R$ 49,90',
    price: 'R$ 19,90',
    period: 'mês',
    discount: '60% OFF',
    features: [
      'Análise Técnica Completa',
      'Harmonia Facial Básica',
      'Plano de Evolução - Parte 1',
      'Suporte por Email'
    ],
    buttonText: 'Assinar Standard',
    popular: false
  },
  {
    name: 'Premium',
    oldPrice: 'R$ 99,90',
    price: 'R$ 29,90',
    period: 'mês',
    discount: '70% OFF',
    features: [
      'Análise Técnica Completa',
      'Harmonia Facial Avançada',
      'Plano de Evolução Completo (4 partes)',
      'Suporte Prioritário 24/7',
      'Consultorias Exclusivas',
      'Materiais Premium'
    ],
    buttonText: 'Assinar Premium',
    popular: true
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#9D4EDD] mb-4">
            <span className="text-white font-bold text-sm">🔥 PREÇO DE LANÇAMENTO - OFERTA POR TEMPO LIMITADO</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-white">Escolha Seu Plano</h1>
          <p className="text-xl text-[#CCCCCC]">
            Por menos de R$ 30,00 você recebe uma consultoria completa de 30 dias
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`container-blur relative transition-all duration-300 ${
                plan.popular 
                  ? 'md:scale-105' 
                  : ''
              }`}
              style={{
                padding: '2rem',
                ...(plan.popular ? {
                  border: '3px solid #8A2BE2',
                  boxShadow: '0 0 50px rgba(138, 43, 226, 0.5), 0 10px 60px rgba(138, 43, 226, 0.3)'
                } : {})
              }}
            >
              {plan.popular && (
                <div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-8 py-2 rounded-full font-bold text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #6A1BB2 100%)',
                    boxShadow: '0 0 25px rgba(138, 43, 226, 0.7)'
                  }}
                >
                  ⭐ MAIS POPULAR
                </div>
              )}

              <div className="text-center mb-8 mt-4">
                <h2 className="text-3xl font-bold mb-3 text-white">{plan.name}</h2>
                <div className="mb-2">
                  <span className="text-xl text-gray-500 line-through">{plan.oldPrice}</span>
                </div>
                <div className="text-5xl font-bold text-[#8A2BE2] mb-2">
                  {plan.price}
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-green-500/20 border border-green-500/50 mb-3">
                  <span className="text-green-400 font-bold text-sm">{plan.discount} - Lançamento</span>
                </div>
                <div className="text-[#CCCCCC]">por {plan.period}</div>
                {plan.popular && (
                  <p className="text-[#8A2BE2] text-sm mt-2 font-semibold">Menos de R$ 1,00 por dia!</p>
                )}
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-6 h-6 text-[#8A2BE2] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-[#CCCCCC] text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <button 
                  className={`w-full ${plan.popular ? 'btn-primary text-lg' : 'btn-secondary'}`}
                  style={plan.popular ? {
                    boxShadow: '0 0 40px rgba(138, 43, 226, 0.6)'
                  } : {}}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/" className="text-[#CCCCCC] hover:text-white transition-colors text-lg">
            ← Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
