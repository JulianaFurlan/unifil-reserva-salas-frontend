import { useState, useEffect } from "react";
import { getUsuarios, criarUsuario, editarUsuario, alterarAtivo, resetarSenha, deletarUsuario } from "../../services/adminService";
import { useToasts } from "../../hooks/useToasts";
import Toast from "../../components/common/Toast";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineReload, AiOutlineDelete } from "react-icons/ai";
import "../styles/reserva.css";

const FORM_VAZIO = {
nome: "", email: "", telefone: "", departamento: "", tipo: "COMUM"
};

export default function GerenciarUsuarios() {
const [usuarios, setUsuarios] = useState([]);
const [loading, setLoading] = useState(true);
const { toasts, addToast, removeToast } = useToasts();
const [modal, setModal] = useState({ aberto: false, usuario: null });
const [modalConfirmacao, setModalConfirmacao] = useState({
    aberto: false, titulo: "", mensagem: "", onConfirmar: null
});
const [modalExcluir, setModalExcluir] = useState({ aberto: false, usuario: null, etapa: 1 });
const [excluindo, setExcluindo] = useState(false);
const [form, setForm] = useState(FORM_VAZIO);
const [salvando, setSalvando] = useState(false);

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
    } else {
    await criarUsuario({ ...form, ativo: true });
    addToast("success", "Usuário cadastrado! A senha de acesso foi enviada por email.");
    }
    fecharModal();
    carregar();
} catch (err) {
    addToast("error", err.response?.data?.message || "Erro ao salvar usuário");
} finally {
    setSalvando(false);
}
};

const fecharConfirmacao = () => {
setModalConfirmacao({ aberto: false, titulo: "", mensagem: "", onConfirmar: null });
};

// o reset nao devolve mais a senha pro admin, o usuario recebe por email
const handleResetar = (usuario) => {
setModalConfirmacao({
    aberto: true,
    titulo: "Resetar senha",
    mensagem: `Deseja resetar a senha de ${usuario.nome}? Uma nova senha será enviada por email para o usuário.`,
    onConfirmar: async () => {
    try {
        await resetarSenha(usuario.id);
        addToast("success", `Nova senha enviada por email para ${usuario.nome}.`);
    } catch {
        addToast("error", "Erro ao resetar senha");
    } finally {
        fecharConfirmacao();
    }
    },
});
};

const handleAtivo = (usuario) => {
const acao = usuario.ativo ? "desativar" : "ativar";
setModalConfirmacao({
    aberto: true,
    titulo: usuario.ativo ? "Desativar usuário" : "Ativar usuário",
    mensagem: `Deseja ${acao} o usuário ${usuario.nome}?`,
    onConfirmar: async () => {
    try {
        await alterarAtivo(usuario.id, !usuario.ativo);
        addToast("success", `Usuário ${usuario.ativo ? "desativado" : "ativado"}!`);
        carregar();
    } catch {
        addToast("error", "Erro ao alterar status do usuário");
    } finally {
        fecharConfirmacao();
    }
    },
});
};

const abrirModalExcluir = (usuario) => setModalExcluir({ aberto: true, usuario, etapa: 1 });
const fecharModalExcluir = () => setModalExcluir({ aberto: false, usuario: null, etapa: 1 });
const avancarConfirmacaoExcluir = () => setModalExcluir(prev => ({ ...prev, etapa: 2 }));

// backend bloqueia a exclusao e retorna erro quando o usuario ainda tem reserva no historico
const temReservaCadastrada = (err) =>
    err.response?.status === 409 || /reserva/i.test(err.response?.data?.message || "");

const excluirUsuario = async () => {
const { usuario } = modalExcluir;
setExcluindo(true);
try {
    await deletarUsuario(usuario.id);
    addToast("success", `Usuário "${usuario.nome}" excluído`);
    fecharModalExcluir();
    carregar();
} catch (err) {
    if (temReservaCadastrada(err)) {
    addToast("error", err.response?.data?.message || "Este usuário possui reservas no histórico e não pode ser excluído.");
    } else {
    addToast("error", err.response?.data?.message || "Não foi possível excluir este usuário");
    }
} finally {
    setExcluindo(false);
}
};

return (
<>
    <div className="toast-container">
    {toasts.map(t => (
        <Toast key={t.id} id={t.id} type={t.type} message={t.message} onClose={removeToast} duration={3000} />
    ))}
    </div>

    {/* MODAL DE CONFIRMAÇÃO (resetar senha / ativar-desativar) */}
    {modalConfirmacao.aberto && (
    <div className="modal-overlay" onClick={fecharConfirmacao}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{modalConfirmacao.titulo}</h3>
        <p className="modal-message">{modalConfirmacao.mensagem}</p>
        <div className="modal-buttons">
            <button className="modal-btn modal-btn-primary" onClick={modalConfirmacao.onConfirmar}>
            Confirmar
            </button>
            <button className="modal-btn modal-btn-secondary" onClick={fecharConfirmacao}>
            Cancelar
            </button>
        </div>
        </div>
    </div>
    )}

    {/* MODAL DE EXCLUSAO, DUAS ETAPAS DE CONFIRMACAO */}
    {modalExcluir.aberto && (
    <div className="modal-overlay" onClick={fecharModalExcluir}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
        {modalExcluir.etapa === 1 ? (
            <>
            <h3 className="modal-title">Excluir Usuário</h3>
            <p className="modal-message">
                Tem certeza que deseja excluir <strong>{modalExcluir.usuario?.nome}</strong>?
                Essa ação não pode ser desfeita. Se o usuário tiver reservas no histórico, a exclusão será bloqueada.
            </p>
            <div className="modal-buttons">
                <button className="modal-btn modal-btn-primary" onClick={avancarConfirmacaoExcluir}>
                Continuar
                </button>
                <button className="modal-btn modal-btn-secondary" onClick={fecharModalExcluir}>
                Cancelar
                </button>
            </div>
            </>
        ) : (
            <>
            <h3 className="modal-title">Confirmar exclusão definitiva</h3>
            <p className="modal-message">
                Última confirmação: o usuário <strong>{modalExcluir.usuario?.nome}</strong> será excluído{" "}
                <strong>permanentemente</strong> e não poderá ser recuperado. Deseja mesmo excluir?
            </p>
            <div className="modal-buttons">
                <button className="modal-btn modal-btn-primary" onClick={excluirUsuario} disabled={excluindo}>
                {excluindo ? "Excluindo..." : "Sim, excluir definitivamente"}
                </button>
                <button className="modal-btn modal-btn-secondary" onClick={fecharModalExcluir}>
                Cancelar
                </button>
            </div>
            </>
        )}
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
    <div className="cartao-tabela">
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
                <tr key={u.id} className={!u.ativo ? "linha-inativa" : ""}>
                <td className="cell-nome" data-label="Nome">{u.nome}</td>
                <td className="cell cell-email" data-label="Email">{u.email}</td>
                <td className="cell cell-departamento" data-label="Departamento">{u.departamento || "—"}</td>
                <td className="cell-perfil" data-label="Perfil">
                    <span className={`perfil-badge perfil-${u.tipo.toLowerCase()}`}>
                    {u.tipo}
                    </span>
                </td>
                <td className="cell-status" data-label="Status">
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
                    <button className="btn-excluir" onClick={() => abrirModalExcluir(u)} title="Excluir usuário">
                    <AiOutlineDelete size={18} />
                    </button>
                </td>
                </tr>
            ))
            )}
        </tbody>
        </table>
      </div>
    </div>
    )}
</>
);
}