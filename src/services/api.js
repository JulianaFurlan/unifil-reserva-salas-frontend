<<<<<<< HEAD
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
=======
import axios from 'axios';

const api = axios.create({
baseURL: '/api',
timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use(
(config) => {
const token = localStorage.getItem('token');
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
return config;
},
(error) => Promise.reject(error)
);

// Interceptor para tratar erro 401
api.interceptors.response.use(
(response) => response,
(error) => {
if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}
return Promise.reject(error);
}
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
);

export default api;