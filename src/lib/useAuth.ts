import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const savedUser = localStorage.getItem('visagio_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Criar perfil mock
        setProfile({
          id: userData.id,
          email: userData.email,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        localStorage.removeItem('visagio_user');
      }
    }
    setLoading(false);
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

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}