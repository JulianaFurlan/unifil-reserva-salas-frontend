// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Reserva from "./pages/Reserva";
import MeusPedidos from "./pages/MeusPedidos";
import Toast from "./components/common/Toast";

function App() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { type, message, title } = event.detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message, title }]);
      
      // Remove automaticamente após 3 segundos
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener("showToast", handleToast);

    return () => {
      window.removeEventListener("showToast", handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <BrowserRouter>
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={removeToast}
            duration={3000}
          />
        ))}
      </div>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="solicitar-reserva" element={<Reserva />} />
          <Route path="meus-pedidos" element={<MeusPedidos />} />
          <Route index element={<Reserva />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;