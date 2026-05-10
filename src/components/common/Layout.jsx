// src/components/common/Layout.jsx
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AiOutlineHome, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { BsCalendarCheck, BsInboxes } from "react-icons/bs";
import logoUnifil from "../../assets/logo-Unifil.png";
import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <div className="app">
      <div className="top-thin-bar" />
      
      <header className="top-gray-bar">
        <button className="menu-toggle" onClick={toggleMenu}>
          {menuAberto ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
        <div className="logo-container">
          <img src={logoUnifil} alt="Logo UniFil" className="logo-image" />
          <div className="divider">|</div>
          <div className="university-name">Centro Universitário Filadélfia</div>
        </div>
      </header>

      <div className="main-layout">
        <aside className={`sidebar ${menuAberto ? '' : 'collapsed'}`}>
          <div className="sidebar-header">
            <span>Menu</span>
          </div>

          <nav className="menu-list">
            <button 
              onClick={() => { navigate("/solicitar-reserva"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/solicitar-reserva") ? "active" : ""}`}
            >
              <AiOutlineHome size={28} />
              <span>Solicitar Reserva</span>
            </button>

            <button 
              onClick={() => { navigate("/meus-pedidos"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/meus-pedidos") ? "active" : ""}`}
            >
              <BsInboxes size={28} />
              <span>Meus Pedidos</span>
            </button>

            {(user?.tipo === 'GESTOR' || user?.tipo === 'ADMIN') && (
              <button 
                onClick={() => { navigate("/gestor/solicitacoes"); setMenuAberto(false); }}
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
              <button onClick={handleLogout} className="logout-btn">
                Sair
              </button>
            </div>
          </div>
        </aside>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}