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
}