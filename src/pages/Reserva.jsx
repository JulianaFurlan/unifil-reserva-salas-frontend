import { useState, useEffect } from "react";
import axios from "axios";
import "./reserva.css";

const API_URL = "http://localhost:8080/api/reservas";

export default function Reserva() {

const [form, setForm] = useState({
data: "",
horaInicio: "19:00",
horaFim: "20:00",
sala: "1038 - Ipollon II",
nome: "",
email: "",
telefone: "",
departamento: "",
finalidade: "",
finalidadeOutro: "",
observacoes: "",
});

const [errors, setErrors] = useState({});
const [reservas, setReservas] = useState([]);
const [editingId, setEditingId] = useState(null);
const [loading, setLoading] = useState(false);

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const today = `${year}-${month}-${day}`;

// Carregar reservas
const carregarReservas = async () => {
try {
    const response = await axios.get(API_URL);
    setReservas(response.data);
} catch (error) {
    console.error("ERRO completo ao carregar reservas:", error);
    alert("Não foi possível carregar as reservas. Verifique se o backend está rodando.");
}
};

useEffect(() => {
carregarReservas();
}, []);

// Validação em tempo real
useEffect(() => {
const liveErrors = {};

if (form.data) {
    if (form.data < today) liveErrors.data = "Não é possível reservar em datas passadas";
}

const isToday = form.data === today;
if (isToday && form.horaInicio) {
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;
    if (form.horaInicio < currentTime) liveErrors.horaInicio = "Escolha um horário futuro.";
}

if (form.horaInicio && form.horaFim && form.horaInicio >= form.horaFim) {
    liveErrors.horaFim = "Horário de início deve ser anterior ao de fim";
}

if (form.data && form.horaInicio && form.horaFim && form.sala) {
    const hasConflict = reservas.some((res) => {
    if (editingId && res.id === editingId) return false;
    if (res.sala !== form.sala || res.data !== form.data) return false;
    return !(form.horaFim <= res.horaInicio || form.horaInicio >= res.horaFim);
    });

    if (hasConflict) liveErrors.conflict = "Esta sala já está reservada neste período.";
}

setErrors((prev) => {
    const updated = { ...prev };
    delete updated.data;
    delete updated.horaInicio;
    delete updated.horaFim;
    delete updated.conflict;
    return { ...updated, ...liveErrors };
});
}, [form.data, form.horaInicio, form.horaFim, form.sala, reservas, editingId, today]);

const handleChange = (e) => {
const { name, value } = e.target;
setForm((prev) => ({ ...prev, [name]: value }));

if (errors[name] && !["data", "horaInicio", "horaFim", "sala"].includes(name)) {
    setErrors((prev) => {
    const copy = { ...prev };
    delete copy[name];
    return copy;
    });
}
};

const resetForm = () => {
setForm({
    data: "", horaInicio: "19:00", horaFim: "20:00", sala: "1038 - Ipollon II",
    nome: "", email: "", telefone: "", departamento: "", finalidade: "", finalidadeOutro: "", observacoes: ""
});
setEditingId(null);
setErrors({});
};

const handleSubmit = async (e) => {
e.preventDefault();

if (!form.data || !form.horaInicio || !form.horaFim || !form.nome || !form.email) {
    alert("Preencha os campos obrigatórios!");
    return;
}

const reservaParaEnviar = {
    data: form.data,
    horaInicio: form.horaInicio,
    horaFim: form.horaFim,
    sala: form.sala,
    nome: form.nome,
    email: form.email,
    telefone: form.telefone,
    departamento: form.departamento,
    finalidade: form.finalidade === "outro" 
    ? form.finalidadeOutro 
    : form.finalidade === "reuniao" ? "Reunião de equipe"
    : form.finalidade === "aula" ? "Aula / Treinamento"
    : form.finalidade === "evento" ? "Evento externo"
    : form.finalidade,
    observacoes: form.observacoes,
};

try {
    setLoading(true);

    if (editingId) {
    await axios.put(`${API_URL}/${editingId}`, reservaParaEnviar);
    alert("Reserva atualizada.");
    } else {
    await axios.post(API_URL, reservaParaEnviar);
    alert("Nova reserva criada.");
    }

    carregarReservas();
    resetForm();
} catch (error) {
    console.error("Erro completo ao salvar:", error);
    if (error.code === 'ERR_NETWORK') {
    alert("Network Error: Não foi possível conectar com o backend.\nVerifique se o Spring Boot está rodando na porta 8080.");
    } else if (error.response) {
    alert(`Erro do servidor (${error.response.status}): ${error.response.data}`);
    } else {
    alert("Erro desconhecido: " + error.message);
    }
} finally {
    setLoading(false);
}
};

const handleEdit = (reserva) => {
setForm({
    data: reserva.data,
    horaInicio: reserva.horaInicio,
    horaFim: reserva.horaFim,
    sala: reserva.sala,
    nome: reserva.nome,
    email: reserva.email,
    telefone: reserva.telefone || "",
    departamento: reserva.departamento || "",
    finalidade: reserva.finalidade === "Reunião de equipe" ? "reuniao" :
                reserva.finalidade === "Aula / Treinamento" ? "aula" :
                reserva.finalidade === "Evento externo" ? "evento" : "outro",
    finalidadeOutro: reserva.finalidade,
    observacoes: reserva.observacoes || "",
});
setEditingId(reserva.id);
window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDelete = async (id) => {
if (!window.confirm("Tem certeza que deseja excluir esta reserva?")) return;

try {
    await axios.delete(`${API_URL}/${id}`);
    alert("Reserva excluída.");
    carregarReservas();
} catch (error) {
    alert("Erro ao excluir: " + (error.response?.data || error.message));
}
};

return (
<>
    {/* TÍTULO - agora só aqui dentro da Reserva */}
    <div className="page-title-container">
    <h1 className="page-title">
        {editingId ? "Editar Reserva" : "Reserva de Salas"}
    </h1>
    </div>

    <form onSubmit={handleSubmit} className="form-container">
    {/* Seu formulário completo continua aqui */}
    <div className="form-row three-columns">
        <div className="form-group">
        <label>Data <span className="required">*</span></label>
        <input type="date" name="data" value={form.data} onChange={handleChange} min={today} />
        {errors.data && <p className="error-message">{errors.data}</p>}
        </div>

        <div className="form-group">
        <label>Horário <span className="required">*</span></label>
        <div className="time-range">
            <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} className={errors.horaInicio ? "error" : ""} />
            <span>até</span>
            <input type="time" name="horaFim" value={form.horaFim} onChange={handleChange} className={errors.horaFim ? "error" : ""} />
        </div>
        {errors.horaInicio && <p className="error-message">{errors.horaInicio}</p>}
        {errors.horaFim && <p className="error-message">{errors.horaFim}</p>}
        {errors.conflict && <p className="error-message conflict">{errors.conflict}</p>}
        </div>

<div className="form-group">
  <label>Sala</label>
  <select name="sala" value={form.sala} onChange={handleChange}>
    
    {/* Labs - SEDE */}
    <option value="Lab 2 - SEDE">Lab 2 - SEDE</option>
    <option value="Lab 3 - SEDE">Lab 3 - SEDE</option>
    <option value="Lab 4 - SEDE">Lab 4 - SEDE</option>
    <option value="Lab 5 - SEDE">Lab 5 - SEDE</option>
    <option value="Lab 6 - SEDE">Lab 6 - SEDE</option>
    <option value="Lab 7 - SEDE">Lab 7 - SEDE</option>
    <option value="Lab 8 - SEDE">Lab 8 - SEDE</option>


    {/* Salas - SEDE */}
    <option value="Sala 101 - SEDE">Sala 101 - SEDE</option>
    <option value="Sala 109 - SEDE">Sala 109 - SEDE</option>

    {/* Ipollon II */}
    <option value="1028 - Ipollon II">1028 - Ipollon II</option>
    <option value="1029 - Ipollon II">1029 - Ipollon II</option>
    <option value="1030 - Ipollon II">1030 - Ipollon II</option>
    <option value="1031 - Ipollon II">1031 - Ipollon II</option>
    <option value="1032 - Ipollon II">1032 - Ipollon II</option>
    <option value="1033 - Ipollon II">1033 - Ipollon II</option>
    <option value="1034 - Ipollon II">1034 - Ipollon II</option>
    <option value="1035 - Ipollon II">1035 - Ipollon II</option>
    <option value="1036 - Ipollon II">1036 - Ipollon II</option>
    <option value="1037 - Ipollon II">1037 - Ipollon II</option>
    <option value="1038 - Ipollon II">1038 - Ipollon II</option>
    <option value="1039 - Ipollon II">1039 - Ipollon II</option>

    {/* Já existentes */}
    <option value="1042 - Ipollon III">1042 - Ipollon III</option>
    <option value="2015 - Bloco B">2015 - Bloco B</option>

  </select>
</div>
    </div>

    <h2 className="section-title">Informações da Reserva</h2>

    <div className="form-row three-columns">
        <div className="form-group">
        <label>Nome <span className="required">*</span></label>
        <input type="text" name="nome" placeholder="Seu nome completo" value={form.nome} onChange={handleChange} />
        {errors.nome && <p className="error-message">{errors.nome}</p>}
        </div>
        <div className="form-group">
        <label>Email <span className="required">*</span></label>
        <input type="email" name="email" placeholder="seuemail@empresa.com" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div className="form-group">
        <label>Telefone</label>
        <input type="tel" name="telefone" placeholder="(xx) yyyy-yyyy" value={form.telefone} onChange={handleChange} />
        </div>
    </div>

    <div className="form-row two-columns">
        <div className="form-group">
        <label>Departamento <span className="required">*</span></label>
        <select name="departamento" value={form.departamento} onChange={handleChange}>
            <option value="">Selecione...</option>
            <option value="TI">Tecnologia da Informação</option>
            <option value="ADM">Administração</option>
            <option value="RH">Recursos Humanos</option>
        </select>
        {errors.departamento && <p className="error-message">{errors.departamento}</p>}
        </div>

        <div className="form-group">
        <label>Finalidade da Reserva <span className="required">*</span></label>
        <select name="finalidade" value={form.finalidade} onChange={handleChange}>
            <option value="">Selecione...</option>
            <option value="reuniao">Reunião de equipe</option>
            <option value="aula">Aula / Treinamento</option>
            <option value="evento">Evento externo</option>
            <option value="outro">Outro</option>
        </select>
        {errors.finalidade && <p className="error-message">{errors.finalidade}</p>}

        {form.finalidade === "outro" && (
            <>
            <label className="block mt-3">Especifique a finalidade:</label>
            <input
                type="text"
                name="finalidadeOutro"
                value={form.finalidadeOutro}
                onChange={handleChange}
                placeholder="Descreva aqui..."
            />
            {errors.finalidadeOutro && <p className="error-message">{errors.finalidadeOutro}</p>}
            </>
        )}
        </div>
    </div>

    <div className="form-group">
        <label>Observações:</label>
        <textarea
        name="observacoes"
        placeholder="Digite suas observações"
        value={form.observacoes}
        onChange={handleChange}
        maxLength={500}
        />
        <div className="char-count">
        {form.observacoes.length} / 500 caracteres
        </div>
    </div>

    <button type="submit" className="btn-confirm" disabled={loading}>
        {loading ? "Salvando..." : editingId ? "Atualizar Reserva" : "Confirmar Reserva"}
    </button>

    {editingId && (
        <button type="button" onClick={resetForm} className="btn-cancel">
        Cancelar Edição
        </button>
    )}
    </form>

    <h2 className="section-title" style={{ marginTop: "60px" }}>
    Reservas Cadastradas ({reservas.length})
    </h2>

    <div className="table-container">
    <table className="reservas-table">
        <thead>
        <tr>
            <th>Data</th>
            <th>Horário</th>
            <th>Sala</th>
            <th>Nome</th>
            <th>Finalidade</th>
            <th>Ações</th>
        </tr>
        </thead>
        <tbody>
        {reservas.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>Nenhuma reserva cadastrada.</td></tr>
        ) : (
            reservas.map((res) => (
            <tr key={res.id}>
                <td>{res.data}</td>
                <td>{res.horaInicio} - {res.horaFim}</td>
                <td>{res.sala}</td>
                <td>{res.nome}</td>
                <td>{res.finalidade}</td>
                <td>
                <button onClick={() => handleEdit(res)} className="btn-edit">Editar</button>
                <button onClick={() => handleDelete(res.id)} className="btn-delete">Excluir</button>
                </td>
            </tr>
            ))
        )}
        </tbody>
    </table>
    </div>
</>
);
}