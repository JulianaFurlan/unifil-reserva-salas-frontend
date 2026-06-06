import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { BsInboxes } from "react-icons/bs";
import { 
  AiOutlineHome, AiOutlineSearch, AiOutlineCalendar,
  AiOutlineFileText, AiOutlineTeam, AiOutlineDoor
} from "react-icons/ai";

export default function Sidebar() {
  const { user } = useAuth();

  const isAdmin = user?.tipo === "ADMIN";
  const isGestor = user?.tipo === "GESTOR" || user?.tipo === "ADMIN";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Menu</span>
      </div>

      <nav className="menu-list">

        {/* TODOS OS USUÁRIOS */}
        <NavLink to="/solicitar-reserva"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <AiOutlineHome size={28} />
          <span>Solicitar Reserva</span>
        </NavLink>

        <NavLink to="/conferir-disponibilidade"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <AiOutlineSearch size={28} />
          <span>Conferir Disponibilidade</span>
        </NavLink>

        <NavLink to="/meus-pedidos"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <BsInboxes size={28} />
          <span>Meus Pedidos</span>
        </NavLink>

        {/* GESTOR E ADMIN */}
        {isGestor && (
          <>
            <div className="menu-divider" />
            <NavLink to="/gestor/solicitacoes"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <AiOutlineFileText size={28} />
              <span>Gerenciar Solicitações</span>
            </NavLink>
          </>
        )}

        {/* SOMENTE ADMIN */}
        {isAdmin && (
          <>
            <div className="menu-divider" />
            <NavLink to="/admin/salas"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <AiOutlineDoor size={28} />
              <span>Gerenciar Salas</span>
            </NavLink>

            <NavLink to="/admin/usuarios"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <AiOutlineTeam size={28} />
              <span>Gerenciar Usuários</span>
            </NavLink>

            <NavLink to="/admin/relatorios"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <AiOutlineCalendar size={28} />
              <span>Relatórios</span>
            </NavLink>
          </>
        )}

      </nav>

      <div className="user-section">
        <div className="user-content">
          <img
            src="https://i.pravatar.cc/150?img=26"
            alt="Usuário"
            className="user-avatar"
          />
          <div className="user-info-sidebar">
            <span className="greeting">Olá,</span>
            <span className="user-name">{user?.nome || "Usuário"}</span>
            <span className="user-role">{user?.tipo || "COMUM"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}