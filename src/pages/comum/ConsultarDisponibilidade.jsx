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
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  });

  const isGestorOuAdmin = user?.tipo === 'GESTOR' || user?.tipo === 'ADMIN';

  // CARREGA SALAS E RESERVAS
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [salasRes, reservasRes] = await Promise.all([
          api.get("/salas"),
          api.get("/reservas/aprovadas"),
        ]);
        setSalas(salasRes.data);
        setReservas(reservasRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // AGRUPA SALAS POR BLOCO
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

  // CALCULA OCUPAÇÃO DE CADA SALA NA DATA SELECIONADA
  const ocupacaoPorSala = useMemo(() => {
    const ocupacao = {};
    salas.forEach(sala => {
      const reservasDaSala = reservas.filter(r => 
        r.salaId === sala.id && r.data === dataSelecionada
      );
      
      reservasDaSala.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      
      ocupacao[sala.id] = {
        sala,
        reservas: reservasDaSala,
        totalReservas: reservasDaSala.length,
        ocupacaoTotal: reservasDaSala.some(r => 
          r.horaInicio <= "08:00:00" && r.horaFim >= "22:00:00"
        ),
      };
    });
    return ocupacao;
  }, [salas, reservas, dataSelecionada]);

  // DETERMINA STATUS DA SALA
  const getStatusSala = (salaId) => {
    const sala = salas.find(s => s.id === salaId);
    const ocupacao = ocupacaoPorSala[salaId];

    if (sala?.status === "INATIVA") {
      return null;
    };

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

  const handleReservar = (salaId) => {
    navigate("/solicitar-reserva", {
      state: { 
        data: dataSelecionada,
        salaId: salaId 
      }
    });
  };

  return (
    <div className="disponibilidade-container">
      <div className="page-title-container">
        <h1 className="page-title">Consultar Disponibilidade</h1>
      </div>

      {/* FILTRO DE DATA */}
      <div className="filtro-data-container">
        <label>Selecione a data</label>
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
        />
      </div>

      {/* LISTA DE SALAS POR BLOCO */}
      {loading ? (
        <div className="loading-state">Carregando...</div>
      ) : Object.keys(salasPorBloco).length === 0 ? (
        <div className="sem-resultados">
          <h3>Nenhuma sala cadastrada</h3>
          <p>Entre em contato com o administrador do sistema.</p>
        </div>
      ) : (
        Object.entries(salasPorBloco).map(([bloco, salasDoBloco]) => (
          <div key={bloco}>
            <h2 className="bloco-titulo">{bloco}</h2>
            <div className="salas-grid">
            {salasDoBloco.map(sala => {
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

                    {/* HORÁRIOS OCUPADOS COM NOME DO PROFESSOR (GESTOR/ADMIN) */}
                    {!isManutencao && ocupacao?.reservas?.length > 0 && (
                      <div className="sala-horarios-ocupados">
                        {ocupacao.reservas.map(r => (
                          <div key={r.id} className="sala-horario-item">
                            {formatarHorario(r.horaInicio)}–{formatarHorario(r.horaFim)}
                            {isGestorOuAdmin && r.usuarioNome && (
                              <span className="sala-usuario-nome">
                                · {r.usuarioNome}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BOTÃO RESERVAR */}
                    {!isManutencao && (
                      <button
                        onClick={() => !isOcupada && handleReservar(sala.id)}
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
          </div>
        ))
      )}
    </div>
  );
}