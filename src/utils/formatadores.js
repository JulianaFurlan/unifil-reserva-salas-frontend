// src/utils/formatadores.js

export const formatarData = (dataISO) => {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
};

export const formatarHorario = (hora) => {
  if (!hora) return "";
  return hora.slice(0, 5);
};
