// src/pages/comum/ConsultarDisponibilidade.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ImUsers } from "react-icons/im";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import "../styles/reserva.css";

export default function ConsultarDisponibilidade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [salas, setSalas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reservasPendentes, setReservasPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  });

  // filtro opcional de horário, além da data
  const [horaInicioFiltro, setHoraInicioFiltro] = useState("");
  const [horaFimFiltro, setHoraFimFiltro] = useState("");

  const [modalReserva, setModalReserva] = useState({
    aberto: false,
    sala: null,
  });

  // horarios escolhidos no modal
  const [horarioInicio, setHorarioInicio] = useState("08:00");
  const [horarioFim, setHorarioFim] = useState("18:00");

  const isGestorOuAdmin = user?.tipo === 'GESTOR' || user?.tipo === 'ADMIN';

  // carrega salas e reservas (gestor/admin também carregam as pendentes, para exibir nos cards)
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const chamadas = [
          api.get("/salas"),
          api.get("/reservas/aprovadas"),
        ];
        if (isGestorOuAdmin) {
          chamadas.push(api.get("/reservas/todas"));
        }

        const [salasRes, reservasRes, todasRes] = await Promise.all(chamadas);
        setSalas(salasRes.data);
        setReservas(reservasRes.data);
        setReservasPendentes(todasRes ? todasRes.data.filter(r => r.status === "PENDENTE") : []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [isGestorOuAdmin]);

  // agrupa salas por bloco, filtrando inativas
  const salasPorBloco = useMemo(() => {
    const agrupado = {};
    salas
      .filter(sala => sala.status !== "INATIVA")
      .forEach(sala => {
        if (!agrupado[sala.bloco]) agrupado[sala.bloco] = [];
        agrupado[sala.bloco].push(sala);
      });
    return agrupado;
  }, [salas]);

  // dois horários se sobrepõem quando NÃO é verdade que um termina antes do outro começar
  const horariosSeConflitam = (ini1, fim1, ini2, fim2) => !(fim1 <= ini2 || ini1 >= fim2);

  const filtroHorarioAtivo = Boolean(horaInicioFiltro && horaFimFiltro);

  // calcula ocupacao de cada sala na data selecionada
  // totalReservas/ocupacaoTotal usam só as aprovadas, pra não mudar o que getStatusSala calcula;
  // reservas (exibida nos cards) junta aprovadas + pendentes, pra gestor/admin verem as duas
  const ocupacaoPorSala = useMemo(() => {
    const ocupacao = {};
    salas.forEach(sala => {
      const aprovadasDaSala = reservas.filter(r =>
        r.salaId === sala.id && r.data === dataSelecionada
      );
      const pendentesDaSala = isGestorOuAdmin
        ? reservasPendentes.filter(r => r.salaId === sala.id && r.data === dataSelecionada)
        : [];

      const reservasParaExibir = [
        ...aprovadasDaSala.map(r => ({ ...r, tipoOcupacao: "aprovado" })),
        ...pendentesDaSala.map(r => ({ ...r, tipoOcupacao: "pendente" })),
      ].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

      ocupacao[sala.id] = {
        sala,
        reservas: reservasParaExibir,
        totalReservas: aprovadasDaSala.length,
        ocupacaoTotal: aprovadasDaSala.some(r =>
          r.horaInicio <= "08:00:00" && r.horaFim >= "22:00:00"
        ),
        disponivelNoFiltro: !filtroHorarioAtivo || !aprovadasDaSala.some(r =>
          horariosSeConflitam(horaInicioFiltro, horaFimFiltro, r.horaInicio.slice(0, 5), r.horaFim.slice(0, 5))
        ),
      };
    });
    return ocupacao;
  }, [salas, reservas, reservasPendentes, isGestorOuAdmin, dataSelecionada, filtroHorarioAtivo, horaInicioFiltro, horaFimFiltro]);

  // determina status da sala
  const getStatusSala = (salaId) => {
    const sala = salas.find(s => s.id === salaId);
    const ocupacao = ocupacaoPorSala[salaId];

    if (sala?.status === "INATIVA") {
      return null;
    }

    if (sala?.status === "MANUTENCAO") {
      return { tipo: "manutencao", label: "Em manutenção", classe: "status-manutencao" };
    }

    if (!ocupacao || ocupacao.totalReservas === 0) {
      return { tipo: "livre", label: "Disponível", classe: "status-disponivel" };
    }

    if (ocupacao.ocupacaoTotal) {
      return { tipo: "ocupada", label: "Sem disponibilidade", classe: "status-ocupada" };
    }

    return { tipo: "parcial", label: "Parcialmente ocupada", classe: "status-parcial" };
  };

  const formatarHorario = (hora) => {
    if (!hora) return "";
    return hora.slice(0, 5);
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const calcularContadoresBloco = (salasDoBloco) => {
    let disponiveis = 0;
    let ocupadas = 0;
    let manutencao = 0;

    salasDoBloco.forEach(sala => {
      if (sala.status === "MANUTENCAO") {
        manutencao++;
        return;
      }
      if (filtroHorarioAtivo) {
        if (ocupacaoPorSala[sala.id]?.disponivelNoFiltro) disponiveis++;
        else ocupadas++;
        return;
      }
      const status = getStatusSala(sala.id);
      if (status?.tipo === "livre") disponiveis++;
      else if (status?.tipo === "ocupada" || status?.tipo === "parcial") ocupadas++;
    });

    return { total: salasDoBloco.length, disponiveis, ocupadas, manutencao };
  };

  const handleAbrirModalReserva = (sala) => {
    setHorarioInicio(filtroHorarioAtivo ? horaInicioFiltro : "08:00");
    setHorarioFim(filtroHorarioAtivo ? horaFimFiltro : "18:00");
    setModalReserva({ aberto: true, sala });
  };

  const handleConfirmarReserva = () => {
    const sala = modalReserva.sala;
    
    sessionStorage.removeItem(`rascunho-reserva-${user?.id ?? 'anonimo'}`);
    
    navigate("/solicitar-reserva", {
      state: { 
        data: dataSelecionada,
        salaId: sala.id,
        horaInicio: horarioInicio,
        horaFim: horarioFim
      }
    });
    setModalReserva({ aberto: false, sala: null });
  };

  return (
    <div className="disponibilidade-container">
      <div className="page-title-container">
        <h1 className="page-title">Consultar Disponibilidade</h1>
      </div>

      {/* filtros de data e horário */}
      <div className="filtros-disponibilidade">
        <div className="filtro-data-container">
          <label>Selecione a data</label>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
          />
        </div>

        <div className="filtro-data-container">
          <label>Horário</label>
          <div className="time-range">
            <input
              type="time"
              value={horaInicioFiltro}
              onChange={(e) => setHoraInicioFiltro(e.target.value)}
            />
            <span>até</span>
            <input
              type="time"
              value={horaFimFiltro}
              onChange={(e) => setHoraFimFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* legenda das cores e marcadores usados nos cards */}
      <div className="legenda-disponibilidade">
        <div className="legenda-item">
          <span className="legenda-bolinha legenda-verde" /> Disponível
        </div>
        <div className="legenda-item">
          <span className="legenda-bolinha legenda-amarela" /> Parcialmente ocupada
        </div>
        <div className="legenda-item">
          <span className="legenda-bolinha legenda-vermelha" /> Totalmente ocupada{filtroHorarioAtivo ? " / sem disponibilidade no horário buscado" : ""}
        </div>
        <div className="legenda-item">
          <span className="legenda-bolinha legenda-cinza" /> Em manutenção
        </div>
        <div className="legenda-item">
          <span className="legenda-marcador">✓</span> Reserva aprovada
        </div>
        {isGestorOuAdmin && (
          <div className="legenda-item">
            <span className="legenda-marcador legenda-marcador-pendente">⏳</span> Reserva pendente
          </div>
        )}
      </div>

      {/* modal de confirmacao de reserva com horario */}
      {modalReserva.aberto && modalReserva.sala && (
        <div className="modal-overlay" onClick={() => setModalReserva({ aberto: false, sala: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="#F27F20" stroke="#e06e10" strokeWidth="2"/>
                <path d="M24 32L30 38L42 26" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="modal-title">Confirmar Reserva</h3>
            
            <div style={{ 
              background: "#f9fafb", 
              borderRadius: "12px", 
              padding: "16px", 
              marginBottom: "16px",
              textAlign: "left"
            }}>
              <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "4px" }}>
                {modalReserva.sala.nome}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                {modalReserva.sala.bloco} · {modalReserva.sala.capacidade} pessoas
              </div>
              {modalReserva.sala.recursos && (
                <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                  {modalReserva.sala.recursos}
                </div>
              )}
              <div style={{ fontSize: "14px", color: "#374151", marginBottom: "4px" }}>
                Data: {formatarData(dataSelecionada)}
              </div>
            </div>

            {/* escolha do horario */}
            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#374151", marginBottom: "6px" }}>
                Selecione o horário
              </label>
              <div className="time-range">
                <input
                  type="time"
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                />
                <span>até</span>
                <input
                  type="time"
                  value={horarioFim}
                  onChange={(e) => setHorarioFim(e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                />
              </div>
            </div>

            <p className="modal-message" style={{ fontSize: "13px", color: "#6b7280" }}>
              Você será redirecionado para o formulário com os dados pré-preenchidos.
            </p>

            <div className="modal-buttons">
              <button className="modal-btn modal-btn-primary" onClick={handleConfirmarReserva}>
                Continuar
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={() => setModalReserva({ aberto: false, sala: null })}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* lista de salas por bloco */}
      {loading ? (
        <div className="loading-state">Carregando...</div>
      ) : Object.keys(salasPorBloco).length === 0 ? (
        <div className="sem-resultados">
          <h3>Nenhuma sala cadastrada</h3>
          <p>Entre em contato com o administrador do sistema.</p>
        </div>
      ) : (
        Object.entries(salasPorBloco).map(([bloco, salasDoBloco]) => {
          const contadores = calcularContadoresBloco(salasDoBloco);
          const salasParaExibir = filtroHorarioAtivo
            ? salasDoBloco.filter(sala => sala.status === "ATIVA" && ocupacaoPorSala[sala.id]?.disponivelNoFiltro)
            : salasDoBloco;

          return (
          <div key={bloco}>
            <div className="bloco-header-contador">
              <h2 className="bloco-titulo">{bloco}</h2>
              <span className="bloco-contador-texto">
                {contadores.total} salas · {contadores.disponiveis} disponíveis · {contadores.ocupadas} ocupadas · {contadores.manutencao} manutenção
              </span>
            </div>

            {salasParaExibir.length === 0 ? (
              <p className="empty-message">Nenhuma sala disponível nesse horário neste bloco.</p>
            ) : (
            <div className="salas-grid">
              {salasParaExibir.map(sala => {
                const status = getStatusSala(sala.id);

                if (!status) return null;

                const ocupacao = ocupacaoPorSala[sala.id];
                const isManutencao = status.tipo === "manutencao";
                const isOcupada = status.tipo === "ocupada";

                return (
                  <div 
                    key={sala.id} 
                    className={`sala-card ${isManutencao ? 'sala-manutencao' : ''}`}
                  >
                    <div className="sala-nome">{sala.nome}</div>

                    {sala.capacidade && (
                      <div className="sala-capacidade">
                        <ImUsers size={18} color="#6B7280" /> {sala.capacidade} pessoas
                      </div>
                    )}

                    <div className={`sala-status-badge ${status.classe}`}>
                      {status.label}
                    </div>

                    {sala.recursos && (
                      <div className="sala-recursos">{sala.recursos}</div>
                    )}

                    {!isManutencao && ocupacao?.reservas?.length > 0 && (
                      <div className="sala-horarios-ocupados">
                        {ocupacao.reservas.map(r => (
                          <div
                            key={r.id}
                            className={`sala-horario-item ${r.tipoOcupacao === "pendente" ? "horario-pendente" : "horario-aprovado"}`}
                          >
                            {r.tipoOcupacao === "pendente" ? "⏳" : "✓"} {formatarHorario(r.horaInicio)}–{formatarHorario(r.horaFim)}
                            {r.tipoOcupacao === "aprovado" && isGestorOuAdmin && r.usuarioEmail && (
                              <span className="sala-usuario-email">
                                · {r.usuarioEmail}
                              </span>
                            )}
                            {r.tipoOcupacao === "pendente" && (
                              <span className="sala-usuario-email">
                                · {r.usuarioNome || r.nome}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* botao reservar */}
                    {!isManutencao && (
                      <button
                        onClick={() => !isOcupada && handleAbrirModalReserva(sala)}
                        className={`btn-reservar-sala ${isOcupada ? 'btn-indisponivel' : ''}`}
                        disabled={isOcupada}
                      >
                        {isOcupada ? 'Sem disponibilidade' : 'Reservar'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
          );
        })
      )}
    </div>
  );
}