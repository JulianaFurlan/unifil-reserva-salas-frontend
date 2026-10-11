import { useState, useEffect, useMemo } from "react";
import { getSalas, criarSala, editarSala, alterarStatusSala, deletarSala } from "../../services/adminService";
import api from "../../services/api";
import Toast from "../../components/Toast";
import { useToasts } from "../../hooks/useToasts";
import { hojeISO, reservaEncerradaHoje } from "../../utils/horarios";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineSwap, AiOutlineTeam } from "react-icons/ai";
import "../styles/reserva.css";

const FORM_VAZIO = {
  nome: "",
  bloco: "",
  tipo: "",
  capacidade: "",
  recursos: "",
  status: "ATIVA",
};

const STATUS_OPCOES = [
  { value: "ATIVA", label: "Ativa" },
  { value: "MANUTENCAO", label: "Em Manutenção" },
  { value: "INATIVA", label: "Inativa" },
];

const PROXIMO_STATUS = {
  ATIVA: "MANUTENCAO",
  MANUTENCAO: "INATIVA",
  INATIVA: "ATIVA",
};

const LABEL_STATUS = {
  ATIVA: "Ativa",
  MANUTENCAO: "Em Manutenção",
  INATIVA: "Inativa",
};

const TABS = [
  { valor: "TODAS", label: "Todas" },
  { valor: "ATIVA", label: "Ativas" },
  { valor: "MANUTENCAO", label: "Manutenção" },
  { valor: "INATIVA", label: "Inativas" },
];

const validarCapacidade = (valor) => {
  if (!valor) return true;
  const num = Number(valor);
  if (isNaN(num)) return false;
  if (num < 0) return false;
  if (num > 999) return false;
  return true;
};

