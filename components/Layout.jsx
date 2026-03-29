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


{/* COMPONENTE DO USUÁRIO (novo) */}
<div className="user-info">
<img 
    src="https://i.pravatar.cc/40"     // ← Troque depois pela foto real da Juliana
    alt="Foto do usuário" 
    className="user-avatar"
/>
<div className="user-greeting">
    Olá, Juliana
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
            <AiOutlineSearch size={39} />
            Consultar Disponibilidade
        </a>
        <a href="#" className="menu-item">
            <BsInboxes size={23} />
            Meus pedidos
        </a>
        </nav>
    </aside>

    {/* ONDE O CONTEÚDO DE CADA PÁGINA VAI APARECER */}
    <main className="content-area">
        <Outlet />   {/* ← Aqui entra o conteúdo de Reserva, etc */}
    </main>
    </div>
</div>
);
}