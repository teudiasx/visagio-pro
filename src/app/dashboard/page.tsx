'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { Sparkles, ArrowRight, FileText, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Login removido temporariamente - dashboard acessível sem autenticação
  // Futuramente será reabilitado

  const handleLogout = async () => {
    logout();
    setShowDropdown(false);
    router.push('/');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const isPremium = profile?.subscription_status === 'premium';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Dashboard acessível sem login
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-3xl font-extrabold bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Visagio Pro
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#9D4EDD] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {getInitials(user?.email || 'U')}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPremium
                  ? 'bg-gradient-to-r from-[#8A2BE2] to-[#FFD700] text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {isPremium ? 'Premium' : 'Standard'}
              </div>
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  boxShadow: '0 0 30px rgba(138, 43, 226, 0.4)'
                }}
              >
                <div className="p-4 space-y-4">
                  <div className="pb-3 border-b border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">Conta</p>
                    <p className="text-white text-sm font-medium truncate">{user?.email || 'Usuário'}</p>
                  </div>

                  <div className="pb-3 border-b border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    <p className={`text-sm font-bold ${isPremium ? 'text-[#8A2BE2]' : 'text-gray-300'}`}>
                      {isPremium ? '⭐ Plano Premium Ativo' : 'Plano Standard'}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-12 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bem-vindo! 👋
          </h1>
          <p className="text-xl text-gray-400">
            Pronto para descobrir seu potencial facial?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Nova Análise */}
          <Link
            href="/quiz"
            className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8A2BE2 0%, #9D4EDD 100%)',
              boxShadow: '0 10px 40px rgba(138, 43, 226, 0.5)'
            }}
          >
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-white mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Nova Análise Facial
              </h2>
              <p className="text-white/80 mb-4">
                Comece sua jornada de transformação com nossa IA
              </p>
              <div className="flex items-center gap-2 text-white font-semibold">
                Começar agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Minhas Análises */}
          <div
            className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(138, 43, 226, 0.3)'
            }}
          >
            <FileText className="w-12 h-12 text-[#8A2BE2] mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Minhas Análises
            </h2>
            <p className="text-gray-400 mb-4">
              Você ainda não possui análises salvas
            </p>
            <p className="text-gray-500 text-sm">
              Complete seu primeiro quiz para ver seus resultados aqui
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(138, 43, 226, 0.3)'
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Seu Plano Atual
              </h3>
              <p className="text-gray-400">
                {isPremium
                  ? 'Você tem acesso completo a todas as funcionalidades'
                  : 'Faça upgrade para desbloquear todas as semanas'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isPremium
                ? 'bg-gradient-to-r from-[#8A2BE2] to-[#FFD700] text-white'
                : 'bg-gray-700 text-gray-300'
            }`}>
              {isPremium ? 'Premium' : 'Standard'}
            </div>
          </div>

          {!isPremium && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-[#8A2BE2]"></div>
                <span>Acesso às 2 primeiras semanas</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <span>Semanas 3 e 4 bloqueadas</span>
              </div>

              <Link
                href="/pricing"
                className="inline-block mt-4 px-6 py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #9D4EDD 100%)',
                  boxShadow: '0 5px 20px rgba(138, 43, 226, 0.4)'
                }}
              >
                Fazer Upgrade para Premium
              </Link>
            </div>
          )}

          {isPremium && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#8A2BE2]">
                <div className="w-2 h-2 rounded-full bg-[#8A2BE2]"></div>
                <span className="font-semibold">Todas as 4 semanas desbloqueadas</span>
              </div>
              <div className="flex items-center gap-3 text-[#8A2BE2]">
                <div className="w-2 h-2 rounded-full bg-[#8A2BE2]"></div>
                <span className="font-semibold">Suporte prioritário 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-[#8A2BE2]">
                <div className="w-2 h-2 rounded-full bg-[#8A2BE2]"></div>
                <span className="font-semibold">Análises ilimitadas</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}