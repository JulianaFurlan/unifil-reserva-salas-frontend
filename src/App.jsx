// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";
import Login from "./pages/auth/Login";
import SolicitarReserva from "./pages/comum/SolicitarReserva";

function EmDesenvolvimento() {
  return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <h2>🚧 Página em Desenvolvimento</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/solicitar-reserva" element={<SolicitarReserva />} />
            <Route path="/gestor/solicitacoes" element={<EmDesenvolvimento />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;