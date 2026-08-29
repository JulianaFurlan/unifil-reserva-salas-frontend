import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToasts } from '../../hooks/useToasts';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import logoUnifil from '../../assets/logo-Unifil.png';
import './entrar.css';
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

  const senhaTemporaria = user.senhaTemporaria === true;

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
    <div className="entrar-pagina">
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

      <div className="entrar-linha-topo" />

      <div className="entrar-topo">
        <div className="entrar-topo-conteudo">
          <img src={logoUnifil} alt="Logo UniFil" className="entrar-logo" />
          <span className="entrar-divisor">|</span>
          <span className="entrar-instituicao">Centro Universitário Filadélfia</span>
        </div>
      </div>

      <div className="entrar-main">
        <div className="entrar-card">
          <div className="entrar-card-faixa" />
          <div className="entrar-card-conteudo">
            <div className="entrar-icone-badge">
              <Lock size={26} />
            </div>

            <h1 className="entrar-titulo">Alterar senha</h1>
            <p className="entrar-subtitulo">
              {senhaTemporaria ? 'Defina sua senha pessoal para continuar' : 'Preencha os campos abaixo'}
            </p>

            {senhaTemporaria && (
              <div className="entrar-aviso-temp">
                Preencha o formulário e clique em <strong>"Salvar nova senha"</strong> para
                definir uma senha pessoal antes de continuar.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="entrar-campo">
                <label>Senha atual</label>
                <div className="entrar-input-wrapper">
                  <Lock size={18} className="entrar-input-icon" />
                  <input
                    type={mostrarSenhaAtual ? 'text' : 'password'}
                    className="entrar-input"
                    placeholder="Sua senha atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="entrar-senha-toggle"
                    onClick={() => setMostrarSenhaAtual(v => !v)}
                  >
                    {mostrarSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="entrar-campo">
                <label>Nova senha</label>
                <div className="entrar-input-wrapper">
                  <Lock size={18} className="entrar-input-icon" />
                  <input
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    className="entrar-input"
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="entrar-senha-toggle"
                    onClick={() => setMostrarNovaSenha(v => !v)}
                  >
                    {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="entrar-campo">
                <label>Confirmar nova senha</label>
                <div className="entrar-input-wrapper">
                  <Lock size={18} className="entrar-input-icon" />
                  <input
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    className="entrar-input"
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="entrar-senha-toggle"
                    onClick={() => setMostrarConfirmarSenha(v => !v)}
                  >
                    {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`entrar-btn ${senhaTemporaria ? "entrar-btn-destaque" : ""}`}
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar nova senha'}
              </button>

              <button type="button" className="entrar-btn-voltar" onClick={() => navigate(-1)}>
                Voltar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
