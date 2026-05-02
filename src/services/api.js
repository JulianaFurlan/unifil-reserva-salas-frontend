// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

// Interceptor para ADICIONAR token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token sendo enviado:', token ? 'Existe' : 'NÃO EXISTE'); // ← LOG DE DEBUG
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Nenhum token encontrado no localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Erro 401/403 - Token inválido ou expirado');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;