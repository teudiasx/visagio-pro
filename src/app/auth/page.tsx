'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (useMagicLink) {
        // Magic Link
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/quiz`,
          },
        });

        if (error) throw error;
        setMessage('✅ Magic link enviado! Verifique seu e-mail.');
      } else if (isLogin) {
        // Login com senha
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.session) {
          // Aguardar um momento para garantir que a sessão foi salva nos cookies
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Forçar refresh da página para atualizar o middleware
          window.location.href = '/quiz';
        }
      } else {
        // Cadastro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/quiz`,
            data: {
              email: email,
            }
          },
        });

        if (error) throw error;

        // Verificar se precisa de confirmação de email
        if (data.user && !data.session) {
          setMessage('✅ Cadastro realizado! Verifique seu e-mail para confirmar.');
          return;
        }

        // Se a sessão foi criada imediatamente (email confirmation desabilitado)
        if (data.user && data.session) {
          // Criar perfil do usuário
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              subscription_status: 'standard',
            });

          if (profileError && profileError.code !== '23505') { // Ignora erro de duplicata
            console.error('Erro ao criar perfil:', profileError);
          }

          // Aguardar um momento para garantir que tudo foi salvo
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirecionar
          window.location.href = '/quiz';
        }
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Botão Voltar */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/"
          className="text-[#E0E0E0] hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
      </div>

      {/* Card Glassmorphism */}
      <div 
        className="w-full max-w-md p-8 rounded-2xl relative"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #8A2BE2',
          boxShadow: '0 8px 32px 0 rgba(138, 43, 226, 0.2)',
        }}
      >
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
        </h1>
        <p className="text-[#E0E0E0] text-center mb-8">
          {isLogin ? 'Entre para continuar sua jornada' : 'Comece sua transformação hoje'}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#E0E0E0] mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#8A2BE2]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#8A2BE2] transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha (apenas se não for Magic Link) */}
          {!useMagicLink && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#8A2BE2]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#8A2BE2] transition-colors"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {/* Toggle Magic Link */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-sm text-[#8A2BE2] hover:text-[#9D4EDD] transition-colors"
            >
              {useMagicLink ? 'Usar senha' : 'Usar Magic Link'}
            </button>
          </div>

          {/* Mensagem */}
          {message && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #8A2BE2 0%, #9D4EDD 100%)',
              boxShadow: '0 4px 15px 0 rgba(138, 43, 226, 0.4)',
            }}
          >
            {loading ? 'Processando...' : useMagicLink ? 'Enviar Magic Link' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {/* Toggle Login/Cadastro */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
            }}
            className="text-sm text-[#E0E0E0] hover:text-white transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}
