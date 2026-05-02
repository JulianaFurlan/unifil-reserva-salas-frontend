<<<<<<< HEAD
// src/pages/comum/SolicitarReserva.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Toast from "../../components/common/Toast";
import "../styles/reserva.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

=======
import { useState, useEffect } from "react";
import axios from "axios";
import Toast from "../../components/common/Toast";
import "../styles/reserva.css";

// Constantes
const API_URL = "http://localhost:8080/api/reservas";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Salas disponíveis
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
const SALAS = [
  "Lab 2 - SEDE",
  "Lab 3 - SEDE", 
  "Lab 4 - SEDE",
  "Sala 101 - SEDE",
  "Sala 109 - SEDE",
  "1028 - Ipollon II",
  "1029 - Ipollon II",
  "1030 - Ipollon II"
];

<<<<<<< HEAD
=======
// Estado inicial do formulário
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
const INITIAL_FORM_STATE = {
  data: "",
  horaInicio: "19:00",
  horaFim: "20:00",
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
<<<<<<< HEAD
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
=======
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [reservas, setReservas] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ultimaReserva, setUltimaReserva] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const maxDateString = new Date(new Date().setFullYear(now.getFullYear() + 1)).toISOString().split("T")[0];

=======
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Datas
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split("T")[0];

  // Função para adicionar toast
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  const addToast = (type, message, title = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, title }]);
  };

<<<<<<< HEAD
=======
  // Função para remover toast
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

