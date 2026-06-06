import api from './api';

// SALAS
export const getSalas = () => api.get('/salas');
export const criarSala = (dados) => api.post('/salas', dados);
export const editarSala = (id, dados) => api.put(`/salas/${id}`, dados);
export const alterarStatusSala = (id, status) =>
    api.put(`/salas/${id}/status`, { status });
export const deletarSala = (id) => api.delete(`/salas/${id}`);

// USUARIOS
export const getUsuarios = () => api.get('/usuarios');
export const criarUsuario = (dados) => api.post('/usuarios', dados);
export const editarUsuario = (id, dados) => api.put(`/usuarios/${id}`, dados);
export const alterarAtivo = (id, ativo) =>
    api.put(`/usuarios/${id}/ativo`, { ativo });
export const resetarSenha = (id) => api.put(`/usuarios/${id}/resetar-senha`);