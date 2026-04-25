// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import SolicitarReserva from "./pages/comum/SolicitarReserva";

// Componente temporário para páginas em desenvolvimento
function EmDesenvolvimento() {
  return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <h2>🚧 Página em Desenvolvimento</h2>
      <p>Esta funcionalidade estará disponível em breve!</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SolicitarReserva />} />
          <Route path="solicitar-reserva" element={<SolicitarReserva />} />
          <Route path="conferir-disponibilidade" element={<EmDesenvolvimento />} />
          <Route path="meus-pedidos" element={<EmDesenvolvimento />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;