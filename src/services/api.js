import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const ehAuth = error.config?.url?.includes('/auth/');

    if (error.response?.status === 401 && !ehAuth) {
      const mensagem = error.response?.data?.message || "Sua sessão expirou. Faça login novamente.";

      localStorage.removeItem('user');

      sessionStorage.setItem('mensagemLogin', mensagem);
      window.location.href = '/login';
    }

    if (error.response?.status === 403 && !error.response.data?.message) {
      error.response.data = { message: 'Você não tem permissão para realizar esta ação.' };
    }

    return Promise.reject(error);
  }
);

export default api;