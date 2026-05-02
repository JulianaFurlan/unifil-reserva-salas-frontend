<<<<<<< HEAD
// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  // Enquanto carrega, mostra tela de loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Carregando...
      </div>
    );
  }

  // Se não tem usuário logado, vai para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se tem roles especificadas e usuário não tem permissão
  if (roles.length > 0 && !roles.includes(user.tipo)) {
    // Redireciona baseado no tipo
    if (user.tipo === 'COMUM') return <Navigate to="/solicitar-reserva" replace />;
    if (user.tipo === 'GESTOR') return <Navigate to="/gestor/solicitacoes" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
=======
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, roles = [] }) {
const { user, loading } = useAuth();

if (loading) {
return (
    <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
    }}>
    Carregando...
    </div>
);
}

if (!user) {
return <Navigate to="/login" replace />;
}

if (roles.length > 0 && !roles.includes(user.tipo)) {
// Redireciona baseado no tipo de usuário
if (user.tipo === 'COMUM') return <Navigate to="/solicitar-reserva" replace />;
if (user.tipo === 'GESTOR') return <Navigate to="/gestor/solicitacoes" replace />;
if (user.tipo === 'ADMIN') return <Navigate to="/admin/salas" replace />;
return <Navigate to="/solicitar-reserva" replace />;
}

return children || <Outlet />;
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
}