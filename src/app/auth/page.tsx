'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getOrCreateProfile } from '@/lib/auth-helpers';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Auth] ========== INÍCIO ==========');
    console.log('[Auth] Modo:', isLogin ? 'LOGIN' : 'CADASTRO');
    console.log('[Auth] Email:', email);
    console.log('[Auth] Senha length:', password.length);
    console.log('[Auth] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[Auth] Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login com Supabase
        console.log('[Auth] 🔐 Chamando supabase.auth.signInWithPassword...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('[Auth] Resposta do login:', { 
          hasUser: !!data.user, 
          hasSession: !!data.session,
          error: error?.message 
        });

        if (error) {
          console.error('[Auth] ❌ Erro ao fazer login:', error);
          setMessage(`❌ ${error.message}`);
          setLoading(false);
          return;
        }
        
        console.log('[Auth] ✅ Login bem-sucedido:', data.user?.email);
        console.log('[Auth] User ID:', data.user?.id);
        
        // Buscar ou criar perfil usando helper
        if (data.user) {
          console.log('[Auth] 📝 Buscando/criando perfil...');
          const profile = await getOrCreateProfile(data.user.id, data.user.email!);
          console.log('[Auth] Perfil retornado:', profile);
          
          // Salvar também no localStorage para compatibilidade
          localStorage.setItem('visagio_user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
          }));
        }
        
        console.log('[Auth] 🚀 Redirecionando para dashboard...');
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/dashboard');
        
      } else {
        // Cadastro com Supabase
        console.log('[Auth] 📝 Chamando supabase.auth.signUp...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              email: email,
            }
          },
        });

        console.log('[Auth] Resposta do cadastro:', { 
          hasUser: !!data.user,
          userId: data.user?.id,
          hasSession: !!data.session,
          error: error?.message 
        });

        if (error) {
          console.error('[Auth] ❌ Erro ao fazer cadastro:', error);
          setMessage(`❌ ${error.message}`);
          setLoading(false);
          return;
        }

        console.log('[Auth] ✅ Cadastro realizado!');
        console.log('[Auth] User:', data.user?.email);
        console.log('[Auth] User ID:', data.user?.id);
        console.log('[Auth] Tem sessão?', !!data.session);

        // Verificar se precisa de confirmação de email
        if (data.user && !data.session) {
          console.log('[Auth] ⚠️ Confirmação de email necessária (session null)');
          setMessage('✅ Cadastro realizado! Verifique seu e-mail para confirmar.');
          setLoading(false);
          return;
        }

        // Se a sessão foi criada imediatamente (email confirmation desabilitado)
        if (data.user && data.session) {
          console.log('[Auth] ✅ Sessão criada imediatamente!');
          console.log('[Auth] 📝 Criando perfil na tabela profiles...');
          
          // Criar perfil usando helper
          const profile = await getOrCreateProfile(data.user.id, data.user.email!);
          console.log('[Auth] Perfil criado/retornado:', profile);

          // Salvar no localStorage
          localStorage.setItem('visagio_user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
          }));

          console.log('[Auth] 🚀 Redirecionando para dashboard...');
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push('/dashboard');
        } else {
          console.log('[Auth] ⚠️ Situação inesperada - user existe mas não tem session');
          console.log('[Auth] Data completo:', JSON.stringify(data, null, 2));
        }
      }
    } catch (error: any) {
      console.error('[Auth] 💥 EXCEÇÃO CAPTURADA:', error);
      console.error('[Auth] Stack:', error.stack);
      setMessage(`❌ Erro: ${error.message}`);
      setLoading(false);
    } finally {
      console.log('[Auth] ========== FIM ==========');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Visagio Pro
          </Link>
        </div>
      </header>

      <main className="pt-24 px-4 pb-12 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar para Home
          </Link>

          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent">
                  {isLogin ? 'Bem-vindo de Volta' : 'Criar Conta'}
                </span>
              </h1>
              <p className="text-gray-400">
                {isLogin ? 'Entre para acessar sua conta' : 'Comece sua jornada de transformação'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8A2BE2] transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha {!isLogin && <span className="text-gray-500">(mínimo 6 caracteres)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8A2BE2] transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #9D4EDD 100%)',
                  boxShadow: '0 10px 40px rgba(138, 43, 226, 0.5)'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </span>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isLogin ? (
                  <>Não tem uma conta? <span className="text-[#8A2BE2] font-medium">Cadastre-se</span></>
                ) : (
                  <>Já tem uma conta? <span className="text-[#8A2BE2] font-medium">Fazer Login</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
