// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
<<<<<<< HEAD
    console.log('🔍 Carregando dados salvos - Token:', !!token, 'User:', !!userData);
    
=======
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.Authorization = `Bearer ${token}`;
<<<<<<< HEAD
        console.log('✅ Usuário carregado do localStorage:', parsedUser.email);
      } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error);
=======
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
<<<<<<< HEAD
      console.log('📤 Enviando requisição para /auth/login');
      const response = await api.post('/auth/login', { email, senha });
      console.log('📥 Resposta recebida:', response.data);
      
      const { token, usuario } = response.data;
      
      if (!token) {
        console.error('❌ Token não encontrado na resposta!');
        return { success: false, message: 'Token não recebido' };
      }
      
      console.log('💾 Salvando token e usuário no localStorage');
=======
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data;
      
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(usuario);
      
      return { success: true, user: usuario };
    } catch (error) {
<<<<<<< HEAD
      console.error('❌ Erro no login:', error);
=======
      console.error('Erro no login:', error);
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email ou senha inválidos' 
      };
    }
  };

  const logout = () => {
<<<<<<< HEAD
    console.log('🔓 Fazendo logout');
=======
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}