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

const MINUTOS_INICIO_DIA = 8 * 60;
const MINUTOS_FIM_DIA = 22 * 60;

const paraMinutos = (horaStr) => {
  const [h, m] = horaStr.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};

// soma o tempo livre entre 08:00 e 22:00, mesclando reservas que se sobrepoem
export const minutosLivresNoDia = (reservas) => {
  const intervalos = reservas
    .map(r => [
      Math.max(paraMinutos(r.horaInicio), MINUTOS_INICIO_DIA),
      Math.min(paraMinutos(r.horaFim), MINUTOS_FIM_DIA),
    ])
    .filter(([ini, fim]) => fim > ini)
    .sort((a, b) => a[0] - b[0]);

  let minutosOcupados = 0;
  let finalAtual = MINUTOS_INICIO_DIA;
  intervalos.forEach(([ini, fim]) => {
    const inicioReal = Math.max(ini, finalAtual);
    if (fim > inicioReal) {
      minutosOcupados += fim - inicioReal;
      finalAtual = fim;
    }
  });

  return (MINUTOS_FIM_DIA - MINUTOS_INICIO_DIA) - minutosOcupados;
};
