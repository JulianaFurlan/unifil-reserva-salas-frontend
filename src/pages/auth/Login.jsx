// src/pages/auth/Login.jsx
<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState } from 'react';
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoUnifil from '../../assets/logo-Unifil.png';
<<<<<<< HEAD
import './login.css';

export default function Login() {
const [email, setEmail] = useState('');
const [senha, setSenha] = useState('');
const [mostrarSenha, setMostrarSenha] = useState(false);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const { user, login } = useAuth();
const navigate = useNavigate();

// Se já estiver logado, redireciona
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

console.log('🔐 Tentando login com:', email);
const result = await login(email, senha);
console.log('📦 Resultado do login:', result);

if (!result.success) {
    setError(result.message);
    console.log('❌ Erro no login:', result.message);
} else {
    console.log('✅ Login bem sucedido! Token salvo?', !!localStorage.getItem('token'));
}

setLoading(false);
};

return (
<div className="login-container">
    <div className="login-top-bar">
    <div className="logo-container">
        <img src={logoUnifil} alt="Logo UniFil" className="logo-image" />
        <div className="divider">|</div>
        <div className="university-name">Centro Universitário Filadélfia</div>
    </div>
    </div>

    <div className="login-content">
    <div className="login-header">
        <h1 className="login-title">Faça login</h1>
    </div>

    <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
        <label>E-mail institucional</label>
        <div className="input-wrapper">
            <Mail size={20} className="input-icon" />
            <input
            type="email"
            className="form-input"
            placeholder="seuemail@unifil.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </div>
        </div>

        <div className="form-group">
        <label>Senha</label>
        <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
            type={mostrarSenha ? 'text' : 'password'}
            className="form-input"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            />
            <button
            type="button"
            className="password-toggle"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            >
            {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="login-btn" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
        Esqueci minha senha
        </a>
    </form>
    </div>
</div>
);
=======

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, senha);

    if (result.success) {
      navigate('/solicitar-reserva');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-top-bar">
        <div className="logo-container">
          <img 
            src={logoUnifil} 
            alt="Logo UniFil" 
            className="logo-image"
          />
          <div className="divider">|</div>
          <div className="university-name">
            Centro Universitário Filadélfia
          </div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-header">
          <h1 className="login-title">Faça login</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail institucional</label>
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="seuemail@unifil.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="form-input"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
            Esqueci minha senha
          </a>
        </form>
      </div>
    </div>
  );
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
}