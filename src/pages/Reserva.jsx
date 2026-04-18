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
const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const today = `${year}-${month}-${day}`;

const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() + 1);
const maxDateString = maxDate.toISOString().split("T")[0];

// Função para aplicar máscara no telefone
const applyTelefoneMask = (value) => {
    const apenasNumeros = value.replace(/\D/g, "");
    
    if (apenasNumeros.length === 0) return "";
    
    // Máscara para celular (11 dígitos): (XX) XXXXX-XXXX
    if (apenasNumeros.length <= 10) {
        // Telefone fixo (10 dígitos): (XX) XXXX-XXXX
        return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
        // Celular (11 dígitos): (XX) XXXXX-XXXX
        return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
};

// Função para validar telefone (retorna true/false)
const validarTelefone = (telefone) => {
    if (!telefone) return true; // Campo opcional
    const apenasNumeros = telefone.replace(/\D/g, "");
    return apenasNumeros.length === 10 || apenasNumeros.length === 11;
};

// Carregar reservas
const carregarReservas = async () => {
try {
    const response = await axios.get(API_URL);
    setReservas(response.data);
} catch (error) {
    console.error("ERRO ao carregar reservas:", error);
    }
};

useEffect(() => {
carregarReservas();
}, []);

// Validação em tempo real
useEffect(() => {
    const liveErrors = {};

    if (form.data) {
        if (form.data < today) {
            liveErrors.data = "Não é possível reservar em datas passadas";
        } else if (form.data > maxDateString) {
            liveErrors.data = "Não é possível reservar com mais de 1 ano de antecedência";
        }
    }

    const isToday = form.data === today;
    if (isToday && form.horaInicio) {
        const currentHour = now.getHours().toString().padStart(2, "0");
        const currentMinute = now.getMinutes().toString().padStart(2, "0");
        const currentTime = `${currentHour}:${currentMinute}`;
        if (form.horaInicio < currentTime) {
            liveErrors.horaInicio = "Escolha um horário futuro.";
        }
    }

    if (form.horaInicio && form.horaFim && form.horaInicio >= form.horaFim) {
        liveErrors.horaFim = "Horário de início deve ser anterior ao de fim";
    }

    if (form.data && form.horaInicio && form.horaFim && form.sala) {
        const hasConflict = reservas.some((res) => {
        if (editingId && res.id === editingId) return false;
        if (res.sala !== form.sala || res.data !== form.data) return false;
        const overlap = !(form.horaFim <= res.horaInicio || form.horaInicio >= res.horaFim);
        return overlap;
        });

        if (hasConflict) {
            liveErrors.conflict = "Esta sala já está reservada neste período.";
        }
    }

    // VALIDAÇÃO DO TELEFONE CORRIGIDA
    if (form.telefone && !validarTelefone(form.telefone)) {
        liveErrors.telefone = "Telefone deve conter 10 ou 11 dígitos";
    } else {
        // Se o telefone for válido, remove o erro
        delete errors.telefone;
    }

    setErrors((prev) => {
        const updated = { ...prev };
        delete updated.data;
        delete updated.horaInicio;
        delete updated.horaFim;
        delete updated.conflict;
        delete updated.telefone; // Remove o telefone antigo antes de adicionar o novo
        return { ...updated, ...liveErrors };
    });
}, [form.data, form.horaInicio, form.horaFim, form.sala, form.telefone, reservas, editingId, today]);

const handleChange = (e) => {
    const { name, value } = e.target;

    // TRATAMENTO ESPECIAL PARA TELEFONE COM MÁSCARA
    if (name === "telefone") {
        // Aplica a máscara automaticamente
        const telefoneMascarado = applyTelefoneMask(value);
        setForm((prev) => ({ ...prev, telefone: telefoneMascarado }));
        return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
};

const resetForm = () => {
setForm({
    data: "", horaInicio: "19:00", horaFim: "20:00", sala: "1038 - Ipollon II",
    nome: "", email: "", telefone: "", departamento: "", finalidade: "", finalidadeOutro: "", observacoes: ""
});
setEditingId(null);
setErrors({});
setMensagem({ tipo: "", texto: "" });
};

const handleSubmit = async (e) => {
e.preventDefault();

const newErrors = {};

if (!form.data) newErrors.data = "Data é obrigatória";
if (!form.horaInicio) newErrors.horaInicio = "Horário inicial obrigatório";
if (!form.horaFim) newErrors.horaFim = "Horário final obrigatório";
if (!form.nome) newErrors.nome = "Nome é obrigatório";
if (!form.email) newErrors.email = "Email é obrigatório";
if (!form.departamento) newErrors.departamento = "Selecione um departamento";
if (!form.finalidade) newErrors.finalidade = "Selecione uma finalidade";

if (form.finalidade === "outro" && !form.finalidadeOutro) {
    newErrors.finalidadeOutro = "Descreva a finalidade";
}

// VALIDAÇÃO DO TELEFONE CORRIGIDA
if (form.telefone && !validarTelefone(form.telefone)) {
    newErrors.telefone = "Telefone deve conter 10 ou 11 dígitos";
}

if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
}

// Remove caracteres não numéricos antes de enviar para o backend
const telefoneEnvio = form.telefone.replace(/\D/g, "");

const reservaParaEnviar = {
    data: form.data,
    horaInicio: form.horaInicio,
    horaFim: form.horaFim,
    sala: form.sala,
    nome: form.nome,
    email: form.email,
    telefone: telefoneEnvio, // Envia apenas números
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
// Aplica máscara ao telefone ao carregar para edição
const telefoneMascarado = reserva.telefone ? applyTelefoneMask(reserva.telefone) : "";

setForm({
    data: reserva.data,
    horaInicio: reserva.horaInicio,
    horaFim: reserva.horaFim,
    sala: reserva.sala,
    nome: reserva.nome,
    email: reserva.email,
    telefone: telefoneMascarado,
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
    setMensagem({ tipo: "sucesso", texto: "Solicitação excluída com sucesso." });
    carregarReservas();
} catch (error) {
    setMensagem({ tipo: "erro", texto: "Erro ao excluir solicitação." });
}
};

return (
<>
    <div className="page-title-container">
    <h1 className="page-title">Reserva de Salas</h1>
    </div>

{mensagem.texto && (
    <div className={`mensagem ${mensagem.tipo}`}>
        {mensagem.texto}
        <button onClick={() => setMensagem({ tipo: "", texto: "" })} className="close-btn">X</button>
    </div>
)}
    
<form onSubmit={handleSubmit} className="form-container">
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


        {/* Salas - SEDE */}
        <option value="Sala 101 - SEDE">Sala 101 - SEDE</option>
        <option value="Sala 109 - SEDE">Sala 109 - SEDE</option>

        {/* Ipollon II */}
        <option value="1028 - Ipollon II">1028 - Ipollon II</option>
        <option value="1029 - Ipollon II">1029 - Ipollon II</option>
        <option value="1030 - Ipollon II">1030 - Ipollon II</option>

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
        <input 
            type="tel" 
            name="telefone" 
            placeholder="(99) 99999-9999" 
            value={form.telefone} 
            onChange={handleChange}
            maxLength={15} // (99) 99999-9999 = 15 caracteres
        />
        {errors.telefone && <p className="error-message">{errors.telefone}</p>}
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
        {loading ? "Enviando Solicitação..." : editingId ? "Atualizar Solicitação" : "Enviar Reserva"}
    </button>

    {editingId && (
        <button type="button" onClick={resetForm} className="btn-cancel">
        Cancelar Edição
        </button>
    )}
    </form>

    <h2 className="section-title" style={{ marginTop: "60px" }}>
    Solicitações Cadastradas ({reservas.length})
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