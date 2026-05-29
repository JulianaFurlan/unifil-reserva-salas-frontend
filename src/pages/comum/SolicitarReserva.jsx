// src/pages/comum/SolicitarReserva.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Toast from "../../components/common/Toast";
import "../styles/reserva.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SALAS_POR_BLOCO = {
  "SEDE": [
    "Lab 2",
    "Lab 3",
    "Lab 4",
    "Lab 5",
    "Lab 6",
    "Lab 7",
    "Lab 8",
    "Sala 101",
    "Sala 109",
  ],
  "Ipollon II": [
    "1027",
    "1028",
    "1029",
    "1030",
    "1031",
    "1032",
    "1033",
    "1034",
  ]
};

const INITIAL_FORM_STATE = {
  data: "",
  horaInicio: "",
  horaFim: "",
  sala: "",
  nome: "",
  email: "",
  telefone: "",
  departamento: "",
  finalidade: "",
  finalidadeOutro: "",
  observacoes: "",
};

export default function SolicitarReserva() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ultimaReserva, setUltimaReserva] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const maxDateString = new Date(new Date().setFullYear(now.getFullYear() + 1)).toISOString().split("T")[0];

  const addToast = (type, message, title = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const applyTelefoneMask = (value) => {
    const apenasNumeros = value.replace(/\D/g, "");
    if (apenasNumeros.length === 0) return "";
    if (apenasNumeros.length <= 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

  const validarTelefone = (telefone) => {
    if (!telefone) return true;
    const apenasNumeros = telefone.replace(/\D/g, "");
    return apenasNumeros.length === 10 || apenasNumeros.length === 11;
  };

  const getFinalidadeTexto = (finalidade, finalidadeOutro) => {
    const map = {
      reuniao: "Reunião de equipe",
      aula: "Aula / Treinamento",
      evento: "Evento externo",
      outro: finalidadeOutro
    };
    return map[finalidade] || finalidade;
  };

  const carregarReservas = async () => {
    try {
      const response = await api.get("/reservas/todas");
      setReservas(response.data);
    } catch (error) {
      console.error("ERRO ao carregar reservas:", error);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  useEffect(() => {
    if (location.state?.editando && location.state?.reservaData) {
      const reserva = location.state.reservaData;
      setIsEditing(true);
      setEditingId(reserva.id);
      
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
      
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const getFieldError = (fieldName) => {
    if (fieldName === "data") {
      if (!form.data) return "Data é obrigatória";
      if (form.data < today) return "Não é possível reservar em datas passadas";
      if (form.data > maxDateString) return "Não é possível reservar com mais de 1 ano de antecedência";
      return null;
    }
    if (fieldName === "horaInicio") {
      if (!form.horaInicio) return "Horário de início é obrigatório";
      if (form.data === today) {
        const agora = new Date();
        const [hInicio, mInicio] = form.horaInicio.split(":").map(Number);
        const minutosInicio = hInicio * 60 + mInicio;
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
        if (minutosInicio < minutosAgora) return "Este horário já passou para hoje"; 
      }
      return null;
    }
    if (fieldName === "horaFim") {
      if (!form.horaFim) return "Horário final é obrigatório";

      if (form.horaInicio && form.horaFim) {
        const [hInicio, mInicio] = form.horaInicio.split(":").map(Number);
        const [hFim, mFim] = form.horaFim.split(":").map(Number);
        const minutosInicio = hInicio * 60 + mInicio;
        const minutosFim = hFim * 60 + mFim;

        if (minutosFim <= minutosInicio) {
          return "Horário de fim deve ser após o início";
        }
        if (minutosFim - minutosInicio < 10) {
          return "A reserva deve ter no mínimo 10 minutos de duração";
        }
      }
      return null;
    }
    if (fieldName === "sala") {
      if (!form.sala) return "Selecione uma sala";
      return null;
    }
    if (fieldName === "nome") {
      if (!form.nome?.trim()) return "Nome é obrigatório";
      if (form.nome.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
      return null;
    }
    if (fieldName === "email") {
      if (!form.email?.trim()) return "Email é obrigatório";
      if (!EMAIL_REGEX.test(form.email)) return "Email inválido";
      return null;
    }
    if (fieldName === "departamento") {
      if (!form.departamento) return "Selecione um departamento";
      return null;
    }
    if (fieldName === "finalidade") {
      if (!form.finalidade) return "Selecione uma finalidade";
      return null;
    }
    if (fieldName === "finalidadeOutro") {
      if (form.finalidade === "outro" && !form.finalidadeOutro?.trim()) {
        return "Descreva a finalidade";
      }
      return null;
    }
    if (fieldName === "telefone" && form.telefone) {
      if (!validarTelefone(form.telefone)) return "Telefone deve ter 10 ou 11 dígitos";
      return null;
    }
    if (fieldName === "conflict" && form.data && form.horaInicio && form.horaFim && form.sala) {
      const conflito = reservas.some(r => {
        // Ignora a própria reserva sendo editada
        if (editingId && r.id === editingId) return false;

        return (
          r.sala === form.sala &&
          r.data === form.data &&
          !(form.horaFim <= r.horaInicio || form.horaInicio >= r.horaFim)
        );
      });
      if (conflito) return "Esta sala já está reservada neste horário";
      return null;
    }
    return null;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = getFieldError(name);
    setErrors(prev => error ? { ...prev, [name]: error } : { ...prev, [name]: undefined });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefone") {
      setForm(prev => ({ ...prev, telefone: applyTelefoneMask(value) }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = getFieldError(name);
      setErrors(prev => error ? { ...prev, [name]: error } : { ...prev, [name]: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = { data: true, horaInicio: true, horaFim: true, sala: true, nome: true, email: true, departamento: true, finalidade: true, telefone: true };
    if (form.finalidade === "outro") allTouched.finalidadeOutro = true;
    setTouched(allTouched);

    const newErrors = {};
    const fields = ["data", "horaInicio", "horaFim", "sala", "nome", "email", "departamento", "finalidade", "telefone"];
    if (form.finalidade === "outro") fields.push("finalidadeOutro");
    
    fields.forEach(field => {
      const error = getFieldError(field);
      if (error) newErrors[field] = error;
    });

    const conflictError = getFieldError("conflict");
    if (conflictError) newErrors.conflict = conflictError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('warning', 'Por favor, corrija os erros no formulário', 'Campos pendentes');
      return;
    }

  const reservaParaEnviar = {
    data: form.data,
    horaInicio: form.horaInicio,
    horaFim: form.horaFim,
    sala: form.sala,
    nome: form.nome,
    email: form.email,
    telefone: form.telefone.replace(/\D/g, ""),
    departamento: form.departamento,
    finalidade: getFinalidadeTexto(form.finalidade, form.finalidadeOutro),
    observacoes: form.observacoes,
    // (usuário da sessão)
    usuarioId: user?.id,
    usuarioEmail: user?.email,
    usuarioNome: user?.nome,
  };

    if (isEditing && editingId) {
      reservaParaEnviar.id = editingId;
    }

    try {
      setLoading(true);
      
      if (isEditing && editingId) {
        await api.put(`/reservas/${editingId}`, reservaParaEnviar);
        addToast('success', 'Reserva atualizada e voltou para análise!', 'Atualizado');
        setTimeout(() => navigate("/meus-pedidos"), 1500);
      } else {
        const response = await api.post("/reservas", reservaParaEnviar);
        addToast('success', 'Reserva criada com sucesso!', 'Confirmado');
        setUltimaReserva(response.data);
        setShowSuccessModal(true);
        setForm(INITIAL_FORM_STATE);
        setErrors({});
        setTouched({});
        carregarReservas();
      }
    } catch (error) {
      addToast('error', isEditing ? 'Erro ao atualizar reserva' : 'Erro ao criar reserva', 'Erro');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    navigate("/meus-pedidos");
  };

  return (
    <>
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} id={toast.id} type={toast.type} title={toast.title} message={toast.message} onClose={removeToast} duration={3000} />
        ))}
      </div>

      {!isEditing && showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                <path d="M24 32L30 38L42 26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="modal-title">Reserva Solicitada!</h3>
            <p className="modal-message">Sua solicitação foi criada com sucesso.</p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-primary" onClick={() => { setShowSuccessModal(false); navigate("/meus-pedidos"); }}>
                Ver minhas reservas
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowSuccessModal(false)}>
                Continuar reservando
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-title-container">
        <h1 className="page-title">{isEditing ? "Editar Reserva" : "Solicitar Reserva"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
      <div className="form-row three-columns">
        {/* Data - mantém */}
        <div className="form-group">
          <label>Data <span className="required">*</span></label>
          <input type="date" name="data" value={form.data} onChange={handleChange} onBlur={handleBlur} min={today} />
          {errors.data && <p className="error-message">{errors.data}</p>}
        </div>

        {/* Horário - mantém */}
        <div className="form-group">
          <label>Horário <span className="required">*</span></label>
          <div className="time-range">
            <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} onBlur={handleBlur} />
            <span>até</span>
            <input type="time" name="horaFim" value={form.horaFim} onChange={handleChange} onBlur={handleBlur} />
          </div>
          {errors.horaInicio && <p className="error-message">{errors.horaInicio}</p>}
          {errors.horaFim && <p className="error-message">{errors.horaFim}</p>}
          {errors.conflict && <p className="error-message">{errors.conflict}</p>}
        </div>

        {/* Bloco + Sala juntos na mesma coluna */}
        <div className="form-group">
          <label>Localização <span className="required">*</span></label>
          <div style={{ display: "flex", gap: "8px" }}>
            <select 
              name="bloco" 
              value={form.bloco} 
              onChange={(e) => {
                setForm(prev => ({ ...prev, bloco: e.target.value, sala: "" }));
              }}
              style={{ flex: 1 }}
            >
              <option value="">Bloco</option>
              {Object.keys(SALAS_POR_BLOCO).map(bloco => (
                <option key={bloco} value={bloco}>{bloco}</option>
              ))}
            </select>

            <select 
              name="sala" 
              value={form.sala} 
              onChange={handleChange} 
              onBlur={handleBlur}
              disabled={!form.bloco}
              style={{ flex: 2 }}
            >
              <option value="">
                {form.bloco ? "Selecione a sala..." : "Sala"}
              </option>
              {(SALAS_POR_BLOCO[form.bloco] || []).map(sala => (
                <option key={sala} value={sala}>{sala}</option>
              ))}
            </select>
          </div>
          {errors.sala && <p className="error-message">{errors.sala}</p>}
        </div>
      </div>

        <h2 className="section-title">Informações da Reserva</h2>

        <div className="form-row three-columns">
          <div className="form-group">
            <label>Nome <span className="required">*</span></label>
            <input type="text" name="nome" placeholder="Seu nome completo" value={form.nome} onChange={handleChange} onBlur={handleBlur} />
            {errors.nome && <p className="error-message">{errors.nome}</p>}
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input type="email" name="email" placeholder="seuemail@empresa.com" value={form.email} onChange={handleChange} onBlur={handleBlur} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input type="tel" name="telefone" placeholder="(99) 99999-9999" value={form.telefone} onChange={handleChange} onBlur={handleBlur} maxLength={15} />
            {errors.telefone && <p className="error-message">{errors.telefone}</p>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label>Departamento <span className="required">*</span></label>
            <select name="departamento" value={form.departamento} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Selecione...</option>
              <option value="TI">Tecnologia da Informação</option>
              <option value="ADM">Administração</option>
              <option value="RH">Recursos Humanos</option>
            </select>
            {errors.departamento && <p className="error-message">{errors.departamento}</p>}
          </div>
          <div className="form-group">
            <label>Finalidade <span className="required">*</span></label>
            <select name="finalidade" value={form.finalidade} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Selecione...</option>
              <option value="reuniao">Reunião de equipe</option>
              <option value="aula">Aula / Treinamento</option>
              <option value="evento">Evento externo</option>
              <option value="outro">Outro</option>
            </select>
            {errors.finalidade && <p className="error-message">{errors.finalidade}</p>}
            {form.finalidade === "outro" && (
              <>
                <label>Especifique:</label>
                <input type="text" name="finalidadeOutro" value={form.finalidadeOutro} onChange={handleChange} onBlur={handleBlur} placeholder="Descreva..." />
                {errors.finalidadeOutro && <p className="error-message">{errors.finalidadeOutro}</p>}
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Observações:</label>
          <textarea name="observacoes" placeholder="Digite suas observações" value={form.observacoes} onChange={handleChange} maxLength={500} />
          <div className="char-count">{form.observacoes.length} / 500 caracteres</div>
        </div>

        <button type="submit" className="btn-confirm" disabled={loading}>
          {loading ? "Processando..." : isEditing ? "Atualizar Reserva" : "Enviar Reserva"}
        </button>

        {isEditing && (
          <button type="button" onClick={handleCancelEdit} className="btn-cancel">
            Cancelar Edição
          </button>
        )}
      </form>
    </>
  );
}