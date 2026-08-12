// src/utils/horarios.js

// Dois horários se sobrepõem quando NÃO é verdade que um termina antes do outro começar
export const horariosSobrepoem = (ini1, fim1, ini2, fim2) => !(fim1 <= ini2 || ini1 >= fim2);

// Combina data (YYYY-MM-DD) e hora ("HH:MM" ou "HH:MM:SS") num objeto Date
export const toDateTime = (dataISO, horaStr) => {
  if (!dataISO || !horaStr) return null;
  return new Date(`${dataISO}T${horaStr.slice(0, 5)}:00`);
};

// Data de hoje no formato YYYY-MM-DD 
export const hojeISO = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
};
