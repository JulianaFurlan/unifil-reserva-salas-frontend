// src/pages/admin/GerenciarUsuarios.jsx
import { useState, useEffect } from "react";
import { getUsuarios, criarUsuario, editarUsuario, alterarAtivo, resetarSenha } from "../../services/adminService";
import Toast from "../../components/common/Toast";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineReload } from "react-icons/ai";
import "../styles/reserva.css";

const FORM_VAZIO = {
nome: "", email: "", telefone: "", departamento: "", tipo: "COMUM"
};

export default function GerenciarUsuarios() {
const [usuarios, setUsuarios] = useState([]);
const [loading, setLoading] = useState(true);
const [toasts, setToasts] = useState([]);
const [modal, setModal] = useState({ aberto: false, usuario: null });
const [modalSenha, setModalSenha] = useState({ aberto: false, senha: "" });
const [form, setForm] = useState(FORM_VAZIO);
const [salvando, setSalvando] = useState(false);

const addToast = (type, message) => {
const id = Date.now();
setToasts(prev => [...prev, { id, type, message }]);
};
const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

const carregar = async () => {
try {
    setLoading(true);
    const res = await getUsuarios();
    setUsuarios(res.data);
} catch {
    addToast("error", "Erro ao carregar usuários");
} finally {
    setLoading(false);
}
};

useEffect(() => { carregar(); }, []);

const abrirModal = (usuario = null) => {
setForm(usuario ? {
    nome: usuario.nome, email: usuario.email,
    telefone: usuario.telefone || "",
    departamento: usuario.departamento || "",
    tipo: usuario.tipo
} : FORM_VAZIO);
setModal({ aberto: true, usuario });
};

const fecharModal = () => {
setModal({ aberto: false, usuario: null });
setForm(FORM_VAZIO);
};

const salvar = async (e) => {
e.preventDefault();
setSalvando(true);
try {
    if (modal.usuario) {
    await editarUsuario(modal.usuario.id, form);
    addToast("success", "Usuário atualizado!");
    fecharModal();
    carregar();
    } else {
    const res = await criarUsuario(form);
    const senhaGerada = res.data.senha;
    fecharModal();
    carregar();
    setModalSenha({ aberto: true, senha: senhaGerada, nome: res.data.nome });
    }
} catch (err) {
    addToast("error", err.response?.data?.message || "Erro ao salvar usuário");
} finally {
    setSalvando(false);
}
};

const handleResetar = async (usuario) => {
if (!window.confirm(`Resetar a senha de ${usuario.nome}?`)) return;
try {
    const res = await resetarSenha(usuario.id);
    setModalSenha({ aberto: true, senha: res.data.senhaTemporaria, nome: usuario.nome });
} catch {
    addToast("error", "Erro ao resetar senha");
}
};

const handleAtivo = async (usuario) => {
const acao = usuario.ativo ? "desativar" : "ativar";
if (!window.confirm(`Deseja ${acao} o usuário ${usuario.nome}?`)) return;
try {
    await alterarAtivo(usuario.id, !usuario.ativo);
    addToast("success", `Usuário ${usuario.ativo ? "desativado" : "ativado"}!`);
    carregar();
} catch {
    addToast("error", "Erro ao alterar status do usuário");
}
};

const tipoCor = (tipo) => {
if (tipo === "ADMIN") return { bg: "#ede9fe", color: "#7c3aed" };
if (tipo === "GESTOR") return { bg: "#dbeafe", color: "#1d4ed8" };
return { bg: "#f3f4f6", color: "#374151" };
};

return (
<>
    <div className="toast-container">
    {toasts.map(t => (
        <Toast key={t.id} id={t.id} type={t.type} message={t.message} onClose={removeToast} duration={3000} />
    ))}
    </div>

    {/* MODAL SENHA TEMPORÁRIA */}
    {modalSenha.aberto && (
    <div className="modal-overlay" onClick={() => setModalSenha({ aberto: false, senha: "" })}>
        <div className="modal-content modal-senha" onClick={e => e.stopPropagation()}>
        <div className="modal-icon modal-icon-senha">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="#6366f1" stroke="#4f46e5" strokeWidth="2"/>
            <text x="32" y="40" textAnchor="middle" fill="white" fontSize="28">🔑</text>
            </svg>
        </div>
        <h3 className="modal-title">Senha Temporária Gerada</h3>
        <p className="modal-message">
            Anote a senha de <strong>{modalSenha.nome}</strong>.<br/>
            Ela não poderá ser visualizada novamente.
        </p>
        <div className="senha-temporaria">
            {modalSenha.senha}
        </div>
        <p className="senha-aviso">
            O usuário será solicitado a trocar esta senha no primeiro acesso.
        </p>
        <div className="modal-buttons">
            <button className="modal-btn modal-btn-primary" onClick={() => setModalSenha({ aberto: false, senha: "" })}>
            Já anotei, fechar
            </button>
        </div>
        </div>
    </div>
    )}

    {/* MODAL CADASTRO/EDIÇÃO */}
    {modal.aberto && (
    <div className="modal-overlay" onClick={fecharModal}>
        <div className="modal-content modal-usuario" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{modal.usuario ? "Editar Usuário" : "Novo Usuário"}</h3>
        <form onSubmit={salvar}>
            <div className="form-group">
            <label>Nome *</label>
            <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" className="form-input" />
            </div>
            <div className="form-group">
            <label>Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@unifil.br" className="form-input" />
            </div>
            <div className="form-group">
            <label>Telefone</label>
            <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} placeholder="(43) 99999-9999" className="form-input" />
            </div>
            <div className="form-group">
            <label>Departamento</label>
            <input value={form.departamento} onChange={e => setForm(p => ({ ...p, departamento: e.target.value }))} placeholder="Ex: TI, Administração" className="form-input" />
            </div>
            <div className="form-group">
            <label>Perfil *</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="form-input">
                <option value="COMUM">Usuário Comum</option>
                <option value="GESTOR">Gestor</option>
                <option value="ADMIN">Administrador</option>
            </select>
            </div>
            <div className="modal-buttons">
            <button type="submit" className="modal-btn modal-btn-primary" disabled={salvando}>
                {salvando ? "Salvando..." : modal.usuario ? "Salvar alterações" : "Cadastrar"}
            </button>
            <button type="button" className="modal-btn modal-btn-secondary" onClick={fecharModal}>
                Cancelar
            </button>
            </div>
        </form>
        </div>
    </div>
    )}

    <div className="page-title-container page-title-actions">
    <h1 className="page-title">Gerenciar Usuários</h1>
    <button className="btn-confirm btn-novo" onClick={() => abrirModal()}>
        <AiOutlinePlus size={20} /> Novo Usuário
    </button>
    </div>

    {loading ? (
    <div className="loading-state">Carregando...</div>
    ) : (
    <div className="table-container-admin">
        <table className="admin-table">
        <thead>
            <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Departamento</th>
            <th>Perfil</th>
            <th>Status</th>
            <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            {usuarios.length === 0 ? (
            <tr>
                <td colSpan="6" className="empty-table">Nenhum usuário cadastrado</td>
            </tr>
            ) : (
            usuarios.map(u => (
                <tr key={u.id} className={!u.ativo ? "usuario-inativo" : ""}>
                <td className="cell-nome">{u.nome}</td>
                <td className="cell-email">{u.email}</td>
                <td className="cell-departamento">{u.departamento || "—"}</td>
                <td className="cell-perfil">
                    <span className={`perfil-badge perfil-${u.tipo.toLowerCase()}`}>
                    {u.tipo}
                    </span>
                </td>
                <td className="cell-status">
                    <button className={`status-badge-admin status-${u.ativo ? "ativo" : "inativo"}`} onClick={() => handleAtivo(u)}>
                    {u.ativo ? "Ativo" : "Inativo"}
                    </button>
                </td>
                <td className="cell-acoes">
                    <button className="btn-editar" onClick={() => abrirModal(u)} title="Editar">
                    <AiOutlineEdit size={18} />
                    </button>
                    <button className="btn-resetar" onClick={() => handleResetar(u)} title="Resetar senha">
                    <AiOutlineReload size={18} />
                    </button>
                </td>
                </tr>
            ))
            )}
        </tbody>
        </table>
    </div>
    )}
</>
);
}