export default function GerenciarSalas() {
  const [salas, setSalas] = useState([]);
  const [reservasAprovadas, setReservasAprovadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToasts();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODAS");

  const [modal, setModal] = useState({ aberto: false, sala: null });
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState({});

  const [modalExcluir, setModalExcluir] = useState({ aberto: false, sala: null, etapa: 1 });
  const [excluindo, setExcluindo] = useState(false);

  const [modalDesativar, setModalDesativar] = useState({
    aberto: false, sala: null, novoStatus: null, totalReservas: 0
  });

  const [salaDestaqueId, setSalaDestaqueId] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);
      const [salasRes, reservasRes] = await Promise.all([
        getSalas(),
        api.get("/reservas/aprovadas"),
      ]);
      setSalas(salasRes.data);
      setReservasAprovadas(reservasRes.data);
    } catch {
      addToast("error", "Erro ao carregar salas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const totalAtivas = salas.filter(s => s.status === "ATIVA").length;
  const totalManutencao = salas.filter(s => s.status === "MANUTENCAO").length;
  const totalInativas = salas.filter(s => s.status === "INATIVA").length;

  const blocosExistentes = useMemo(
    () => [...new Set(salas.map(s => s.bloco).filter(Boolean))],
    [salas]
  );

  const salasPorBloco = useMemo(() => {
    let lista = salas;

    if (filtroStatus !== "TODAS") {
      lista = lista.filter(s => s.status === filtroStatus);
    }

    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter(s =>
        s.nome.toLowerCase().includes(termo) || s.bloco.toLowerCase().includes(termo)
      );
    }

    const agrupado = {};
    [...lista]
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .forEach(sala => {
        if (!agrupado[sala.bloco]) agrupado[sala.bloco] = [];
        agrupado[sala.bloco].push(sala);
      });
    return agrupado;
  }, [salas, filtroStatus, busca]);

  const salaOcupadaHoje = (salaId) => {
    const hoje = hojeISO();
    return reservasAprovadas.some(r =>
      r.salaId === salaId && r.data === hoje && !reservaEncerradaHoje(r.data, r.horaFim)
    );
  };

  const reservasFuturasDaSala = (salaId) => {
    const hoje = hojeISO();
    return reservasAprovadas.filter(r =>
      r.salaId === salaId &&
      (r.data > hoje || (r.data === hoje && !reservaEncerradaHoje(r.data, r.horaFim)))
    );
  };

  const abrirModal = (sala = null) => {
    setErros({});
    setForm(sala ? {
      nome: sala.nome,
      bloco: sala.bloco,
      tipo: sala.tipo || "",
      capacidade: sala.capacidade || "",
      recursos: sala.recursos || "",
      status: sala.status,
    } : FORM_VAZIO);
    setModal({ aberto: true, sala });
  };

  const fecharModal = () => {
    setModal({ aberto: false, sala: null });
    setForm(FORM_VAZIO);
    setErros({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "capacidade" && value && !validarCapacidade(value)) {
      setErros(prev => ({ ...prev, capacidade: "Capacidade inválida (máx 999 pessoas)" }));
    } else if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const salvar = async (e) => {
    e.preventDefault();

    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório";
    if (!form.bloco.trim()) novosErros.bloco = "Bloco é obrigatório";
    if (form.capacidade && !validarCapacidade(form.capacidade)) {
      novosErros.capacidade = "Capacidade inválida (máx 999 pessoas)";
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      addToast("warning", "Preencha os campos obrigatórios corretamente");
      return;
    }

    setSalvando(true);
    try {
      if (modal.sala) {
        await editarSala(modal.sala.id, form);
        addToast("success", "Sala atualizada!");
        fecharModal();
        carregar();
      } else {
        const res = await criarSala(form);
        addToast("success", "Sala cadastrada!");
        fecharModal();
        await carregar();
        const novoId = res?.data?.id;
        if (novoId) {
          setSalaDestaqueId(novoId);
          setTimeout(() => setSalaDestaqueId(null), 3000);
        }
      }
    } catch (err) {
      addToast("error", err.response?.data?.message || "Erro ao salvar sala");
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = (sala) => {
    const novoStatus = PROXIMO_STATUS[sala.status] || "ATIVA";

    if (novoStatus !== "ATIVA") {
      const futuras = reservasFuturasDaSala(sala.id);
      if (futuras.length > 0) {
        setModalDesativar({ aberto: true, sala, novoStatus, totalReservas: futuras.length });
        return;
      }
    }

    confirmarAlterarStatus(sala, novoStatus);
  };

  const fecharModalDesativar = () => {
    setModalDesativar({ aberto: false, sala: null, novoStatus: null, totalReservas: 0 });
  };

  const confirmarAlterarStatus = async (sala, novoStatus) => {
    try {
      await alterarStatusSala(sala.id, novoStatus);
      addToast("success", `Sala "${sala.nome}" agora está ${LABEL_STATUS[novoStatus]}`);
      carregar();
    } catch (err) {
      addToast("error", err.response?.data?.message || "Erro ao alterar status");
    } finally {
      fecharModalDesativar();
    }
  };

  const abrirModalExcluir = (sala) => setModalExcluir({ aberto: true, sala, etapa: 1 });
  const fecharModalExcluir = () => setModalExcluir({ aberto: false, sala: null, etapa: 1 });
  const avancarConfirmacaoExcluir = () => setModalExcluir(prev => ({ ...prev, etapa: 2 }));

  // backend bloqueia a exclusao e retorna erro quando a sala ainda tem reserva associada
  const temReservaCadastrada = (err) =>
    err.response?.status === 409 || /reserva/i.test(err.response?.data?.message || "");

  const excluirSala = async () => {
    const { sala } = modalExcluir;
    setExcluindo(true);
    try {
      await deletarSala(sala.id);
      addToast("success", `Sala "${sala.nome}" excluída`);
      fecharModalExcluir();
      carregar();
    } catch (err) {
      fecharModalExcluir();
      if (temReservaCadastrada(err)) {
        addToast("error", err.response?.data?.message || "Esta sala possui reservas associadas e não pode ser excluída.");
      } else {
        addToast("error", err.response?.data?.message || "Não foi possível excluir esta sala");
      }
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="gs-container">
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} id={t.id} type={t.type} message={t.message} onClose={removeToast} duration={3000} />
        ))}
      </div>

      {/* modal de exclusao, duas etapas de confirmacao */}
      {modalExcluir.aberto && (
        <div className="modal-overlay" onClick={fecharModalExcluir}>
          <div className="gs-modal gs-modal-pequeno" onClick={e => e.stopPropagation()}>
            {modalExcluir.etapa === 1 ? (
              <>
                <h3 className="gs-modal-titulo">Excluir Sala</h3>
                <p className="gs-modal-texto">
                  Tem certeza que deseja excluir a sala <strong>"{modalExcluir.sala?.nome}"</strong>?
                  Essa ação não pode ser desfeita. Se a sala tiver reservas associadas, a exclusão será bloqueada.
                </p>
                <div className="gs-modal-rodape">
                  <button type="button" className="gs-btn-cancelar" onClick={fecharModalExcluir}>
                    Cancelar
                  </button>
                  <button type="button" className="gs-btn-excluir-confirmar" onClick={avancarConfirmacaoExcluir}>
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="gs-modal-titulo">Confirmar exclusão definitiva</h3>
                <p className="gs-modal-texto">
                  Última confirmação: a sala <strong>"{modalExcluir.sala?.nome}"</strong> será excluída{" "}
                  <strong>permanentemente</strong> e não poderá ser recuperada. Deseja mesmo excluir?
                </p>
                <div className="gs-modal-rodape">
                  <button type="button" className="gs-btn-cancelar" onClick={fecharModalExcluir}>
                    Cancelar
                  </button>
                  <button type="button" className="gs-btn-excluir-confirmar" onClick={excluirSala} disabled={excluindo}>
                    {excluindo ? "Excluindo..." : "Sim, excluir definitivamente"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* modal de aviso ao desativar sala com reservas futuras */}
      {modalDesativar.aberto && (
        <div className="modal-overlay" onClick={fecharModalDesativar}>
          <div className="gs-modal gs-modal-pequeno" onClick={e => e.stopPropagation()}>
            <h3 className="gs-modal-titulo">Sala com reservas futuras</h3>
            <p className="gs-modal-texto">
              A sala <strong>"{modalDesativar.sala?.nome}"</strong> tem {modalDesativar.totalReservas}{" "}
              reserva{modalDesativar.totalReservas !== 1 ? "s" : ""} aprovada{modalDesativar.totalReservas !== 1 ? "s" : ""}{" "}
              que ainda vão acontecer. Ao deixar a sala <strong>{LABEL_STATUS[modalDesativar.novoStatus]}</strong>,
              essas reservas serão canceladas e os usuários avisados por email. Deseja continuar?
            </p>
            <div className="gs-modal-rodape">
              <button type="button" className="gs-btn-cancelar" onClick={fecharModalDesativar}>
                Cancelar
              </button>
              <button
                type="button"
                className="gs-btn-salvar"
                onClick={() => confirmarAlterarStatus(modalDesativar.sala, modalDesativar.novoStatus)}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal de cadastro e edicao */}
      {modal.aberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="gs-modal" onClick={e => e.stopPropagation()}>
            <h3 className="gs-modal-titulo">{modal.sala ? "Editar Sala" : "Nova Sala"}</h3>

            <form onSubmit={salvar}>
              <div className="gs-modal-grid-2">
                <div className="gs-campo">
                  <label>Nome <span className="gs-obrigatorio">*</span></label>
                  <input
                    className="gs-input"
                    value={form.nome}
                    onChange={handleChange}
                    name="nome"
                    placeholder="Ex: Lab 2"
                  />
                  {erros.nome && <p className="gs-erro-campo">{erros.nome}</p>}
                </div>

                <div className="gs-campo">
                  <label>Bloco <span className="gs-obrigatorio">*</span></label>
                  <input
                    className="gs-input"
                    list="gs-blocos-lista"
                    value={form.bloco}
                    onChange={handleChange}
                    name="bloco"
                    placeholder="Ex: SEDE, Ipollon II"
                  />
                  <datalist id="gs-blocos-lista">
                    {blocosExistentes.map(b => <option key={b} value={b} />)}
                  </datalist>
                  {erros.bloco && <p className="gs-erro-campo">{erros.bloco}</p>}
                </div>
              </div>

              <div className="gs-modal-grid-2">
                <div className="gs-campo">
                  <label>Capacidade</label>
                  <input
                    className="gs-input"
                    type="number"
                    min="1"
                    max="999"
                    value={form.capacidade}
                    onChange={handleChange}
                    name="capacidade"
                    placeholder="Nº de pessoas"
                  />
                  {erros.capacidade && <p className="gs-erro-campo">{erros.capacidade}</p>}
                </div>

                <div className="gs-campo">
                  <label>Status</label>
                  <select className="gs-select" value={form.status} onChange={handleChange} name="status">
                    {STATUS_OPCOES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gs-campo">
                <label>Tipo</label>
                <input
                  className="gs-input"
                  value={form.tipo}
                  onChange={handleChange}
                  name="tipo"
                  placeholder="Ex: Laboratório, Sala de Aula, Auditório"
                />
              </div>

              <div className="gs-campo">
                <label>Recursos</label>
                <input
                  className="gs-input"
                  value={form.recursos}
                  onChange={handleChange}
                  name="recursos"
                  placeholder="Ex: Projetor, Ar-condicionado, Quadro"
                />
              </div>

              <div className="gs-modal-rodape">
                <button type="button" className="gs-btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="gs-btn-salvar" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* cabecalho */}
      <div className="gs-header">
        <div className="gs-header-titulo">
          <h1>Gerenciar Salas</h1>
          <span className="gs-header-contador">
            {salas.length} sala{salas.length !== 1 ? "s" : ""} cadastrada{salas.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button className="gs-btn-nova" onClick={() => abrirModal()}>
          <AiOutlinePlus size={18} /> Nova Sala
        </button>
      </div>

      {/* estatisticas */}
      <div className="gs-stats-bar">
        <div className="gs-stat-card gs-stat-card-ativa">
          <span className="gs-stat-numero">{totalAtivas}</span>
          <span className="gs-stat-label">Ativas</span>
        </div>
        <div className="gs-stat-card gs-stat-card-manutencao">
          <span className="gs-stat-numero">{totalManutencao}</span>
          <span className="gs-stat-label">Em manutenção</span>
        </div>
        <div className="gs-stat-card gs-stat-card-inativa">
          <span className="gs-stat-numero">{totalInativas}</span>
          <span className="gs-stat-label">Inativas</span>
        </div>
      </div>

      {/* busca e filtros */}
      <div className="gs-search-filter-bar">
        <input
          type="text"
          className="gs-busca-input"
          placeholder="Buscar por nome ou bloco..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="gs-tabs">
          {TABS.map(tab => (
            <button
              key={tab.valor}
              type="button"
              className={`gs-tab ${filtroStatus === tab.valor ? "gs-tab-ativa" : ""}`}
              onClick={() => setFiltroStatus(tab.valor)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* listagem */}
      {loading ? (
        <div className="gs-loading">Carregando...</div>
      ) : Object.keys(salasPorBloco).length === 0 ? (
        <p className="gs-vazio">Nenhuma sala encontrada.</p>
      ) : (
        Object.entries(salasPorBloco).map(([bloco, salasDoBloco]) => (
          <div key={bloco} className="gs-bloco-section">
            <div className="gs-bloco-header">
              <h2>{bloco}</h2>
              <span className="gs-bloco-contador">{salasDoBloco.length}</span>
            </div>

            <div className="gs-cards-grid">
              {salasDoBloco.map(sala => {
                const classeStatus =
                  sala.status === "ATIVA" ? "gs-sala-ativa" :
                  sala.status === "MANUTENCAO" ? "gs-sala-manutencao" :
                  "gs-sala-inativa";

                const ocupada = salaOcupadaHoje(sala.id);

                const recursos = sala.recursos
                  ? sala.recursos.split(",").map(r => r.trim()).filter(Boolean)
                  : [];

                return (
                  <div
                    key={sala.id}
                    className={`gs-sala-card ${classeStatus} ${salaDestaqueId === sala.id ? "gs-sala-highlight" : ""}`}
                  >
                    <div className="gs-sala-nome">{sala.nome}</div>

                    <span className={`gs-sala-status-badge gs-status-${sala.status.toLowerCase()}`}>
                      {LABEL_STATUS[sala.status] || sala.status}
                    </span>

                    {sala.status !== "INATIVA" && (
                      <div className={`gs-ocupacao-hoje ${ocupada ? "gs-ocupada-hoje" : "gs-livre-hoje"}`}>
                        {ocupada ? "Ocupada hoje" : "Livre hoje"}
                      </div>
                    )}

                    <div className="gs-sala-info">
                      {sala.tipo && <span className="gs-sala-tipo">{sala.tipo}</span>}
                      {sala.capacidade && (
                        <span className="gs-sala-capacidade">
                          <AiOutlineTeam size={14} /> {sala.capacidade} pessoas
                        </span>
                      )}
                    </div>

                    {recursos.length > 0 && (
                      <div className="gs-sala-recursos-chips">
                        {recursos.map((r, i) => (
                          <span key={`${sala.id}-${i}`} className="gs-recurso-chip">{r}</span>
                        ))}
                      </div>
                    )}

                    <div className="gs-sala-acoes">
                      <div className="gs-sala-acoes-topo">
                        <button className="gs-btn-acao gs-btn-editar" onClick={() => abrirModal(sala)} title="Editar sala">
                          <AiOutlineEdit size={16} /> Editar
                        </button>
                        <button
                          className="gs-btn-acao gs-btn-acao-perigo"
                          onClick={() => abrirModalExcluir(sala)}
                          title="Excluir sala"
                        >
                          <AiOutlineDelete size={16} /> Excluir
                        </button>
                      </div>
                      <button
                        className="gs-btn-acao gs-btn-status"
                        onClick={() => alternarStatus(sala)}
                        title="Alternar status"
                      >
                        <AiOutlineSwap size={16} /> Alterar {LABEL_STATUS[PROXIMO_STATUS[sala.status] || "ATIVA"]}
                      </button>
                    </div>
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
