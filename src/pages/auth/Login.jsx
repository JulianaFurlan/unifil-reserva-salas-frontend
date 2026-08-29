import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoUnifil from '../../assets/logo-Unifil.png';
import './entrar.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // unico lugar que decide a rota pos login, pra nao ter duas navegacoes brigando
  useEffect(() => {
    if (user) {
      if (user.tipo === 'ADMIN') {
        navigate('/admin/salas');
      } else if (user.tipo === 'GESTOR') {
        navigate('/gestor/solicitacoes');
      } else {
        navigate('/solicitar-reserva');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, senha);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="entrar-pagina">
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
              <KeyRound size={26} />
            </div>

            <h1 className="entrar-titulo">Reserva de Salas</h1>
            <p className="entrar-subtitulo">Reserve seu espaço</p>

            <form onSubmit={handleSubmit}>
              <div className="entrar-campo">
                <label>E-mail institucional</label>
                <div className="entrar-input-wrapper">
                  <Mail size={18} className="entrar-input-icon" />
                  <input
                    type="email"
                    className="entrar-input"
                    placeholder="seuemail@unifil.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="entrar-campo">
                <label>Senha</label>
                <div className="entrar-input-wrapper">
                  <Lock size={18} className="entrar-input-icon" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    className="entrar-input"
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="entrar-senha-toggle"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="entrar-erro">{error}</div>}

              <button type="submit" className="entrar-btn" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <p className="entrar-aviso-senha">
                Esqueceu sua senha? Contate um administrador para resetá-la.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
