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
      
      try {
        const event = new CustomEvent("showToast", {
          detail: { type: "warning", message: mensagem, title: "Sessão Expirada" },
        });
        window.dispatchEvent(event);

        // espera o toast aparecer antes de mandar pro login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;