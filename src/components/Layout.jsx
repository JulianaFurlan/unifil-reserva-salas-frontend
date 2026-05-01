// src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { BsInboxes } from "react-icons/bs";
import logoUnifil from "../assets/logo-Unifil.png";
import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app">
      <div className="top-thin-bar" />

      <header className="top-gray-bar">
        <div className="logo-container">
          <img src={logoUnifil} alt="Logo UniFil" className="logo-image" />
          <div className="divider">|</div>
          <div className="university-name">
            Centro Universitário Filadélfia
          </div>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>Menu</span>
          </div>

          <nav className="menu-list">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/solicitar-reserva");
              }}
              className={`menu-item ${isActive("/solicitar-reserva") ? "active" : ""}`}
            >
              <AiOutlineHome size={28} />
              <span>Solicitar Reserva</span>
            </a>
            
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/meus-pedidos");
              }}
              className={`menu-item ${isActive("/meus-pedidos") ? "active" : ""}`}
            >
              <BsInboxes size={28} />
              <span>Meus pedidos</span>
            </a>
          </nav>

          <div className="user-section">
            <div className="user-content">
              <img 
                src="https://i.pravatar.cc/150?img=26" 
                alt="Juliana Furlan" 
                className="user-avatar"
              />
              <div className="user-info-sidebar">
                <span className="greeting">Olá,</span>
                <span className="user-name">Juliana</span>
              </div>
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