import { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      console.log('[useAuth] 🔍 Buscando perfil do Supabase para:', email);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[useAuth] ❌ Erro ao buscar perfil:', error);
        // Usar perfil mock se houver erro
        return {
          id: userId,
          email: email,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      if (profileData) {
        console.log('[useAuth] ✅ Perfil encontrado:', {
          email: profileData.email,
          status: profileData.subscription_status
        });
        return profileData;
      }

      console.log('[useAuth] ⚠️ Perfil não encontrado, usando mock');
      return {
        id: userId,
        email: email,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[useAuth] ❌ Exceção ao buscar perfil:', error);
      return {
        id: userId,
        email: email,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      console.log('[useAuth] Verificando autenticação...');
      // Verificar se há usuário no localStorage
      const savedUser = localStorage.getItem('visagio_user');
      if (savedUser) {
        try {
          console.log('[useAuth] Usuário encontrado no localStorage');
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Buscar perfil real do Supabase
          const profileData = await fetchProfile(userData.id, userData.email);
          setProfile(profileData);
        } catch (error) {
          console.error('[useAuth] Erro ao parsear dados do usuário:', error);
          localStorage.removeItem('visagio_user');
        }
      } else {
        console.log('[useAuth] Nenhum usuário encontrado no localStorage');
      }
      console.log('[useAuth] Autenticação verificada');
      setLoading(false);
    };

    loadAuth();
  }, []);

  const login = (email: string, password: string) => {
    console.log('[useAuth] Login iniciado para:', email);
    // Simulação de login - aceitar qualquer email/senha
    const mockUser = {
      id: 'mock-' + Date.now(),
      email: email,
    };
    console.log('[useAuth] Mock user criado:', mockUser.id);
    localStorage.setItem('visagio_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setProfile({
      id: mockUser.id,
      email: mockUser.email,
      subscription_status: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return Promise.resolve(mockUser);
  };

  const logout = () => {
    console.log('[useAuth] Logout realizado');
    localStorage.removeItem('visagio_user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('[useAuth] 🔄 Atualizando perfil...');
      const profileData = await fetchProfile(user.id, user.email);
      setProfile(profileData);
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshProfile,
  };
}