// src/pages/MeusPedidos.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import "./reserva.css";

const API_URL = "/api/reservas";


const FAKE_RESERVAS = [
  {
    id: 1,
    data: "2026-06-15",  
    horaInicio: "14:00",
    horaFim: "16:00",
    sala: "Lab 2 - SEDE",
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "11999999999",
    departamento: "TI",
    finalidade: "Reunião de equipe",
    observacoes: "",
    status: "PENDENTE"
  },
  {
    id: 2,
    data: "2026-06-20",
    horaInicio: "10:00",
    horaFim: "11:30",
    sala: "Sala 101 - SEDE",
    nome: "Maria Santos",
    email: "maria@email.com",
    telefone: "11988888888",
    departamento: "RH",
    finalidade: "Treinamento",
    observacoes: "",
    status: "PENDENTE"
  },
  {
    id: 3,
    data: "2026-07-10",
    horaInicio: "19:00",
    horaFim: "21:00",
    sala: "1028 - Ipollon II",
    nome: "Carlos Souza",
    email: "carlos@email.com",
    telefone: "11977777777",
    departamento: "ADM",
    finalidade: "Evento externo",
    observacoes: "",
    status: "APROVADO"
  },
  {
    id: 4,
    data: "2026-08-05",
    horaInicio: "08:00",
    horaFim: "12:00",
    sala: "Lab 3 - SEDE",
    nome: "Ana Paula",
    email: "ana@email.com",
    telefone: "11966666666",
    departamento: "TI",
    finalidade: "Aula / Treinamento",
    observacoes: "",
    status: "APROVADO"
  },
  {
    id: 5,
    data: "2025-01-15",
    horaInicio: "14:00",
    horaFim: "16:00",
    sala: "Sala 109 - SEDE",
    nome: "Juliana Furlan",
    email: "juliana@email.com",
    telefone: "11955555555",
    departamento: "TI",
    finalidade: "Reunião de equipe",
    observacoes: "",
    status: "APROVADO"
  },
  {
    id: 6,
    data: "2025-02-20",
    horaInicio: "09:00",
    horaFim: "11:00",
    sala: "1029 - Ipollon II",
    nome: "Marcelo Yukio",
    email: "marcelo@email.com",
    telefone: "11944444444",
    departamento: "ADM",
    finalidade: "Reunião de equipe",
    observacoes: "",
    status: "CANCELADO"
  }
];

const formatarData = (dataISO) => {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
};

