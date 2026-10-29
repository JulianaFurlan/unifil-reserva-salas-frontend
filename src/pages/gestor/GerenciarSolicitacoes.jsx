import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToasts } from "../../hooks/useToasts";
import Toast from "../../components/Toast";
import BotaoAjuda from "../../components/BotaoAjuda";
import { AiOutlineCheck, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { Mail } from "lucide-react";
import { gerarPdfOcupacao } from '../../utils/gerarPdfOcupacao';
import { formatarData, formatarHorario } from '../../utils/formatadores';
import { nomeDepartamento } from '../../utils/departamentos';
import { horariosSobrepoem, toDateTime, hojeISO } from '../../utils/horarios';
import "../styles/reserva.css";

const LABEL_STATUS_SALA = {
  MANUTENCAO: "Em manutenção",
  INATIVA: "Inativa",
};

export default function GerenciarSolicitacoes() {
  const [reservas, setReservas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const { toasts, addToast, removeToast } = useToasts();

  const [modalConfig, setModalConfig] = useState({
    show: false,
    tipo: null,
    reservaId: null,
    reservaInfo: null
  });

  const [filtroSala, setFiltroSala] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [mostrarExpiradas, setMostrarExpiradas] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [reservaReverter, setReservaReverter] = useState(null);

  const [showContatoModal, setShowContatoModal] = useState(false);
  const [reservaContato, setReservaContato] = useState(null);
  const [mensagemContato, setMensagemContato] = useState('');
  const [enviandoContato, setEnviandoContato] = useState(false);
  const [erroContato, setErroContato] = useState('');

  const agora = new Date();
  const hojeStr = hojeISO();

  // reserva pendente expira quando o horario final ja passou
  const reservaExpirou = (data, horaFim) => {
    const fim = toDateTime(data, horaFim);
    if (!fim) return false;
    return agora > fim;
  };

  const isUrgente = (reserva) => reserva.data === hojeStr;

  const carregarReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reservas/todas");
      setReservas(response.data);
      setReservasFiltradas(response.data);
    } catch {
      addToast('error', 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarSalas = async () => {
    try {
      const response = await api.get("/salas");
      setSalas(response.data);
    } catch {
      // status da sala e so um extra visual no card, sem toast se falhar
    }
  };

  useEffect(() => {
    carregarSalas();
  }, []);

  const statusDaSala = (salaId) => salas.find(s => s.id === salaId)?.status;

  const carregarHistorico = async () => {
    try {
      setLoadingHistorico(true);
      const response = await api.get("/reservas/historico");
      setHistorico(response.data);
    } catch {
      addToast('error', 'Erro ao carregar histórico');
    } finally {
      setLoadingHistorico(false);
    }
  };

  const abrirHistorico = () => {
    setShowHistorico(true);
    carregarHistorico();
  };

  const reverterParaPendente = async (id) => {
    try {
      await api.put(`/reservas/${id}/reverter`);
      addToast('success', 'Reserva revertida para pendente', 'Revertida');
      setShowHistorico(false);
      carregarReservas();
    } catch (error) {
      addToast('error', error.response?.data?.message || 'Erro ao reverter reserva', 'Erro');
    }
  };

  const confirmarReverter = async () => {
    const id = reservaReverter.id;
    setReservaReverter(null);
    await reverterParaPendente(id);
  };

  const abrirContato = (reserva) => {
    setReservaContato(reserva);
    setMensagemContato('');
    setErroContato('');
    setShowContatoModal(true);
  };

  const fecharContato = () => {
    setShowContatoModal(false);
    setReservaContato(null);
    setMensagemContato('');
    setErroContato('');
  };

  const enviarContato = async () => {
    if (!mensagemContato.trim()) {
      setErroContato('Escreva uma mensagem antes de enviar');
      return;
    }

    // abre o gmail com o compose ja preenchido
    const destinatario = encodeURIComponent(reservaContato.usuarioEmail);
    const assunto = encodeURIComponent(
      `Sobre sua reserva — ${reservaContato.salaNome} em ${formatarData(reservaContato.data)}`
    );
    const corpo = encodeURIComponent(mensagemContato);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${destinatario}&su=${assunto}&body=${corpo}`;
    window.open(gmailUrl, '_blank');

    setEnviandoContato(true);
    try {
      await api.post(`/reservas/${reservaContato.id}/contatar`, {
        mensagem: mensagemContato
      });
      addToast('success', 'Mensagem enviada!');
      fecharContato();
    } catch {
      addToast('warning', 'Gmail aberto no navegador. O envio automático falhou.');
    } finally {
      setEnviandoContato(false);
    }
  };

  useEffect(() => {
    let filtradas = [...reservas];

    if (filtroSala) {
      filtradas = filtradas.filter(r =>
        r.sala?.nome.toLowerCase().includes(filtroSala.toLowerCase())
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
    setMotivoRejeicao("");
    setModalConfig({
      show: true,
      tipo: tipo,
      reservaId: reserva.id,
      reservaInfo: reserva
    });
  };

  const fecharModal = () => {
    setModalConfig({ show: false, tipo: null, reservaId: null, reservaInfo: null });
    setMotivoRejeicao("");
  };

  const confirmarAcao = async () => {
    const { tipo, reservaId } = modalConfig;

    if (tipo === 'rejeitar' && !motivoRejeicao.trim()) {
      addToast('warning', 'Informe o motivo da rejeição');
      return;
    }

    if (tipo === 'aprovar' && conflitoAprovacao) {
      addToast('error', 'Essa sala já está reservada nesse horário. Rejeite uma das duas antes de aprovar.', 'Conflito de horário');
      return;
    }

    try {
      if (tipo === 'aprovar') {
        await api.put(`/reservas/${reservaId}/aprovar`);
        addToast('success', 'Reserva aprovada com sucesso', 'Aprovada');
      } else {
        await api.put(`/reservas/${reservaId}/rejeitar`, { motivo: motivoRejeicao });
        addToast('success', 'Reserva rejeitada', 'Rejeitada');
      }
      carregarReservas();
      fecharModal();
    } catch {
      addToast('error', 'Erro ao processar solicitação', 'Erro');
      fecharModal();
    }
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

  // uma reserva do historico so pode ser revertida se o dia ainda nao passou
  const isDataPassada = (dataISO) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataReserva = new Date(`${dataISO}T00:00:00`);
    return dataReserva < hoje;
  };

  const reservasPendentesTotal = reservasFiltradas.filter(r => r.status === "PENDENTE");

  // so entram aqui as que ainda podem acontecer, da mais proxima pra mais distante
  const reservasPendentes = reservasPendentesTotal
    .filter(r => !reservaExpirou(r.data, r.horaFim))
    .sort((a, b) => toDateTime(a.data, a.horaInicio) - toDateTime(b.data, b.horaInicio));

  // as que passaram do horario sem decisao ficam separadas, mais recentes primeiro
  const reservasExpiradas = reservasPendentesTotal
    .filter(r => reservaExpirou(r.data, r.horaFim))
    .sort((a, b) => toDateTime(b.data, b.horaFim) - toDateTime(a.data, a.horaFim));

  // com o modal de aprovacao aberto, checa se colide com outra ja aprovada
  const conflitoAprovacao = (() => {
    if (!modalConfig.show || modalConfig.tipo !== 'aprovar' || !modalConfig.reservaInfo) return null;
    const alvo = modalConfig.reservaInfo;
    return reservas.find(r =>
      r.id !== alvo.id &&
      r.status === 'APROVADO' &&
      r.salaId === alvo.salaId &&
      r.data === alvo.data &&
      horariosSobrepoem(alvo.horaInicio, alvo.horaFim, r.horaInicio, r.horaFim)
    ) || null;
  })();

  const limparFiltros = () => {
    setFiltroSala("");
    setFiltroData("");
    setFiltroTexto("");
  };

  const salasUnicas = [...new Set(reservas.map(r => r.sala?.nome).filter(Boolean))];

  return (
    <>
      {/* toasts */}
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

      {/* modal de confirmacao */}
      {modalConfig.show && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              {modalConfig.tipo === 'aprovar' ? (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
                  <path d="M24 32L30 38L42 26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                  <path d="M24 24L40 40M40 24L24 40" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
            </div>

            <h3 className="modal-title">
              {modalConfig.tipo === 'aprovar' ? 'Aprovar Reserva' : 'Rejeitar Reserva'}
            </h3>

            <p className="modal-message">
              {modalConfig.tipo === 'aprovar'
                ? 'Você tem certeza que deseja APROVAR esta reserva?'
                : 'Informe o motivo da rejeição para o solicitante.'}
            </p>

            {modalConfig.tipo === 'aprovar' && conflitoAprovacao && (
              <div className="modal-aviso-conflito">
                <strong>Conflito de horário:</strong> a sala já está aprovada para{" "}
                {conflitoAprovacao.nome} das {formatarHorario(conflitoAprovacao.horaInicio)} às{" "}
                {formatarHorario(conflitoAprovacao.horaFim)} nesse mesmo dia. Rejeite uma das duas
                solicitações antes de aprovar esta.
              </div>
            )}

            {/* campo de motivo, so aparece na rejeicao */}
            {modalConfig.tipo === 'rejeitar' && (
              <div className="modal-rejeicao-container">
                <textarea
                  className="modal-rejeicao-textarea"
                  placeholder="Ex: Sala já reservada por outro departamento..."
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <div className="modal-rejeicao-contador">
                  {motivoRejeicao.length}/200 caracteres
                </div>
              </div>
            )}

            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn-primary"
                onClick={confirmarAcao}
                disabled={modalConfig.tipo === 'aprovar' ? !!conflitoAprovacao : !motivoRejeicao.trim()}
              >
                {modalConfig.tipo === 'aprovar' ? 'Sim, aprovar' : 'Sim, rejeitar'}
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={fecharModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal de expiradas */}
      {mostrarExpiradas && (
        <div className="modal-overlay" onClick={() => setMostrarExpiradas(false)}>
          <div className="modal-content modal-expiradas" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Solicitações expiradas</h3>
            <p className="modal-message">
              Passaram do horário sem receber uma decisão e não podem mais acontecer.
            </p>

            <div className="lista-expiradas">
              {reservasExpiradas.length === 0 ? (
                <p className="empty-message">Nenhuma solicitação expirada</p>
              ) : (
                reservasExpiradas.map(reserva => (
                  <div key={reserva.id} className="item-expirada">
                    <div className="item-expirada-info">
                      <strong>{reserva.salaNome || "Sala não encontrada"}</strong>
                      <span>
                        {formatarData(reserva.data)} · {formatarHorario(reserva.horaInicio)}–{formatarHorario(reserva.horaFim)}
                      </span>
                      <span className="item-expirada-solicitante">
                        {reserva.nome} · {nomeDepartamento(reserva.departamento) || "-"}
                      </span>
                    </div>
                    <span className="status-badge status-expirada">Expirada</span>
                  </div>
                ))
              )}
            </div>

            <div className="modal-buttons">
              <button className="modal-btn modal-btn-secondary" onClick={() => setMostrarExpiradas(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal de historico */}
      {showHistorico && (
        <div className="modal-overlay" onClick={() => setShowHistorico(false)}>
          <div className="modal-content modal-historico" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Histórico de Reservas</h3>
            <p className="modal-message">
              Reservas já aprovadas ou rejeitadas.
            </p>

            {loadingHistorico ? (
              <div className="loading-state">Carregando histórico...</div>
            ) : historico.length === 0 ? (
              <p className="empty-message">Nenhuma reserva no histórico</p>
            ) : (
              <div className="historico-lista">
                {historico.map(reserva => (
                  <div key={reserva.id} className="historico-item">
                    <div className="historico-item-info">
                      <strong>{reserva.sala?.nome || "Sala não encontrada"}</strong>
                      <span>
                        {formatarData(reserva.data)} · {formatarHorario(reserva.horaInicio)}–{formatarHorario(reserva.horaFim)}
                      </span>
                      <span className="historico-item-solicitante">
                        Aberto por: {reserva.usuarioNome || "-"}
                      </span>
                      <span className={`status-badge ${reserva.status === 'APROVADO' ? 'status-aprovada' : 'status-negada'}`}>
                        {reserva.status === 'APROVADO' ? 'Aprovada' : 'Negada'}
                      </span>
                    </div>
                    <div className="historico-item-acoes">
                      <button
                        type="button"
                        className="btn-reverter"
                        onClick={() => setReservaReverter(reserva)}
                        disabled={isDataPassada(reserva.data)}
                        title={isDataPassada(reserva.data) ? "Não é possível reverter: a data já passou" : "Reverter para pendente"}
                      >
                        Reverter para pendente
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowHistorico(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal de confirmacao do reverter, fica depois do historico pra abrir por cima dele */}
      {reservaReverter && (
        <div className="modal-overlay" onClick={() => setReservaReverter(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                <path d="M32 18v16M32 42v2" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="modal-title">Reverter Reserva</h3>
            <p className="modal-message">
              Deseja reverter a reserva de {reservaReverter.usuarioNome || reservaReverter.nome} em{" "}
              {formatarData(reservaReverter.data)} para PENDENTE? Ela voltará para a lista de solicitações.
            </p>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-primary" onClick={confirmarReverter}>
                Sim, reverter
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={() => setReservaReverter(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal de contato */}
      {showContatoModal && reservaContato && (
        <div className="modal-overlay" onClick={fecharContato}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Contatar solicitante</h3>

            <div className="contato-destinatario">
              Para: {reservaContato.usuarioNome} ({reservaContato.usuarioEmail})
            </div>

            <div className="contato-assunto">
              Assunto: Sobre sua reserva — {reservaContato.salaNome} em {formatarData(reservaContato.data)}
            </div>

            <textarea
              className="contato-textarea"
              placeholder="Digite sua mensagem para o solicitante..."
              value={mensagemContato}
              onChange={(e) => {
                setMensagemContato(e.target.value);
                if (erroContato) setErroContato('');
              }}
              maxLength={500}
              rows={5}
            />
            <div className="contato-contador">{mensagemContato.length}/500 caracteres</div>
            {erroContato && <p className="error-message">{erroContato}</p>}

            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn-primary"
                onClick={enviarContato}
                disabled={!mensagemContato.trim() || enviandoContato}
              >
                {enviandoContato ? 'Enviando...' : 'Enviar por email'}
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={fecharContato}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* cabecalho */}
      <div className="page-title-container">
        <div className="page-title-com-ajuda">
          <h1 className="page-title">Gerenciar Solicitações</h1>
          <BotaoAjuda
            videoUrl="https://youtu.be/MI23C7k_jAk"
            titulo="Como gerenciar solicitações"
            descricao="Aprenda a aprovar, rejeitar e filtrar as solicitações de reserva."
          />
        </div>
        <div className="page-title-acoes">
          {reservasExpiradas.length > 0 && (
            <button
              type="button"
              className="btn-ver-expiradas"
              onClick={() => setMostrarExpiradas(true)}
            >
              Expiradas <span className="btn-ver-expiradas-contador">{reservasExpiradas.length}</span>
            </button>
          )}
          <button type="button" className="btn-historico" onClick={abrirHistorico}>
            Histórico{historico.length > 0 ? ` [${historico.length}]` : ""}
          </button>
          <button className="btn-gerar-pdf" onClick={() => gerarPdfOcupacao(reservasFiltradas, filtroData || null)}>
            Gerar PDF de Ocupação
          </button>
        </div>
      </div>

      {/* filtros */}
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

      {/* listagem de reservas pendentes */}
      {loading ? (
        <div className="loading-state">Carregando solicitações...</div>
      ) : (
        <div className="solicitacoes-gestor-container">
          {reservasPendentes.length === 0 ? (
            <div className="nenhuma-solicitacao">
              <h3>Nenhuma solicitação pendente</h3>
              <p>Todas as reservas foram processadas ou não há reservas aguardando aprovação.</p>
            </div>
          ) : (
            <div className="cards-gestor">
              {reservasPendentes.map(reserva => {
                const statusSala = statusDaSala(reserva.salaId);
                return (
                <div key={reserva.id} className={`card-solicitacao ${isUrgente(reserva) ? "card-urgente" : ""}`}>
                  <div className="card-header-gestor">
                    <div className="card-titulo">
                      <h3>
                        {reserva.salaNome || "Sala não encontrada"}
                        {statusSala && statusSala !== "ATIVA" && (
                          <span className={`card-sala-status card-sala-status-${statusSala.toLowerCase()}`}>
                            {LABEL_STATUS_SALA[statusSala] || statusSala}
                          </span>
                        )}
                        {isUrgente(reserva) && <span className="badge-urgente">⚠ Hoje</span>}
                      </h3>
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
                      <span className="info-value">{nomeDepartamento(reserva.departamento) || "-"}</span>
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
                    <button className="btn-contatar" onClick={() => abrirContato(reserva)}>
                      <Mail size={16} />
                      Contatar
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}