<<<<<<< HEAD
  const applyTelefoneMask = (value) => {
    const apenasNumeros = value.replace(/\D/g, "");
    if (apenasNumeros.length === 0) return "";
=======
  // Função para aplicar máscara no telefone
  const applyTelefoneMask = (value) => {
    const apenasNumeros = value.replace(/\D/g, "");
    if (apenasNumeros.length === 0) return "";
    
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
    if (apenasNumeros.length <= 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

<<<<<<< HEAD
=======
  // Função para validar telefone
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  const validarTelefone = (telefone) => {
    if (!telefone) return true;
    const apenasNumeros = telefone.replace(/\D/g, "");
    return apenasNumeros.length === 10 || apenasNumeros.length === 11;
  };

<<<<<<< HEAD
=======
  // Função para mapear finalidade
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  const getFinalidadeTexto = (finalidade, finalidadeOutro) => {
    const map = {
      reuniao: "Reunião de equipe",
      aula: "Aula / Treinamento",
      evento: "Evento externo",
      outro: finalidadeOutro
    };
    return map[finalidade] || finalidade;
  };

<<<<<<< HEAD
  const carregarReservas = async () => {
    try {
      const response = await api.get("/reservas");
      setReservas(response.data);
    } catch (error) {
      console.error("ERRO ao carregar reservas:", error);
=======
// Função de validação centralizada
const getFieldError = (form, reservas, editingId, today, maxDateString, now, fieldName) => {
  // Data
  if (fieldName === "data") {
    if (!form.data) return "Data é obrigatória";
    if (form.data < today) return "Não é possível reservar em datas passadas";
    if (form.data > maxDateString) return "Não é possível reservar com mais de 1 ano de antecedência";
    return null;
  }

  // Horário Início
  if (fieldName === "horaInicio") {
    if (!form.horaInicio) return "Horário inicial é obrigatório";
    const isToday = form.data === today;
    if (isToday && form.horaInicio) {
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;
      if (form.horaInicio < currentTime) return "Escolha um horário futuro.";
    }
    return null;
  }

  // Horário Fim
  if (fieldName === "horaFim") {
    if (!form.horaFim) return "Horário final é obrigatório";
    
    if (form.horaInicio && form.horaFim) {
      // Verifica se horário início é maior ou igual ao fim
      if (form.horaInicio >= form.horaFim) {
        return "Horário de início deve ser anterior ao de fim";
      }
      
      //Calculo da diferença em minuto CALCULA A DIFERENÇA EM MINUTOS
      const [horaInicio, minutoInicio] = form.horaInicio.split(":").map(Number);
      const [horaFim, minutoFim] = form.horaFim.split(":").map(Number);
      
      const minutosInicio = horaInicio * 60 + minutoInicio;
      const minutosFim = horaFim * 60 + minutoFim;
      const diferencaMinutos = minutosFim - minutosInicio;
      
      // Verifica se tem pelo menos 10 minutos
      if (diferencaMinutos < 10) {
        return "A reserva deve ter no mínimo 10 minutos de duração";
      }
    }
    return null;
  }

  // Sala
  if (fieldName === "sala") {
    if (!form.sala || form.sala === "") return "Selecione uma sala";
    return null;
  }

  // Conflito
  if (fieldName === "conflict" && form.data && form.horaInicio && form.horaFim && form.sala) {
    const hasConflict = reservas.some((res) => {
      if (editingId && res.id === editingId) return false;
      if (res.sala !== form.sala || res.data !== form.data) return false;
      const overlap = !(form.horaFim <= res.horaInicio || form.horaInicio >= res.horaFim);
      return overlap;
    });
    if (hasConflict) {
      const reservaConflitante = reservas.find((res) => {
        if (editingId && res.id === editingId) return false;
        if (res.sala !== form.sala || res.data !== form.data) return false;
        return !(form.horaFim <= res.horaInicio || form.horaInicio >= res.horaFim);
      });
      return `A sala já está reservada das ${reservaConflitante?.horaInicio} às ${reservaConflitante?.horaFim}`;
    }
    return null;
  }

  // Nome
  if (fieldName === "nome") {
    if (!form.nome?.trim()) return "Nome é obrigatório";
    if (form.nome.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
    return null;
  }

  // Email
  if (fieldName === "email") {
    if (!form.email?.trim()) return "Email é obrigatório";
    if (!EMAIL_REGEX.test(form.email)) return "Digite um email válido (exemplo@dominio.com)";
    return null;
  }

  // Departamento
  if (fieldName === "departamento") {
    if (!form.departamento) return "Selecione um departamento";
    return null;
  }

  // Finalidade
  if (fieldName === "finalidade") {
    if (!form.finalidade) return "Selecione uma finalidade";
    return null;
  }

  // Finalidade Outro
  if (fieldName === "finalidadeOutro") {
    if (form.finalidade === "outro" && !form.finalidadeOutro?.trim()) {
      return "Descreva a finalidade";
    }
    return null;
  }

  // Telefone
  if (fieldName === "telefone" && form.telefone) {
    const apenasNumeros = form.telefone.replace(/\D/g, "");
    if (apenasNumeros.length > 0 && !validarTelefone(form.telefone)) {
      return "Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)";
    }
    return null;
  }

  return null;
};

  // Carregar reservas
  const carregarReservas = async () => {
    try {
      const response = await axios.get(API_URL);
      setReservas(response.data);
    } catch (error) {
      console.error("ERRO ao carregar reservas:", error);
      addToast('error', 'Não foi possível carregar as reservas. Verifique sua conexão.');
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

<<<<<<< HEAD
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
      if (!form.horaInicio) return "Horário inicial é obrigatório";
      return null;
    }
    if (fieldName === "horaFim") {
      if (!form.horaFim) return "Horário final é obrigatório";
      if (form.horaInicio && form.horaInicio >= form.horaFim) {
        return "Horário de início deve ser anterior ao de fim";
      }
      if (form.horaInicio && form.horaFim) {
        const [hInicio, mInicio] = form.horaInicio.split(":").map(Number);
        const [hFim, mFim] = form.horaFim.split(":").map(Number);
        const diff = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
        if (diff < 10) return "A reserva deve ter no mínimo 10 minutos de duração";
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
      const conflito = reservas.some(r => 
        r.sala === form.sala && 
        r.data === form.data && 
        !(form.horaFim <= r.horaInicio || form.horaInicio >= r.horaFim)
      );
      if (conflito) return "Esta sala já está reservada neste horário";
      return null;
    }
    return null;
  };
=======
  // Validação em tempo real
  useEffect(() => {
    const fieldsToValidate = [
      "data", "horaInicio", "horaFim", "sala", "conflict", 
      "nome", "email", "departamento", "finalidade", "finalidadeOutro", "telefone"
    ];
    
    const newErrors = { ...errors };
    
    fieldsToValidate.forEach(fieldName => {
      if (touched[fieldName] || editingId) {
        const error = getFieldError(form, reservas, editingId, today, maxDateString, now, fieldName);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
      }
    });
    
    setErrors(newErrors);
  }, [form.data, form.horaInicio, form.horaFim, form.sala, form.telefone, form.nome, form.email, form.departamento, form.finalidade, form.finalidadeOutro, reservas, editingId, today, touched]);
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
<<<<<<< HEAD
    const error = getFieldError(name);
    setErrors(prev => error ? { ...prev, [name]: error } : { ...prev, [name]: undefined });
=======
    
    const error = getFieldError(form, reservas, editingId, today, maxDateString, now, name);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
<<<<<<< HEAD
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
    };

    try {
      setLoading(true);
      
      if (isEditing && editingId) {
        await api.put(`/reservas/${editingId}`, reservaParaEnviar);
        addToast('success', 'Reserva atualizada e voltou para análise!', '✏️ Atualizado');
        setTimeout(() => navigate("/meus-pedidos"), 1500);
      } else {
        const response = await api.post("/reservas", reservaParaEnviar);
        addToast('success', 'Reserva criada com sucesso!', '✅ Confirmado');
        setUltimaReserva(response.data);
        setShowSuccessModal(true);
        setForm(INITIAL_FORM_STATE);
        setErrors({});
        setTouched({});
        carregarReservas();
      }
    } catch (error) {
      addToast('error', isEditing ? 'Erro ao atualizar reserva' : 'Erro ao criar reserva', '❌ Erro');
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
=======

    if (name === "telefone") {
      const telefoneMascarado = applyTelefoneMask(value);
      setForm((prev) => ({ ...prev, telefone: telefoneMascarado }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = getFieldError(form, reservas, editingId, today, maxDateString, now, name);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setEditingId(null);
    setErrors({});
    setTouched({});
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const allTouched = {
    data: true,
    horaInicio: true,
    horaFim: true,
    sala: true,
    nome: true,
    email: true,
    departamento: true,
    finalidade: true,
    finalidadeOutro: form.finalidade === "outro",
    telefone: true,
  };
  setTouched(allTouched);

  const newErrors = {};
  const fieldsToValidate = ["data", "horaInicio", "horaFim", "sala", "nome", "email", "departamento", "finalidade", "telefone"];
  
  if (form.finalidade === "outro") {
    fieldsToValidate.push("finalidadeOutro");
  }
  
  fieldsToValidate.forEach(fieldName => {
    const error = getFieldError(form, reservas, editingId, today, maxDateString, now, fieldName);
    if (error) {
      newErrors[fieldName] = error;
    }
  });

  //Validação de 10 minutos
  if (form.horaInicio && form.horaFim) {
    const [horaInicio, minutoInicio] = form.horaInicio.split(":").map(Number);
    const [horaFim, minutoFim] = form.horaFim.split(":").map(Number);
    
    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFim = horaFim * 60 + minutoFim;
    const diferencaMinutos = minutosFim - minutosInicio;
    
    if (diferencaMinutos < 10) {
      newErrors.horaFim = "A reserva deve ter no mínimo 10 minutos de duração";
    }
  }

  //Validção de conflito de horário 
  if (form.data && form.horaInicio && form.horaFim && form.sala) {
    const reservaConflitante = reservas.find((res) => {
      if (editingId && res.id === editingId) return false;
      if (res.sala !== form.sala || res.data !== form.data) return false;
      const overlap = !(form.horaFim <= res.horaInicio || form.horaInicio >= res.horaFim);
      return overlap;
    });

    if (reservaConflitante) {
      const mensagemConflito = `A sala "${form.sala}" já está reservada para o dia ${form.data} no horário das ${reservaConflitante.horaInicio} às ${reservaConflitante.horaFim}. Por favor, escolha outro horário ou sala.`;
      newErrors.conflict = mensagemConflito;
      addToast('error', mensagemConflito, ' Conflito de Horário');
      setErrors(newErrors);
      return;
    }
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    if (!newErrors.conflict) {
      addToast('warning', 'Por favor, corrija os erros no formulário antes de continuar.', 'Campos pendentes');
    }
    return;
  }

  // Se chegou aqui, não tem erros, pode enviar
  const telefoneEnvio = form.telefone.replace(/\D/g, "");

  const reservaParaEnviar = {
    data: form.data,
    horaInicio: form.horaInicio,
    horaFim: form.horaFim,
    sala: form.sala,
    nome: form.nome,
    email: form.email,
    telefone: telefoneEnvio,
    departamento: form.departamento,
    finalidade: getFinalidadeTexto(form.finalidade, form.finalidadeOutro),
    observacoes: form.observacoes,
  };

  try {
    setLoading(true);

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, reservaParaEnviar);
      addToast('success', 'Reserva atualizada com sucesso!', 'Atualizado');
    } else {
      await axios.post(API_URL, reservaParaEnviar);
      addToast('success', 'Nova reserva criada com sucesso!', 'Reserva confirmada');
    }

    carregarReservas();
    resetForm();
  } catch (error) {
    console.error("Erro completo ao salvar:", error);
    if (error.code === 'ERR_NETWORK') {
      addToast('error', 'Não foi possível conectar com o servidor. Verifique se o backend está rodando na porta 8080.', '🔌 Erro de conexão');
    } else if (error.response) {
      // Se o backend retornar erro de conflito
      if (error.response.status === 409 || error.response.data?.includes("conflito")) {
        addToast('error', 'Já existe uma reserva para esta sala neste horário. Por favor, escolha outro horário.', ' Conflito');
      } else {
        addToast('error', `Erro do servidor (${error.response.status}): ${error.response.data}`, ' Erro no servidor');
      }
    } else {
      addToast('error', `Erro desconhecido: ${error.message}`, ' Erro inesperado');
    }
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (reserva) => {
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
    const allTouched = {
      data: true, horaInicio: true, horaFim: true, sala: true, nome: true, email: true,
      departamento: true, finalidade: true, finalidadeOutro: true, telefone: true
    };
    setTouched(allTouched);
    addToast('info', 'Editando reserva. Faça as alterações necessárias e clique em atualizar.', 'Modo edição');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta reserva?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      addToast('success', 'Reserva excluída com sucesso!', 'Excluído');
      carregarReservas();
    } catch (error) {
      addToast('error', 'Erro ao excluir a reserva. Tente novamente.', 'Erro na exclusão');
    }
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  };

  return (
    <>
      <div className="toast-container">
        {toasts.map(toast => (
<<<<<<< HEAD
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
=======
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={removeToast}
            duration={toast.type === 'error' ? 5000 : 3000}
          />
        ))}
      </div>

      <div className="page-title-container">
        <h1 className="page-title">Reserva de Salas</h1>
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row three-columns">
          <div className="form-group">
            <label>Data <span className="required">*</span></label>
<<<<<<< HEAD
            <input type="date" name="data" value={form.data} onChange={handleChange} onBlur={handleBlur} min={today} />
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
            {errors.conflict && <p className="error-message">{errors.conflict}</p>}
          </div>
          <div className="form-group">
            <label>Sala <span className="required">*</span></label>
            <select name="sala" value={form.sala} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Selecione uma sala...</option>
              {SALAS.map(sala => <option key={sala} value={sala}>{sala}</option>)}
=======
            <input 
              type="date" 
              name="data" 
              value={form.data} 
              onChange={handleChange}
              onBlur={handleBlur}
              min={today} 
            />
            {errors.data && <p className="error-message">{errors.data}</p>}
          </div>

          <div className="form-group">
            <label>Horário <span className="required">*</span></label>
            <div className="time-range">
              <input 
                type="time" 
                name="horaInicio" 
                value={form.horaInicio} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.horaInicio ? "error" : ""} 
              />
              <span>até</span>
              <input 
                type="time" 
                name="horaFim" 
                value={form.horaFim} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.horaFim ? "error" : ""} 
              />
            </div>
            {errors.horaInicio && <p className="error-message">{errors.horaInicio}</p>}
            {errors.horaFim && <p className="error-message">{errors.horaFim}</p>}
            {errors.conflict && <p className="error-message conflict">{errors.conflict}</p>}
          </div>

          <div className="form-group">
            <label>Sala <span className="required">*</span></label>
            <select 
              name="sala" 
              value={form.sala} 
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Selecione uma sala...</option>
              {SALAS.map(sala => (
                <option key={sala} value={sala}>{sala}</option>
              ))}
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
            </select>
            {errors.sala && <p className="error-message">{errors.sala}</p>}
          </div>
        </div>

        <h2 className="section-title">Informações da Reserva</h2>

        <div className="form-row three-columns">
          <div className="form-group">
            <label>Nome <span className="required">*</span></label>
<<<<<<< HEAD
            <input type="text" name="nome" placeholder="Seu nome completo" value={form.nome} onChange={handleChange} onBlur={handleBlur} />
=======
            <input 
              type="text" 
              name="nome" 
              placeholder="Seu nome completo" 
              value={form.nome} 
              onChange={handleChange}
              onBlur={handleBlur}
            />
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
            {errors.nome && <p className="error-message">{errors.nome}</p>}
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
<<<<<<< HEAD
            <input type="email" name="email" placeholder="seuemail@empresa.com" value={form.email} onChange={handleChange} onBlur={handleBlur} />
=======
            <input 
              type="email" 
              name="email" 
              placeholder="seuemail@empresa.com" 
              value={form.email} 
              onChange={handleChange}
              onBlur={handleBlur}
            />
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Telefone</label>
<<<<<<< HEAD
            <input type="tel" name="telefone" placeholder="(99) 99999-9999" value={form.telefone} onChange={handleChange} onBlur={handleBlur} maxLength={15} />
=======
            <input 
              type="tel" 
              name="telefone" 
              placeholder="(99) 99999-9999" 
              value={form.telefone} 
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={15}
            />
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
            {errors.telefone && <p className="error-message">{errors.telefone}</p>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label>Departamento <span className="required">*</span></label>
<<<<<<< HEAD
            <select name="departamento" value={form.departamento} onChange={handleChange} onBlur={handleBlur}>
=======
            <select 
              name="departamento" 
              value={form.departamento} 
              onChange={handleChange}
              onBlur={handleBlur}
            >
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
              <option value="">Selecione...</option>
              <option value="TI">Tecnologia da Informação</option>
              <option value="ADM">Administração</option>
              <option value="RH">Recursos Humanos</option>
            </select>
            {errors.departamento && <p className="error-message">{errors.departamento}</p>}
          </div>
<<<<<<< HEAD
          <div className="form-group">
            <label>Finalidade <span className="required">*</span></label>
            <select name="finalidade" value={form.finalidade} onChange={handleChange} onBlur={handleBlur}>
=======

          <div className="form-group">
            <label>Finalidade da Reserva <span className="required">*</span></label>
            <select 
              name="finalidade" 
              value={form.finalidade} 
              onChange={handleChange}
              onBlur={handleBlur}
            >
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
              <option value="">Selecione...</option>
              <option value="reuniao">Reunião de equipe</option>
              <option value="aula">Aula / Treinamento</option>
              <option value="evento">Evento externo</option>
              <option value="outro">Outro</option>
            </select>
            {errors.finalidade && <p className="error-message">{errors.finalidade}</p>}
<<<<<<< HEAD
            {form.finalidade === "outro" && (
              <>
                <label>Especifique:</label>
                <input type="text" name="finalidadeOutro" value={form.finalidadeOutro} onChange={handleChange} onBlur={handleBlur} placeholder="Descreva..." />
=======

            {form.finalidade === "outro" && (
              <>
                <label className="block mt-3">Especifique a finalidade:</label>
                <input
                  type="text"
                  name="finalidadeOutro"
                  value={form.finalidadeOutro}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Descreva aqui..."
                />
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
                {errors.finalidadeOutro && <p className="error-message">{errors.finalidadeOutro}</p>}
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Observações:</label>
<<<<<<< HEAD
          <textarea name="observacoes" placeholder="Digite suas observações" value={form.observacoes} onChange={handleChange} maxLength={500} />
          <div className="char-count">{form.observacoes.length} / 500 caracteres</div>
        </div>

        <button type="submit" className="btn-confirm" disabled={loading}>
          {loading ? "Processando..." : isEditing ? "Atualizar Reserva" : "Enviar Reserva"}
        </button>

        {isEditing && (
          <button type="button" onClick={handleCancelEdit} className="btn-cancel">
=======
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
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
            Cancelar Edição
          </button>
        )}
      </form>
<<<<<<< HEAD
=======

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
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  Nenhuma reserva cadastrada.
                </td>
              </tr>
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
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
    </>
  );
}