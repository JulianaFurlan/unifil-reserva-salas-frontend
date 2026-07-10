import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Toast from "../../components/common/Toast";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import "../styles/reserva.css";

export default function ConsultarDisponibilidade() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Consulta de Disponibilidade</h2>
      <p>Em breve você poderá consultar salas disponíveis.</p>
    </div>
  );
}