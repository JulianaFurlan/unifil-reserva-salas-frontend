import { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './authContextObject';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('token');

    const carregarUsuario = async () => {
      try {
        const response = await api.get('/auth/me');
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { usuario } = response.data;

      localStorage.setItem('user', JSON.stringify(usuario));
      setUser(usuario);

      return { success: true, user: usuario };
    } catch (error) {
      const mensagem = error.response
        ? error.response.data?.message || 'Email ou senha inválidos'
        : 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
      return { success: false, message: mensagem };
    }
  };

  const logout = async () => {
    localStorage.removeItem('user');
    setUser(null);

    try {
      await api.post('/auth/logout');
    } catch {
      // mesmo se o backend falhar, o usuario ja foi deslogado localmente
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
