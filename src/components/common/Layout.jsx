import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AiOutlineHome, AiOutlineMenu, AiOutlineClose, AiOutlineLock } from "react-icons/ai";
import { BsCalendarCheck, BsInboxes } from "react-icons/bs";
import { FiUserPlus } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import { TbBuildingCog } from "react-icons/tb";
import BannerPrimeiroAcesso from "./BannerPrimeiroAcesso";
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
        {menuAberto && (
          <div
            className="sidebar-overlay"
            onClick={() => setMenuAberto(false)}
          />
        )}

        <aside className={`sidebar ${menuAberto ? '' : 'collapsed'}`}>
          <div className="sidebar-header">
            <span>Menu</span>
          </div>

          <nav className="menu-list">
            <button 
              onClick={() => { navigate("/solicitar-reserva"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/solicitar-reserva") ? "active" : ""}`}
            >
              <AiOutlineHome size={30} />
              <span>Solicitar Reserva</span>
            </button>

            <button 
              onClick={() => { navigate("/meus-pedidos"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/meus-pedidos") ? "active" : ""}`}
            >
              <BsInboxes size={27} />
              <span>Meus Pedidos</span>
            </button>

            <button
              onClick={() => { navigate("/consultar-disponibilidade"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/consultar-disponibilidade") ? "active" : ""}`}
            >
              <LuSearch size={28} />
              <span>Disponibilidade</span>
            </button>

            {(user?.tipo === 'GESTOR' || user?.tipo === 'ADMIN') && (
              <button 
                onClick={() => { navigate("/gestor/solicitacoes"); setMenuAberto(false); }}
                className={`menu-item ${isActive("/gestor/solicitacoes") ? "active" : ""}`}
              >
                <BsCalendarCheck size={27} />
                <span>Gerenciar Reservas</span>
              </button>
            )}

            {(user?.tipo === 'ADMIN') && (
            <button 
              onClick={() => { navigate("/admin/salas"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/admin/salas") ? "active" : ""}`}
            >
              <TbBuildingCog size={29} />
              <span>Gerenciar Salas</span>
            </button>
            )}

            {(user?.tipo === 'ADMIN') && (
            <button 
              onClick={() => { navigate("/admin/usuarios"); setMenuAberto(false); }}
              className={`menu-item ${isActive("/admin/usuarios") ? "active" : ""}`}
            >
              <FiUserPlus size={29} />
              <span>Gerenciar Usuários</span>
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
              <button
                onClick={() => navigate('/alterar-senha')}
                className={`alterar-senha-btn ${user?.senhaTemporaria ? 'alterar-senha-btn-destaque' : ''}`}
              >
                <AiOutlineLock size={14} />
                Alterar senha
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Sair
              </button>
            </div>
          </div>
        </aside>

        <main className="content-area">
          {user?.senhaTemporaria && (
            <div className="banner-senha-temp">
              <AiOutlineLock size={20} className="banner-senha-temp-icone" />
              <p className="banner-senha-temp-texto">
                Você está usando a senha temporária gerada pelo administrador. Clique em{" "}
                <strong>"Alterar senha"</strong> no menu lateral para definir uma senha pessoal.
              </p>
              <button
                type="button"
                className="banner-senha-temp-btn"
                onClick={() => navigate('/alterar-senha')}
              >
                Alterar senha
              </button>
            </div>
          )}
          <BannerPrimeiroAcesso />
          <Outlet />
        </main>
      </div>
    </div>
  );
}