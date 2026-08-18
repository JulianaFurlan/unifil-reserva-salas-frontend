import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToasts } from '../../hooks/useToasts';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import logoUnifil from '../../assets/logo-Unifil.png';
import './login.css';
import '../styles/reserva.css';

const rotaPorTipo = (tipo) => {
  if (tipo === 'ADMIN') return '/admin/salas';
  if (tipo === 'GESTOR') return '/gestor/solicitacoes';
  return '/solicitar-reserva';
};

export default function AlterarSenha() {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (authLoading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      addToast('warning', 'Preencha todos os campos');
      return;
    }
    if (novaSenha.length < 6) {
      addToast('warning', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (novaSenha === senhaAtual) {
      addToast('warning', 'A nova senha deve ser diferente da senha atual');
      return;
    }
    if (confirmarSenha !== novaSenha) {
      addToast('warning', 'A confirmação não corresponde à nova senha');
      return;
    }

    setSalvando(true);
    try {
      await api.put('/usuarios/perfil/senha', { senhaAtual, novaSenha });

      const usuarioAtualizado = { ...user, senhaTemporaria: false };
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
      setUser(usuarioAtualizado);

      addToast('success', 'Senha alterada com sucesso!');
      navigate(rotaPorTipo(user.tipo));
    } catch (error) {
      addToast('error', error.response?.data?.message || 'Erro ao alterar senha');
      setSenhaAtual('');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="toast-container">
        {toasts.map(toast => (
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

      <div className="login-top-bar">
        <div className="logo-container">
          <img src={logoUnifil} alt="Logo UniFil" className="logo-image" />
          <div className="divider">|</div>
          <div className="university-name">Centro Universitário Filadélfia</div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-header">
          <h1 className="login-title">Alterar senha</h1>
        </div>

        {user.senhaTemporaria === true && (
          <div className="banner-senha-temporaria">
            Você está usando a senha aleatória que o administrador gerou pra você.
            Preencha o formulário abaixo e clique em <strong>"Salvar nova senha"</strong> para
            definir uma senha pessoal antes de continuar. ⬇
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Senha atual</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={mostrarSenhaAtual ? 'text' : 'password'}
                className="form-input"
                placeholder="Sua senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarSenhaAtual(v => !v)}
              >
                {mostrarSenhaAtual ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Nova senha</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={mostrarNovaSenha ? 'text' : 'password'}
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarNovaSenha(v => !v)}
              >
                {mostrarNovaSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar nova senha</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={mostrarConfirmarSenha ? 'text' : 'password'}
                className="form-input"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarConfirmarSenha(v => !v)}
              >
                {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-btn ${user.senhaTemporaria === true ? "login-btn-destaque" : ""}`}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        {user.senhaTemporaria === false && (
          <button type="button" className="as-btn-voltar" onClick={() => navigate(-1)}>
            Voltar
          </button>
        )}
      </div>
    </div>
  );
}
