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

const formatarHorario = (hora) => {
  if (!hora) return "";
  return hora.slice(0, 5);
};

const toDateTime = (dataISO, horaStr) => {
  if (!dataISO || !horaStr) return null;
  const hora = horaStr.slice(0, 5);
  return new Date(`${dataISO}T${hora}:00`);
};

export default function MeusPedidos() {
  const [limitarFinalizadas, setLimitarFinalizadas] = useState(7);
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

const [showEditConfirmation, setShowEditConfirmation] = useState(false);
const [reservaSelecionada, setReservaSelecionada] = useState(null);
const [showCancelConfirmation, setShowCancelConfirmation] = useState(null);


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

  // Verifica se o horário de FIM da reserva já passou em relação ao momento atual
  const reservaExpirou = (data, horaFim) => {
    const fimReserva = toDateTime(data, horaFim);
    if (!fimReserva) return false;
    return new Date() > fimReserva;
  };

  const getStatusCategoria = (status, data, horaFim) => {
    // Cancelado e rejeitado sempre vão para finalizadas, independente da data
    if (status === 'CANCELADO') return 'finalizada';
    if (status === 'REJEITADO') return 'finalizada';

    // Se o horário de fim já passou, é finalizada independente do status
    if (reservaExpirou(data, horaFim)) return 'finalizada';

    // Horário ainda não passou: classifica pelo status
    if (status === 'APROVADO') return 'aprovada';
    return 'analise';
  };

  const getStatusTexto = (status, data, horaFim) => {
    if (status === 'CANCELADO') return 'Cancelada';
    if (status === 'REJEITADO') return 'Negada';

    if (reservaExpirou(data, horaFim)) {
      if (status === 'PENDENTE') return 'Expirada';
      if (status === 'APROVADO') return 'Concluída';
    }

    if (status === 'APROVADO') return 'Aprovada';
    return 'Em aprovação';
  };

  const getStatusClass = (status, data, horaFim) => {
    if (status === 'CANCELADO') return 'status-cancelada';
    if (status === 'REJEITADO') return 'status-negada';

    if (reservaExpirou(data, horaFim)) {
      if (status === 'PENDENTE') return 'status-expirada';
      return 'status-concluida';
    }

    if (status === 'APROVADO') return 'status-aprovada';
    return 'status-analise';
  };

const cancelarReserva = (reserva) => {
  setReservaSelecionada(reserva);
  setShowCancelConfirmation(true);
  }

  const confirmarCancelamento = async () => {
  try {
    await api.put(`/reservas/${reservaSelecionada.id}/cancelar`);
    addToast('success', 'Reserva cancelada com sucesso!');
    carregarReservas();
  } catch (error) {
    addToast('error', 'Erro ao cancelar reserva');
  } finally {
    setShowCancelConfirmation(false);
    setReservaSelecionada(null);
  }
};


const editarReserva = (reserva) => {
  if (reserva.status === 'APROVADO') {
    setReservaSelecionada(reserva);
    setShowEditConfirmation(true);
  } else {
    navigate("/solicitar-reserva", {
      state: { editando: true, reservaData: reserva }
    });
  }
};

  const reservasEmAnalise = reservas.filter(r =>
    getStatusCategoria(r.status, r.data, r.horaFim) === 'analise'
  );
  const reservasAprovadas = reservas.filter(r =>
    getStatusCategoria(r.status, r.data, r.horaFim) === 'aprovada'
  );
  const reservasFinalizadas = reservas
  .filter(r => getStatusCategoria(r.status, r.data, r.horaFim) === 'finalizada')
  .sort((a, b) => new Date(b.data) - new Date(a.data));

const finalizadasVisiveis = reservasFinalizadas.slice(0, limitarFinalizadas);
const temMais = reservasFinalizadas.length > limitarFinalizadas;

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

      {showEditConfirmation && (
      <div className="modal-overlay" onClick={() => setShowEditConfirmation(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
              <path d="M32 18v16M32 42v2" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="modal-title">ATENÇÃO!</h3>
          <p className="modal-message">
            Esta reserva já foi APROVADA pelo gestor. Ao editar, ela voltará 
            para ANÁLISE e precisará ser aprovada novamente.
          </p>
          <div className="modal-buttons">
            <button className="modal-btn modal-btn-primary" onClick={() => {
              setShowEditConfirmation(false);
              navigate("/solicitar-reserva", {
                state: { editando: true, reservaData: reservaSelecionada }
              });
            }}>
              Continuar
            </button>
            <button className="modal-btn modal-btn-secondary" onClick={() => {
              setShowEditConfirmation(false);
              setReservaSelecionada(null);
            }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {showCancelConfirmation && (
  <div className="modal-overlay" onClick={() => setShowCancelConfirmation(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
          <path d="M24 24L40 40M40 24L24 40" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="modal-title">Cancelar Reserva</h3>
      <p className="modal-message">
        Tem certeza que deseja cancelar esta reserva? Ela será movida para finalizadas.
      </p>
      <div className="modal-buttons">
        <button className="modal-btn modal-btn-primary" onClick={confirmarCancelamento}>
          Sim, cancelar
        </button>
        <button className="modal-btn modal-btn-secondary" onClick={() => {
          setShowCancelConfirmation(false);
          setReservaSelecionada(null);
        }}>
          Voltar
        </button>
      </div>
    </div>
  </div>
)}

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
                        <strong>{reserva.salaNome || 'Sala não encontrada'}</strong>
                      </div>
                      <div className="solicitacao-detalhes">
                        {formatarData(reserva.data)} | {formatarHorario(reserva.horaInicio)} – {formatarHorario(reserva.horaFim)}
                      </div>
                      <div className="solicitacao-status">
                        <span className={`status-badge ${getStatusClass(reserva.status, reserva.data, reserva.horaFim)}`}>
                          {getStatusTexto(reserva.status, reserva.data, reserva.horaFim)}
                        </span>
                      </div>
                    </div>
                    <div className="solicitacao-right">
                      <div className="solicitacao-acoes">
                        <button className="btn-editar" onClick={() => editarReserva(reserva)} title="Editar">
                          <AiOutlineEdit size={20} />
                        </button>
                        <button className="btn-excluir" onClick={() => cancelarReserva(reserva)} title="Cancelar">
                          <AiOutlineDelete size={20} />
                        </button>
                      </div>
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
                        <strong>{reserva.salaNome || 'Sala não encontrada'}</strong>
                      </div>
                      <div className="solicitacao-detalhes">
                        {formatarData(reserva.data)} | {formatarHorario(reserva.horaInicio)} – {formatarHorario(reserva.horaFim)}
                      </div>
                      <div className="solicitacao-status">
                        <span className={`status-badge ${getStatusClass(reserva.status, reserva.data, reserva.horaFim)}`}>
                          {getStatusTexto(reserva.status, reserva.data, reserva.horaFim)}
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
              <>
                {finalizadasVisiveis.map(reserva => (
                  <div key={reserva.id} className="solicitacao-item finalizado">
                    <div className="solicitacao-info">
                      <div className="solicitacao-titulo">
                        <strong>{reserva.salaNome?.nome || 'Sala não encontrada'}</strong>
                      </div>
                      <div className="solicitacao-detalhes">
                        {formatarData(reserva.data)} | {formatarHorario(reserva.horaInicio)} – {formatarHorario(reserva.horaFim)}
                      </div>
                      <div className="solicitacao-status">
                        <div className="status-wrapper">
                          <span className={`status-badge ${getStatusClass(reserva.status, reserva.data, reserva.horaFim)}`}>
                            {getStatusTexto(reserva.status, reserva.data, reserva.horaFim)}
                          </span>
                          {reserva.status === 'REJEITADO' && reserva.motivoRejeicao && (
                            <div className="motivo-rejeicao">
                              <strong>Motivo:</strong> {reserva.motivoRejeicao}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="BtnMostrarMaisContainer">
                {temMais && (
                  <button
                    onClick={() => setLimitarFinalizadas(prev => prev + 7)}
                    className="btn-mostrar-mais"
                  >
                    Mostrar mais ({reservasFinalizadas.length - limitarFinalizadas} restantes)
                  </button>
                )}
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      )}
    </>
  );
}