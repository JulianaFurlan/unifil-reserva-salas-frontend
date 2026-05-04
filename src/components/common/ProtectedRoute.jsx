import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.tipo)) {
    if (user.tipo === 'COMUM') return <Navigate to="/solicitar-reserva" replace />;
    if (user.tipo === 'GESTOR') return <Navigate to="/gestor/solicitacoes" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}