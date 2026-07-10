import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Toast from "../../components/common/Toast";
import "../styles/reserva.css";

const EMAIL_REGEX = /^[^\s@]+@unifil\.br$/;


const DEPARTAMENTOS = [
  { value: "CC", label: "Ciência da Computação" },
  { value: "ADM", label: "Administração" },
  { value: "DIREITO", label: "Direito" },
  { value: "PSICOLOGIA", label: "Psicologia" },
  { value: "CONTABIL", label: "Ciências Contábeis" },
  { value: "ENFERMAGEM", label: "Enfermagem" },
  { value: "FISIOTERAPIA", label: "Fisioterapia" },
  { value: "NUTRICAO", label: "Nutrição" },
  { value: "ED_FISICA", label: "Educação Física" },
  { value: "ARQUITETURA", label: "Arquitetura e Urbanismo" },
  { value: "ENGENHARIA", label: "Engenharia Civil" },
];

const FINALIDADES = [
  { value: "aula_reposicao", label: "Aula de reposição" },
  { value: "aula_pratica", label: "Aula prática / laboratório" },
  { value: "reuniao_pedagogica", label: "Reunião pedagógica" },
  { value: "orientacao_tcc", label: "Orientação de TCC" },
  { value: "banca", label: "Banca / avaliação" },
  { value: "palestra", label: "Palestra / evento" },
  { value: "treinamento", label: "Treinamento / capacitação" },
  { value: "evento", label: "Evento externo" },
  { value: "outro", label: "Outro" },
];

const INITIAL_FORM_STATE = {
  data: "",
  horaInicio: "",
  horaFim: "",
  bloco: "",
  salaId: "",
  nome: "",
  email: "",
  telefone: "",
  departamento: "",
  finalidade: "",
  finalidadeOutro: "",
  observacoes: "",
};

const horariosSobrepoem = (ini1, fim1, ini2, fim2) => {
  return !(fim1 <= ini2 || ini1 >= fim2);
};

const CHAVE_RASCUNHO = "rascunho-reserva";

