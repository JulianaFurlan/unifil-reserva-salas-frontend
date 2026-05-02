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
}