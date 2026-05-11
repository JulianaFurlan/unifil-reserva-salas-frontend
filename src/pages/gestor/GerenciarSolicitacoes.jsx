// src/pages/gestor/GerenciarSolicitacoes.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Toast from "../../components/common/Toast";
import { AiOutlineCheck, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { gerarPdfOcupacao } from '../../utils/gerarPdfOcupacao';
import "../styles/reserva.css";

export default function GerenciarSolicitacoes() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  const [modalConfig, setModalConfig] = useState({
    show: false,
    tipo: null,
    reservaId: null,
    reservaInfo: null
  });
  
  const [filtroSala, setFiltroSala] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  const addToast = (type, message, title = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const formatarHorario = (hora) => {
  if (!hora) return "";
  return hora.split(":").slice(0, 2).join(":");
};

  const carregarReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reservas");
      setReservas(response.data);
      setReservasFiltradas(response.data);
    } catch (error) {
      addToast('error', 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    carregarReservas();
  }, []);

  useEffect(() => {
    let filtradas = [...reservas];
    
    if (filtroSala) {
      filtradas = filtradas.filter(r => 
        r.sala?.toLowerCase().includes(filtroSala.toLowerCase())
      );
    }
    
    if (filtroData) {
      filtradas = filtradas.filter(r => r.data === filtroData);
    }
    
    if (filtroTexto) {
      const texto = filtroTexto.toLowerCase();
      filtradas = filtradas.filter(r => 
        r.nome?.toLowerCase().includes(texto) ||
        r.email?.toLowerCase().includes(texto) ||
        r.finalidade?.toLowerCase().includes(texto) ||
        r.departamento?.toLowerCase().includes(texto) ||
        r.usuarioNome?.toLowerCase().includes(texto)
      );
    }
    
    setReservasFiltradas(filtradas);
  }, [filtroSala, filtroData, filtroTexto, reservas]);

  const abrirModalConfirmacao = (tipo, reserva) => {
    setModalConfig({
      show: true,
      tipo: tipo,
      reservaId: reserva.id,
      reservaInfo: reserva
    });
  };

  const fecharModal = () => {
    setModalConfig({
      show: false,
      tipo: null,
      reservaId: null,
      reservaInfo: null
    });
  };

  const confirmarAcao = async () => {
    const { tipo, reservaId } = modalConfig;
    
    try {
      if (tipo === 'aprovar') {
        await api.put(`/reservas/${reservaId}/aprovar`);
        addToast('success', 'Reserva aprovada com sucesso', 'Aprovada');
      } else {
        await api.put(`/reservas/${reservaId}/rejeitar`);
        addToast('success', 'Reserva rejeitada', 'Rejeitada');
      }
      carregarReservas();
      fecharModal();
    } catch (error) {
      addToast('error', 'Erro ao processar solicitação', 'Erro');
      fecharModal();
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const calcularDuracao = (horaInicio, horaFim) => {
    const [hInicio, mInicio] = horaInicio.split(":").map(Number);
    const [hFim, mFim] = horaFim.split(":").map(Number);
    
    let minutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas > 0) {
      return `${horas} hora${horas > 1 ? 's' : ''}${minutosRestantes > 0 ? ` e ${minutosRestantes} min` : ''}`;
    }
    return `${minutos} minutos`;
  };

    const reservasPendentes = reservasFiltradas
      .filter(r => r.status === "PENDENTE")
      .sort((a, b) => new Date(a.data) - new Date(b.data));
  const limparFiltros = () => {
    setFiltroSala("");
    setFiltroData("");
    setFiltroTexto("");
  };

  const salasUnicas = [...new Set(reservas.map(r => r.sala).filter(Boolean))];

  return (
    <>
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} id={toast.id} type={toast.type} title={toast.title} message={toast.message} onClose={removeToast} duration={3000} />
        ))}
      </div>

      {modalConfig.show && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              {modalConfig.tipo === 'aprovar' ? (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                  <path d="M24 32L30 38L42 26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                  <path d="M24 24L40 40M40 24L24 40" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <h3 className="modal-title">
              {modalConfig.tipo === 'aprovar' ? 'Aprovar Reserva' : 'Rejeitar Reserva'}
            </h3>
            <p className="modal-message">
              {modalConfig.tipo === 'aprovar' 
                ? 'Você tem certeza que deseja APROVAR esta reserva?' 
                : 'Você tem certeza que deseja REJEITAR esta reserva?'}
            </p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-primary" onClick={confirmarAcao}>
                {modalConfig.tipo === 'aprovar' ? 'Sim, aprovar' : 'Sim, rejeitar'}
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={fecharModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-title-container">
        <h1 className="page-title">Gerenciar Solicitações</h1>
        <button className="btn-gerar-pdf" onClick={() => gerarPdfOcupacao(reservas, filtroData || null)}>
          Gerar PDF
        </button>
      </div>

      <div className="filtros-container">
        <div className="filtros-row">
          <div className="filtro-group">
            <label>Sala</label>
            <input
              type="text"
              list="listaSalas"
              placeholder="Todas as salas"
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
            />
            <datalist id="listaSalas">
              {salasUnicas.map(sala => (
                <option key={sala} value={sala} />
              ))}
            </datalist>
          </div>

          <div className="filtro-group">
            <label>Data</label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>

          <div className="filtro-group filtro-busca">
            <label>Buscar</label>
            <div className="busca-wrapper">
              <AiOutlineSearch className="busca-icon" />
              <input
                type="text"
                placeholder="Nome, email, finalidade..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-limpar-filtros" onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>Carregando solicitações...</div>
      ) : (
        <div className="solicitacoes-gestor-container">
          {reservasPendentes.length === 0 ? (
            <div className="nenhuma-solicitacao">
              <h3>Nenhuma solicitação pendente</h3>
              <p>Todas as reservas foram processadas ou não há reservas aguardando aprovação.</p>
            </div>
          ) : (
            <div className="cards-gestor">
              {reservasPendentes.map(reserva => (
        <div className="card-solicitacao">
          <div className="card-header-gestor">
            <div className="card-titulo">
              <h3>{reserva.sala}</h3>
              <span className="card-data">{formatarData(reserva.data)}</span>
            </div>
            <div className="card-header-right">
              <div className="card-duracao">
                {calcularDuracao(reserva.horaInicio, reserva.horaFim)}
              </div>
              <div className="card-aberto-header">
                <span className="aberto-header-label">Aberto por: </span>
                <span className="aberto-header-valor">{reserva.usuarioEmail || reserva.email}</span>
              </div>
            </div>
          </div>

          <div className="card-info-grid">
            <div className="info-item">
              <span className="info-label">Horário</span>
              <span className="info-value horario-valor">
                {formatarHorario(reserva.horaInicio)} – {formatarHorario(reserva.horaFim)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Solicitante</span>
              <span className="info-value">{reserva.nome}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Departamento</span>
              <span className="info-value">{reserva.departamento || "-"}</span>
            </div>
          </div>

          <div className="card-solicitante">
            <div className="solicitante-grid">
              <div className="solicitante-item">
                <span className="solicitante-label">Email informado</span>
                <span className="solicitante-valor">{reserva.email}</span>
              </div>
              <div className="solicitante-item">
                <span className="solicitante-label">Finalidade</span>
                <span className="solicitante-valor">{reserva.finalidade}</span>
              </div>
              {reserva.telefone && (
                <div className="solicitante-item">
                  <span className="solicitante-label">Telefone</span>
                  <span className="solicitante-valor">{reserva.telefone}</span>
                </div>
              )}
            </div>
          </div>

          {reserva.observacoes && (
            <div className="card-observacoes">
              <span className="observacoes-label">Observações</span>
              <p className="observacoes-texto">{reserva.observacoes}</p>
            </div>
          )}

          <div className="card-acoes">
            <button className="btn-aprovar" onClick={() => abrirModalConfirmacao('aprovar', reserva)}>
              <AiOutlineCheck size={18} />
              Aprovar
            </button>
            <button className="btn-rejeitar" onClick={() => abrirModalConfirmacao('rejeitar', reserva)}>
              <AiOutlineClose size={18} />
              Rejeitar
            </button>
          </div>
        </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}