import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const mensagem = error.response?.data?.message || "Sua sessão expirou. Faça login novamente.";

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // a pagina de login le essa mensagem no proprio mount, ja que o
      // redirecionamento troca a pagina antes de qualquer toast poder aparecer aqui
      sessionStorage.setItem('mensagemLogin', mensagem);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;