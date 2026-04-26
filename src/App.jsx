// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';

// Páginas Comum
import SolicitarReserva from './pages/comum/SolicitarReserva';
import MinhasSolicitacoes from './pages/comum/MinhasSolicitacoes';
import ConsultaDisponibilidade from './pages/comum/ConsultaDisponibilidade';

// Páginas Gestor
import GerenciarSolicitacoes from './pages/gestor/GerenciarSolicitacoes';

// Páginas Admin
import CadastroSalas from './pages/admin/CadastroSalas';
import CadastroUsuarios from './pages/admin/CadastroUsuarios';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota de Login - SEM LAYOUT */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas - COM LAYOUT */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Redirecionamento padrão */}
            <Route path="/" element={<Navigate to="/solicitar-reserva" replace />} />
            
            {/* Rotas COMUM */}
            <Route path="solicitar-reserva" element={<SolicitarReserva />} />
            <Route path="minhas-solicitacoes" element={<MinhasSolicitacoes />} />
            <Route path="conferir-disponibilidade" element={<ConsultaDisponibilidade />} />
            
            {/* Rotas GESTOR */}
            <Route path="gestor/solicitacoes" element={
              <ProtectedRoute roles={['GESTOR', 'ADMIN']}>
                <GerenciarSolicitacoes />
              </ProtectedRoute>
            } />
            
            {/* Rotas ADMIN */}
            <Route path="admin/salas" element={
              <ProtectedRoute roles={['ADMIN']}>
                <CadastroSalas />
              </ProtectedRoute>
            } />
            <Route path="admin/usuarios" element={
              <ProtectedRoute roles={['ADMIN']}>
                <CadastroUsuarios />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;