export default function SolicitarReserva() {
  const { user } = useAuth();
  const CHAVE_RASCUNHO = `rascunho-reserva-${user?.id ?? 'anonimo'}`;
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    try {
      const chave = `rascunho-reserva-${user?.id ?? 'anonimo'}`;
      const salvo = sessionStorage.getItem(chave);
      return salvo ? JSON.parse(salvo) : INITIAL_FORM_STATE;
    } catch {
      return INITIAL_FORM_STATE;
    }
  }); 

  const [salas, setSalas] = useState([]);
  const [carregandoSalas, setCarregandoSalas] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ultimaReserva, setUltimaReserva] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formPreenchido, setFormPreenchido] = useState(false);

    const salasPorBloco = useMemo(() => {
    const agrupado = {};

    salas.forEach(sala => {
      if (!agrupado[sala.bloco]) {
        agrupado[sala.bloco] = [];
      }
      agrupado[sala.bloco].push(sala);
    });
    return agrupado;
  }, [salas]);

  const carregarSalas = async () => {
    try {
      setCarregandoSalas(true);;
      const response = await api.get("/salas");
      setSalas(response.data);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
      addToast("error", "Erro ao carregar lista de salas", "Erro");
    } finally {
      setCarregandoSalas(false);
    }
  };

  useEffect(() => {
    carregarSalas();
  }, []);



  // Define data atual e limite máximo (1 ano)
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
    if (finalidade === "outro") return finalidadeOutro;
    const encontrada = FINALIDADES.find(f => f.value === finalidade);
    return encontrada ? encontrada.label : finalidade;
  };

  const carregarReservas = async () => {
    try {
      const response = await api.get("/reservas/aprovadas");
      setReservas(response.data);
    } catch (error) {
      console.error("ERRO ao carregar reservas aprovadas:", error);
    }
  };

  const salasAprovadas = useMemo(() => {
  if (!form.data || !form.horaInicio || !form.horaFim) return {};
  const resultado = {};
  reservas.forEach(r => {
    if (r.status !== "APROVADO") return;
    if (r.data !== form.data) return;
    if (isEditing && r.id === editingId) return;
    if (horariosSobrepoem(form.horaInicio, form.horaFim, r.horaInicio, r.horaFim)) {
      const horaIni = r.horaInicio.slice(0, 5);
      const horaFimStr = r.horaFim.slice(0, 5);
      resultado[r.salaId] = `Reservado ${horaIni}–${horaFimStr}`;
    }
  });
  return resultado;
}, [form.data, form.horaInicio, form.horaFim, reservas, editingId, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(form));
    }
  }, [form, isEditing]);

    useEffect(() => {
    if (form.salaId) {
      setErrors(prev => ({ ...prev, salaId: undefined }));
    }
  }, [form.salaId]);

  //Caso o usuario coloque uma sala e depois muda o dia para uma aprovada
  useEffect(() => {
    if (form.salaId && salasAprovadas[form.salaId]) {
      setForm(prev => ({ ...prev, salaId: "" }));
      addToast("warning", "A sala selecionada foi reservada nesse horário. Escolha outra.");
    }
  }, [salasAprovadas]);

  useEffect(() => {
    const algum = Object.entries(form).some(([chave, valor]) => {
      if (chave === "finalidadeOutro") return false;
      return valor !== "" && valor !== null && valor !== undefined;
    });
    setFormPreenchido(algum);
  }, [form]);

  useEffect(() => {
    carregarReservas();
  }, []);

  useEffect(() => {
    if (location.state?.editando && location.state?.reservaData) {
      const reserva = location.state.reservaData;
      setIsEditing(true);
      setEditingId(reserva.id);

      let blocoEncontrado = "";
      for (const [bloco, salas] of Object.entries(salasPorBloco)) {
        if (salas.includes(reserva.salaId)) {
          blocoEncontrado = bloco;
          break;
        }
      }

      setForm({
        data: reserva.data,
        horaInicio: reserva.horaInicio,
        horaFim: reserva.horaFim,
        bloco: blocoEncontrado,
        salaId: reserva.salaId,
        nome: reserva.nome,
        email: reserva.email,
        telefone: reserva.telefone || "",
        departamento: reserva.departamento || "",
        finalidade : reserva.finalidade || "",
        finalidadeOutro: reserva.finalidade === "outro" ? reserva.finalidadeOutro || "" : "",
        observacoes: reserva.observacoes || "",
      });

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  //Só libera a seleção de bloco e sala se data, horaInicio e horaFim forem válidos
  const localizacaoLiberada = useMemo(() => {
    if (!form.data || !form.horaInicio || !form.horaFim) return false;
    
    const [hI, mI] = form.horaInicio.split(":").map(Number);
    const [hF, mF] = form.horaFim.split(":").map(Number);
    const minutosInicio = hI * 60 + mI;
    const minutosFim = hF * 60 + mF;
    
    if (minutosFim <= minutosInicio) return false;
    
    return true;
  }, [form.data, form.horaInicio, form.horaFim]);

  const getFieldError = (fieldName) => {
    if (fieldName === "data") {
      if (!form.data) return "Data é obrigatória";
      if (form.data.length < 10) return null;
      
      const dataInformada = new Date(form.data + "T00:00:00");
      const dataHoje = new Date(today + "T00:00:00");
      const dataMaxima = new Date(maxDateString + "T00:00:00");

      if (dataInformada < dataHoje) return "Não é possível reservar em datas passadas";
      if (dataInformada > dataMaxima) return "Não é possível reservar com mais de 1 ano de antecedência";
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

        if (minutosInicio - minutosAgora < 10) return "O horário de início deve ser pelo menos 10 minutos a partir de agora";
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

        if (minutosFim <= minutosInicio) 
          return "Horário de fim deve ser após o início";
      }
      return null;
    }
    if (fieldName === "salaId") {
      if (!form.salaId) return "Selecione uma sala";
      return null;
    }
    if (fieldName === "nome") {
      if (!form.nome?.trim()) return "Nome é obrigatório";
      if (form.nome.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
      return null;
    }
    if (fieldName === "email") {
      if (!form.email?.trim()) return "Email é obrigatório";
      if (!EMAIL_REGEX.test(form.email)) return "Use seu email institucional (@unifil.br)";
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

  if (name === "salaId" && value) {
    setErrors(prev => ({ ...prev, salaId: undefined }));
  }

  // Atualiza o form primeiro
  setForm(prev => {
    const novoForm = { ...prev, [name]: value };

    // Revalida horaFim quando horaInicio muda e vice-versa
    if (name === "horaInicio" || name === "horaFim") {
      const inicio = name === "horaInicio" ? value : prev.horaInicio;
      const fim = name === "horaFim" ? value : prev.horaFim;

      if (inicio && fim) {
        const [hI, mI] = inicio.split(":").map(Number);
        const [hF, mF] = fim.split(":").map(Number);
        const minutosInicio = hI * 60 + mI;
        const minutosFim = hF * 60 + mF;

        if (minutosFim <= minutosInicio) {
          setTimeout(() => {
            setErrors(prev => ({
              ...prev,
              horaFim: "Horário de fim deve ser após o início"
            }));
          }, 0);
        } else {
          setTimeout(() => {
            setErrors(prev => ({ ...prev, horaFim: undefined }));
          }, 0);
        }
      }
    }

    return novoForm;
  });

  if (touched[name]) {
    const error = getFieldError(name);
    setErrors(prev => error ? { ...prev, [name]: error } : { ...prev, [name]: undefined });
  }
};
  const handleLimparFormulario = () => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    sessionStorage.removeItem(CHAVE_RASCUNHO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      data: true, horaInicio: true, horaFim: true, salaId: true,
      nome: true, email: true, departamento: true, finalidade: true, telefone: true
    };
    if (form.finalidade === "outro") allTouched.finalidadeOutro = true;
    setTouched(allTouched);

    const newErrors = {};
    const fields = ["data", "horaInicio", "horaFim", "salaId", "nome", "email", "departamento", "finalidade", "telefone"];
    if (form.finalidade === "outro") fields.push("finalidadeOutro");

    fields.forEach(field => {
      const error = getFieldError(field);
      if (error) newErrors[field] = error;
    });

    if (form.horaInicio && form.horaFim) {
  const [hI, mI] = form.horaInicio.split(":").map(Number);
  const [hF, mF] = form.horaFim.split(":").map(Number);
  if ((hF * 60 + mF) <= (hI * 60 + mI)) {
    newErrors.horaFim = "Horário de fim deve ser após o início";
  }
}

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("warning", "Por favor, corrija os erros no formulário", "Campos pendentes");
      return;
    }

    const reservaParaEnviar = {
      data: form.data,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      salaId: form.salaId,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone.replace(/\D/g, ""),
      departamento: form.departamento,
      finalidade: getFinalidadeTexto(form.finalidade, form.finalidadeOutro),
      observacoes: form.observacoes,
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
        addToast("success", "Reserva atualizada e voltou para análise!", "Atualizado");
        setTimeout(() => navigate("/meus-pedidos"), 1500);
      } else {
        const response = await api.post("/reservas", reservaParaEnviar);
        sessionStorage.removeItem(CHAVE_RASCUNHO);
        addToast("success", "Reserva criada com sucesso!", "Confirmado");
        setUltimaReserva(response.data);
        setShowSuccessModal(true);
        setForm(INITIAL_FORM_STATE);
        setErrors({});
        setTouched({});
        carregarReservas();
      }
    } catch (error) {
      const mensagem = error.response?.data?.message
        || (isEditing ? "Erro ao atualizar reserva" : "Erro ao criar reserva");
      addToast("error", mensagem, "Erro");
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
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
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

          <div className="form-group">
            <label>Data <span className="required">*</span></label>
            <input type="date" name="data" value={form.data} onChange={handleChange} onBlur={handleBlur} min={today} max={maxDateString} />
            {errors.data && <p className="error-message">{errors.data}</p>}
          </div>

          <div className="form-group">
            <label>Horário <span className="required">*</span></label>
            <div className="time-range">
              <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} onBlur={handleBlur} />
              <span>até</span>
              <input type="time" name="horaFim" value={form.horaFim} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {errors.horaInicio && <p className="error-message">{errors.horaInicio}</p>}
            {errors.horaFim && <p className="error-message">{errors.horaFim}</p>}
          </div>

<div className="form-group">
  <label>
    Localização <span className="required">*</span>
  </label>

  <div style={{ display: "flex", gap: "8px" }}>
    <select
      name="bloco"
      value={form.bloco}
      disabled={!localizacaoLiberada}
      onChange={(e) => {
        setForm(prev => ({ ...prev, bloco: e.target.value, salaId: "" }));
      }}
      style={{ flex: 1 }}
    >
      <option value="">
        {!localizacaoLiberada ? "Aguarde..." : "Bloco"}
      </option>
      {Object.keys(salasPorBloco).map(bloco => (
        <option key={bloco} value={bloco}>{bloco}</option>
      ))}
    </select>

    <select
      name="salaId"
      value={form.salaId}
      onChange={handleChange}
      disabled={!localizacaoLiberada || !form.bloco}
      style={{ flex: 2 }}
    >
      <option value="">
        {!localizacaoLiberada ? "Aguarde..." : form.bloco ? "Selecione a sala..." : "Sala"}
      </option>
      {(salasPorBloco[form.bloco] || []).map(sala => {
        const bloqueio = salasAprovadas[sala.id];
        return (
          <option key={sala.id} value={sala.id} disabled={!!bloqueio}>
            {bloqueio ? `${sala.nome} — ${bloqueio}` : sala.nome}
          </option>
        );
      })}
    </select>
  </div>

  {/* Hint embaixo dos selects, não dentro do label */}
  {!localizacaoLiberada && (
    <p className="campo-hint">Preencha data e horário válidos primeiro</p>
  )}

  {form.bloco && localizacaoLiberada &&
    Object.keys(salasAprovadas).some(s => salasPorBloco[form.bloco]?.includes(s)) && (
    <p className="info-message">
      Algumas salas estão reservadas nesse horário e não podem ser selecionadas.
    </p>
  )}

  {errors.salaId && <p className="error-message">{errors.salaId}</p>}
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
            <label>Email institucional <span className="required">*</span></label>
            <input type="email" name="email" placeholder="seuemail@unifil.br" value={form.email} onChange={handleChange} onBlur={handleBlur} />
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
            {DEPARTAMENTOS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          {errors.departamento && <p className="error-message">{errors.departamento}</p>}
        </div>

        <div className="form-group">
          <label>Finalidade <span className="required">*</span></label>
          <select name="finalidade" value={form.finalidade} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Selecione...</option>
            {FINALIDADES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
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

        {!isEditing && formPreenchido && (
          <button type="button" onClick={handleLimparFormulario} className="btn-cancel">
            Limpar formulário
          </button>
        )}
      </form>
    </>
  );
}