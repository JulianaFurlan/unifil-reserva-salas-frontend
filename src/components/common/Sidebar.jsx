import { NavLink } from "react-router-dom";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { BsInboxes } from "react-icons/bs";

export default function Sidebar() {
return (
<aside className="sidebar">
    <div className="sidebar-header">
    <span>Menu</span>
    </div>

    <nav className="menu-list">
    <NavLink 
        to="/solicitar-reserva" 
        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
    >
        <AiOutlineHome size={28} />
        <span>Solicitar Reserva</span>
    </NavLink>
    
    <NavLink 
        to="/conferir-disponibilidade" 
        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
    >
        <AiOutlineSearch size={28} />
        <span>Conferir Disponibilidade</span>
    </NavLink>
    
    <NavLink 
        to="/meus-pedidos" 
        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
    >
        <BsInboxes size={28} />
        <span>Meus pedidos</span>
    </NavLink>
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
);
}