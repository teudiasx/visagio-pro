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
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
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
          email: profileData.email,
          status: profileData.subscription_status
        });
        return profileData;
      }

      return {
        id: userId,
        email: email,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
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
      // Verificar se há usuário no localStorage
      const savedUser = localStorage.getItem('visagio_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Buscar perfil real do Supabase
          const profileData = await fetchProfile(userData.id, userData.email);
          setProfile(profileData);
        } catch (error) {
          localStorage.removeItem('visagio_user');
        }
      } else {
      }
      setLoading(false);
    };

    loadAuth();
  }, []);

  const login = (email: string, password: string) => {
    // Simulação de login - aceitar qualquer email/senha
    const mockUser = {
      id: 'mock-' + Date.now(),
      email: email,
    };
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
    localStorage.removeItem('visagio_user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
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