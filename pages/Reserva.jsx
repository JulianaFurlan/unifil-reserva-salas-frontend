import { useState } from "react";
import "./reserva.css";

export default function Reserva() {
const [form, setForm] = useState({
data: "",
horaInicio: "",
horaFim: "",
sala: "1038 - Ipollon II",
nome: "",
email: "",
telefone: "",
departamento: "",
finalidade: "",
observacoes: "",
});

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
e.preventDefault();
console.log("Reserva enviada:", form);
alert("✅ Reserva enviada com sucesso! (Backend virá depois)");
};

return (
<>
    <h1 className="page-title">Reserva de Salas</h1>

    <form onSubmit={handleSubmit} className="form-container">
        {/* LINHA 1: Data, Horário, Sala */}
        <div className="form-row three-columns">
            <div className="form-group">
            <label>Data</label>
            <input
                type="date"
                name="data"
                onChange={handleChange}
                required
            />
            </div>

            <div className="form-group">
            <label>Horário</label>
            <div className="time-range">
                <input
                type="time"
                name="horaInicio"
                onChange={handleChange}
                value="19:00"
                />
                <span>até</span>
                <input
                type="time"
                name="horaFim"
                onChange={handleChange}
                value="20:00"
                />
            </div>
            </div>

            <div className="form-group">
            <label>Sala</label>
            <select name="sala" onChange={handleChange} value={form.sala}>
                <option value="1038 - Ipollon II">1038 - Ipollon II</option>
                <option value="1042 - Ipollon III">1042 - Ipollon III</option>
                <option value="2015 - Bloco B">2015 - Bloco B</option>
            </select>
            </div>
        </div>

        <h2 className="section-title">Informações da Reserva</h2>

        {/* INFORMAÇÕES */}
        <div className="form-row three-columns">
            <div className="form-group">
            <label>Nome:</label>
            <input
                type="text"
                name="nome"
                placeholder="Seu nome completo"
                onChange={handleChange}
                required
            />
            </div>
            <div className="form-group">
            <label>Email:</label>
            <input
                type="email"
                name="email"
                placeholder="seuemail@empresa.com"
                onChange={handleChange}
                required
            />
            </div>
            <div className="form-group">
            <label>Telefone:</label>
            <input
                type="tel"
                name="telefone"
                placeholder="(xx) yyyy-yyyy"
                onChange={handleChange}
            />
            </div>
        </div>

        {/* DEPARTAMENTO E FINALIDADE */}
        <div className="form-row two-columns">
            <div className="form-group">
            <label>Departamento:</label>
            <select name="departamento" onChange={handleChange} required>
                <option value="">Selecione...</option>
                <option value="TI">Tecnologia da Informação</option>
                <option value="ADM">Administração</option>
                <option value="RH">Recursos Humanos</option>
            </select>
            </div>

            <div className="form-group">
            <label>Finalidade da Reserva:</label>
            <select name="finalidade" onChange={handleChange} required>
                <option value="">Selecione...</option>
                <option value="reuniao">Reunião de equipe</option>
                <option value="aula">Aula / Treinamento</option>
                <option value="evento">Evento externo</option>
            </select>
            </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="form-group">
            <label>Observações:</label>
            <textarea
            name="observacoes"
            placeholder="Digite suas observações"
            rows="4"
            onChange={handleChange}
            ></textarea>
        </div>

        <button type="submit" className="btn-confirm">
            Confirmar Reserva
        </button>
        </form>
    </>
);
}