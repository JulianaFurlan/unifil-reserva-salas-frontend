<<<<<<< HEAD
// src/components/common/Layout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AiOutlineHome } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import { BsInboxes } from "react-icons/bs";
import logoUnifil from "../../assets/logo-Unifil.png";
import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app">
      <div className="top-thin-bar" />
      <header className="top-gray-bar">
        <div className="logo-container">
          <img src={logoUnifil} alt="Logo UniFil" className="logo-image" />
          <div className="divider">|</div>
          <div className="university-name">Centro Universitário Filadélfia</div>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-header"><span>Menu</span></div>

          <nav className="menu-list">
            {/* MENU - Solicitar Reserva (aparece para todos logados) */}
            <button 
              onClick={() => navigate("/solicitar-reserva")}
              className={`menu-item ${isActive("/solicitar-reserva") ? "active" : ""}`}
            >
              <AiOutlineHome size={28} />
              <span>Solicitar Reserva</span>
            </button>
            
            <button 
              onClick={() => navigate("/meus-pedidos")}
              className={`menu-item ${isActive("/meus-pedidos") ? "active" : ""}`}
            >
              <BsInboxes size={28} />
              <span>Meus Pedidos</span>
            </button>

            {/* MENU GESTOR - só aparece para GESTOR e ADMIN */}
            {(user?.tipo === 'GESTOR' || user?.tipo === 'ADMIN') && (
              <button 
                onClick={() => navigate("/gestor/solicitacoes")}
                className={`menu-item ${isActive("/gestor/solicitacoes") ? "active" : ""}`}
              >
                <BsCalendarCheck size={28} />
                <span>Gerenciar Reservas</span>
              </button>
            )}
          </nav>

          <div className="user-section">
            <div className="user-content">
              <div className="user-avatar-placeholder">
                {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info-sidebar">
                <span className="greeting">Olá,</span>
                <span className="user-name">{user?.nome || 'Usuário'}</span>
                <span className="user-role">{user?.tipo || 'COMUM'}</span>
              </div>
              <button onClick={logout} className="logout-btn">Sair</button>
            </div>
          </div>
        </aside>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
=======
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

export default function Layout() {
return (
<div className="app">
    <Header />
    
    <div className="main-layout">
    <Sidebar />
    
    <main className="content-area">
        <Outlet />
    </main>
    </div>
</div>
);
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
}