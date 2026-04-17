import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";     // ← nosso layout reutilizável
import Reserva from "./pages/Reserva";       // ← sua tela atual

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Todas as telas vão passar pelo Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Reserva />} />           {/* tela inicial */}
          <Route path="reserva" element={<Reserva />} />  {/* se quiser acessar /reserva */}
          {/* Quando criar outras telas, é só adicionar aqui ↓ */}
          {/* <Route path="consultar" element={<Consultar />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}