export default function MeusPedidos() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const carregarReservas = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setReservas([...FAKE_RESERVAS]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const getStatusCategoria = (status, data) => {
    const hoje = new Date();
    const dataReserva = new Date(data);
    
    hoje.setHours(0, 0, 0, 0);
    dataReserva.setHours(0, 0, 0, 0);
    
    if (dataReserva < hoje) {
      return 'finalizada';
    }
    
    if (status === 'APROVADO') {
      return 'aprovada';
    }
    
    if (status === 'PENDENTE') {
      return 'analise';
    }
    
    return 'analise';
  };

  const getStatusTexto = (status, data) => {
    const hoje = new Date();
    const dataReserva = new Date(data);
    hoje.setHours(0, 0, 0, 0);
    dataReserva.setHours(0, 0, 0, 0);
    
    if (dataReserva < hoje) {
      return 'Concluída';
    }
    
    if (status === 'APROVADO') return 'Aprovada';
    if (status === 'PENDENTE') return 'Em aprovação';
    if (status === 'CANCELADO') return 'Cancelada';
    if (status === 'REJEITADO') return 'Negada';
    return status;
  };

  const getStatusClass = (status, data) => {
    const hoje = new Date();
    const dataReserva = new Date(data);
    hoje.setHours(0, 0, 0, 0);
    dataReserva.setHours(0, 0, 0, 0);
    
    if (dataReserva < hoje) return 'status-concluida';
    if (status === 'APROVADO') return 'status-aprovada';
    if (status === 'PENDENTE') return 'status-analise';
    if (status === 'CANCELADO') return 'status-cancelada';
    if (status === 'REJEITADO') return 'status-negada';
    return '';
  };

  const cancelarReserva = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    setReservas(prev => prev.filter(r => r.id !== id));
    addToast('success', 'Reserva cancelada com sucesso!');
  };

  const editarReserva = (reserva) => {
    if (reserva.status === 'APROVADO') {
      if (!window.confirm(
        "ATENÇÃO!\n\n" +
        "Esta reserva já foi APROVADA pelo gestor.\n\n" +
        "Ao editar, ela voltará para ANÁLISE e precisará ser aprovada novamente.\n\n" +
        "Deseja continuar?"
      )) return;
    }
    
    navigate("/solicitar-reserva", { 
      state: { 
        editando: true,
        reservaData: reserva 
      } 
    });
  };

  const reservasEmAnalise = reservas.filter(r => getStatusCategoria(r.status, r.data) === 'analise');
  const reservasAprovadas = reservas.filter(r => getStatusCategoria(r.status, r.data) === 'aprovada');
  const reservasFinalizadas = reservas.filter(r => getStatusCategoria(r.status, r.data) === 'finalizada');

  return (
    <>
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} id={toast.id} type={toast.type} title={toast.title} message={toast.message} onClose={removeToast} duration={3000} />
        ))}
      </div>

      <div className="page-title-container">
        <h1 className="page-title">Minhas Solicitações</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>Carregando...</div>
      ) : (
        <div className="solicitacoes-container">
          
          {/* SEÇÃO 1: EM ANÁLISE - AMARELO */}
          <div className="solicitacao-card">
            <div className="card-header analise-header">
              <h2>Solicitações em análise</h2>
              <span className="card-count">{reservasEmAnalise.length}</span>
            </div>
            <div className="card-body">
              {reservasEmAnalise.length === 0 ? (
                <p className="empty-message">Nenhuma solicitação em análise</p>
              ) : (
                reservasEmAnalise.map(reserva => (
                  <div key={reserva.id} className="solicitacao-item">
                    <div className="solicitacao-info">
                      <div className="solicitacao-titulo">
                        <strong>{reserva.sala}</strong>
                      </div>
                      <div className="solicitacao-detalhes">
                        {formatarData(reserva.data)} | {reserva.horaInicio} – {reserva.horaFim}
                      </div>
                      <div className="solicitacao-status">
                        <span className={`status-badge ${getStatusClass(reserva.status, reserva.data)}`}>
                          {getStatusTexto(reserva.status, reserva.data)}
                        </span>
                      </div>
                    </div>
                    <div className="solicitacao-acoes">
                      <button className="btn-editar" onClick={() => editarReserva(reserva)} title="Editar">
                        <AiOutlineEdit size={20} />
                      </button>
                      <button className="btn-excluir" onClick={() => cancelarReserva(reserva.id)} title="Cancelar">
                        <AiOutlineDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SEÇÃO 2: APROVADAS - VERDE */}
          <div className="solicitacao-card">
            <div className="card-header aprovada-header">
              <h2>Reservas aprovadas</h2>
              <span className="card-count">{reservasAprovadas.length}</span>
            </div>
            <div className="card-body">
              {reservasAprovadas.length === 0 ? (
                <p className="empty-message">Nenhuma reserva aprovada</p>
              ) : (
                reservasAprovadas.map(reserva => (
                  <div key={reserva.id} className="solicitacao-item">
                    <div className="solicitacao-info">
                      <div className="solicitacao-titulo">
                        <strong>{reserva.sala}</strong>
                      </div>
                      <div className="solicitacao-detalhes">
                        {formatarData(reserva.data)} | {reserva.horaInicio} – {reserva.horaFim}
                      </div>
                      <div className="solicitacao-status">
                        <span className={`status-badge ${getStatusClass(reserva.status, reserva.data)}`}>
                          {getStatusTexto(reserva.status, reserva.data)}
                        </span>
                      </div>
                    </div>
                    <div className="solicitacao-acoes">
                      <button className="btn-editar" onClick={() => editarReserva(reserva)} title="Editar">
                        <AiOutlineEdit size={20} />
                      </button>
                      <button className="btn-excluir" onClick={() => cancelarReserva(reserva.id)} title="Cancelar">
                        <AiOutlineDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SEÇÃO 3: FINALIZADAS - CINZA */}
          <div className="solicitacao-card">
            <div className="card-header finalizada-header">
              <h2>Reservas finalizadas</h2>
              <span className="card-count">{reservasFinalizadas.length}</span>
            </div>
            <div className="card-body">
              {reservasFinalizadas.length === 0 ? (
                <p className="empty-message">Nenhuma reserva finalizada</p>
              ) : (
                reservasFinalizadas.map(reserva => (
                  <div key={reserva.id} className="solicitacao-item finalizado">
                    <div className="solicitacao-info">
                      <div className="solicitacao-titulo">
                        <strong>{reserva.sala}</strong>
                      </div>
                      <div className="solicitacao-detalhes">
                        {formatarData(reserva.data)} | {reserva.horaInicio} – {reserva.horaFim}
                      </div>
                      <div className="solicitacao-status">
                        <span className={`status-badge ${getStatusClass(reserva.status, reserva.data)}`}>
                          {getStatusTexto(reserva.status, reserva.data)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}