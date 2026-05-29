// src/pages/comum/MeusPedidos.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Toast from "../../components/common/Toast";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import "../styles/reserva.css";

const formatarData = (dataISO) => {
  if (!dataISO) return "";
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
      const response = await api.get("/reservas");
      setReservas(response.data);
    } catch (error) {
      console.error("Erro:", error);
      addToast('error', 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const getStatusCategoria = (status, data) => {
    const hoje = new Date();
    const dataReserva = new Date(data + 'T23:59:59');
    hoje.setHours(0, 0, 0, 0);

    if (status === 'CANCELADO') return 'finalizada';
    if (status === 'REJEITADO') return 'finalizada';
    if (dataReserva < hoje) return 'finalizada';
    if (status === 'APROVADO') return 'aprovada';
    return 'analise';
  };

  const getStatusTexto = (status, data) => {
    const hoje = new Date();
    const dataReserva = new Date(data + 'T23:59:59');
    hoje.setHours(0, 0, 0, 0);

    if (status === 'CANCELADO') return 'Cancelada';
    if (status === 'REJEITADO') return 'Negada';
    if (dataReserva < hoje) return 'Concluída';
    if (status === 'APROVADO') return 'Aprovada';
    return 'Em aprovação';
  };

  const getStatusClass = (status, data) => {
    const hoje = new Date();
    const dataReserva = new Date(data + 'T23:59:59');
    hoje.setHours(0, 0, 0, 0);

    if (status === 'CANCELADO') return 'status-cancelada';
    if (status === 'REJEITADO') return 'status-negada';
    if (dataReserva < hoje) return 'status-concluida';
    if (status === 'APROVADO') return 'status-aprovada';
    return 'status-analise';
  };

  const cancelarReserva = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      await api.put(`/reservas/${id}/cancelar`);
      addToast('success', 'Reserva cancelada com sucesso!');
      carregarReservas();
    } catch (error) {
      addToast('error', 'Erro ao cancelar reserva');
    }
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
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={removeToast}
            duration={3000}
          />
        ))}
      </div>

      <div className="page-title-container">
        <h1 className="page-title">Minhas Solicitações</h1>
      </div>

      {loading ? (
        <div className="loading-state">Carregando...</div>
      ) : (
        <div className="solicitacoes-container">

          {/* SEÇÃO: SOLICITAÇÕES EM ANÁLISE */}
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

                    <div className="solicitacao-right">
                      <div className="solicitacao-acoes">
                        <button className="btn-editar" onClick={() => editarReserva(reserva)} title="Editar">
                          <AiOutlineEdit size={20} />
                        </button>
                        <button className="btn-excluir" onClick={() => cancelarReserva(reserva.id)} title="Cancelar">
                          <AiOutlineDelete size={20} />
                        </button>
                      </div>

                      {reserva.usuarioNome && (
                        <div className="solicitacao-aberto-por">
                          Aberto por: {reserva.usuarioEmail}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SEÇÃO: RESERVAS APROVADAS */}
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

          {/* SEÇÃO: RESERVAS FINALIZADAS */}
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
                      <div className="status-wrapper">
                        <span className={`status-badge ${getStatusClass(reserva.status, reserva.data)}`}>
                          {getStatusTexto(reserva.status, reserva.data)}
                        </span>

                        {/* MOTIVO DA REJEIÇÃO - aparece ao lado do status */}
                        {reserva.status === 'REJEITADO' && reserva.motivoRejeicao && (
                          <div className="motivo-rejeicao">
                            <strong>Motivo:</strong> {reserva.motivoRejeicao}
                          </div>
                        )}
                      </div>
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