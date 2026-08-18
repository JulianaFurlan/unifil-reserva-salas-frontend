// dois horarios se sobrepoem quando nao e verdade que um termina antes do outro comecar
export const horariosSobrepoem = (ini1, fim1, ini2, fim2) => !(fim1 <= ini2 || ini1 >= fim2);

// aceita hora no formato HH:MM ou HH:MM:SS
export const toDateTime = (dataISO, horaStr) => {
  if (!dataISO || !horaStr) return null;
  return new Date(`${dataISO}T${horaStr.slice(0, 5)}:00`);
};

export const hojeISO = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
};

export const reservaEncerradaHoje = (data, horaFim) => {
  if (data !== hojeISO()) return false;
  const fim = toDateTime(data, horaFim);
  if (!fim) return false;
  return new Date() > fim;
};
