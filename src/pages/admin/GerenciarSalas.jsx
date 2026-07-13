// src/pages/admin/GerenciarSalas.jsx
import { useState, useEffect } from "react";
import { getSalas, criarSala, editarSala, alterarStatusSala, deletarSala } from "../../services/adminService";
import Toast from "../../components/common/Toast";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import "../styles/reserva.css";

const FORM_VAZIO = {
nome: "", 
bloco: "", 
capacidade: "", 
recursos: "", 
status: "ATIVA"
};

const STATUS_OPCOES = [
{ value: "ATIVA", label: "Ativa" },
{ value: "MANUTENCAO", label: "Em Manutenção" },
{ value: "INATIVA", label: "Inativa" }
];

export default function GerenciarSalas() {
const [salas, setSalas] = useState([]);
const [loading, setLoading] = useState(true);
const [toasts, setToasts] = useState([]);
const [modal, setModal] = useState({ aberto: false, sala: null });
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
    const res = await getSalas();
    setSalas(res.data);
} catch {
    addToast("error", "Erro ao carregar salas");
} finally {
    setLoading(false);
}
};

useEffect(() => { carregar(); }, []);

const abrirModal = (sala = null) => {
setForm(sala ? {
    nome: sala.nome, 
    bloco: sala.bloco,
    capacidade: sala.capacidade || "",
    recursos: sala.recursos || "",
    status: sala.status
} : FORM_VAZIO);
setModal({ aberto: true, sala });
};

const fecharModal = () => {
setModal({ aberto: false, sala: null });
setForm(FORM_VAZIO);
};

const salvar = async (e) => {
e.preventDefault();
setSalvando(true);
try {
    if (modal.sala) {
    await editarSala(modal.sala.id, form);
    addToast("success", "Sala atualizada!");
    } else {
    await criarSala(form);
    addToast("success", "Sala cadastrada!");
    }
    carregar();
    fecharModal();
} catch (err) {
    addToast("error", err.response?.data?.message || "Erro ao salvar sala");
} finally {
    setSalvando(false);
}
};

const toggleStatus = async (sala) => {
const statusAtual = sala.status;
let novoStatus;

if (statusAtual === "ATIVA") novoStatus = "MANUTENCAO";
else if (statusAtual === "MANUTENCAO") novoStatus = "INATIVA";
else novoStatus = "ATIVA";

try {
    await alterarStatusSala(sala.id, novoStatus);
    const label = { ATIVA: "Ativa", MANUTENCAO: "Manutenção", INATIVA: "Inativa" }[novoStatus];
    addToast("success", `Sala marcada como ${label}`);
    carregar();
} catch {
    addToast("error", "Erro ao alterar status");
}
};

const excluir = async (id) => {
if (!window.confirm("Deseja excluir esta sala? Esta ação não pode ser desfeita.")) return;
try {
    await deletarSala(id);
    addToast("success", "Sala excluída");
    carregar();
} catch {
    addToast("error", "Erro ao excluir sala");
}
};

const getStatusInfo = (status) => {
const map = {
    ATIVA: { classe: "status-disponivel", label: "Ativa" },
    MANUTENCAO: { classe: "status-manutencao", label: "Manutenção" },
    INATIVA: { classe: "status-inativo", label: "Inativa" }
};
return map[status] || map.ATIVA;
};

return (
<>
    <div className="toast-container">
    {toasts.map(t => (
        <Toast key={t.id} id={t.id} type={t.type} message={t.message} onClose={removeToast} duration={3000} />
    ))}
    </div>

    {/* MODAL */}
    {modal.aberto && (
    <div className="modal-overlay" onClick={fecharModal}>
        <div className="modal-content modal-sala" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{modal.sala ? "Editar Sala" : "Nova Sala"}</h3>
        <form onSubmit={salvar}>
            <div className="form-group">
            <label>Nome *</label>
            <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Lab 2" className="form-input" />
            </div>
            <div className="form-group">
            <label>Bloco *</label>
            <input required value={form.bloco} onChange={e => setForm(p => ({ ...p, bloco: e.target.value }))} placeholder="Ex: SEDE, Ipollon II" className="form-input" />
            </div>
            <div className="form-group">
            <label>Capacidade</label>
            <input type="number" min="1" value={form.capacidade} onChange={e => setForm(p => ({ ...p, capacidade: e.target.value }))} placeholder="Nº de pessoas" className="form-input" />
            </div>
            <div className="form-group">
            <label>Recursos</label>
            <input value={form.recursos} onChange={e => setForm(p => ({ ...p, recursos: e.target.value }))} placeholder="Ex: Projetor, Ar-condicionado" className="form-input" />
            </div>
            <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="form-input">
                {STATUS_OPCOES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            </div>
            <div className="modal-buttons">
            <button type="submit" className="modal-btn modal-btn-primary" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
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
    <h1 className="page-title">Gerenciar Salas</h1>
    <button className="btn-confirm btn-novo" onClick={() => abrirModal()}>
        <AiOutlinePlus size={20} /> Nova Sala
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
            <th>Bloco</th>
            <th>Capacidade</th>
            <th>Recursos</th>
            <th>Status</th>
            <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            {salas.length === 0 ? (
            <tr>
                <td colSpan="6" className="empty-table">Nenhuma sala cadastrada</td>
            </tr>
            ) : (
            salas.map(sala => {
                const info = getStatusInfo(sala.status);
                return (
                <tr key={sala.id}>
                    <td className="cell-nome">{sala.nome}</td>
                    <td className="cell-bloco">{sala.bloco}</td>
                    <td className="cell-capacidade">{sala.capacidade ? `${sala.capacidade} pessoas` : "—"}</td>
                    <td className="cell-recursos">{sala.recursos || "—"}</td>
                    <td className="cell-status">
                    <button 
                        className={`status-badge-admin ${info.classe}`} 
                        onClick={() => toggleStatus(sala)}
                        title="Clique para alterar o status"
                    >
                        {info.label}
                    </button>
                    </td>
                    <td className="cell-acoes">
                    <button className="btn-editar" onClick={() => abrirModal(sala)} title="Editar">
                        <AiOutlineEdit size={18} />
                    </button>
                    <button className="btn-excluir" onClick={() => excluir(sala.id)} title="Excluir">
                        <AiOutlineDelete size={18} />
                    </button>
                    </td>
                </tr>
                );
            })
            )}
        </tbody>
        </table>
    </div>
    )}
</>
);
}