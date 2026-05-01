// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Reserva from "./pages/Reserva";
import MeusPedidos from "./pages/MeusPedidos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Reserva />} />
          <Route path="solicitar-reserva" element={<Reserva />} />
          <Route path="meus-pedidos" element={<MeusPedidos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;