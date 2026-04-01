import { 
AiOutlineHome, 
AiOutlineSearch 
} from "react-icons/ai";
import { 
BsInboxes 
} from "react-icons/bs";
import { Outlet } from "react-router-dom";
import logoUnifil from "../assets/logo-Unifil.png";
import "./Layout.css";

export default function Layout() {
return (
<div className="app">
    {/* LINHA LARANJA NO TOPO */}
    <div className="top-thin-bar" />

    {/* FAIXA CINZA CLARO COM LOGO E NOME */}
    <header className="top-gray-bar">
    <div className="logo-container">
    <img 
        src={logoUnifil} 
        alt="Logo UniFil" 
        className="logo-image"
    />

    <div className="divider">|</div>

    <div className="university-name">
    Centro Universitário Filadélfia
    </div>
</div>
</header>

    <div className="main-layout">
    {/* SIDEBAR*/}
    <aside className="sidebar">
        <div className="sidebar-header">
        <span className="menu-icon">☰</span>
        <span>Menu</span>
        </div>

        <nav className="menu-list">
        <a href="#" className="menu-item active">
            <AiOutlineHome size={28} />
            Solicitar Reserva
        </a>
        <a href="#" className="menu-item">
            <AiOutlineSearch size={35} />
            Conferir Disponibilidade
        </a>
        <a href="#" className="menu-item">
            <BsInboxes size={23} />
            Meus pedidos
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

    {/* CONTEÚDO DE CADA PÁGINA */}
    <main className="content-area">
        <Outlet />
    </main>
    </div>
</div>
);
}