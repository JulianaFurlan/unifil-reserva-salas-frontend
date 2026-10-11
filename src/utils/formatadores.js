export const formatarData = (dataISO) => {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
};

export const formatarHorario = (hora) => {
  if (!hora) return "";
  return hora.slice(0, 5);
};

export const nomeDepartamento = (codigo) => {
  const mapa = {
    CC: 'Ciência da Computação',
    ADS: 'Análise e Desenvolvimento de Sistemas',
    SI: 'Sistemas de Informação',
    ADM: 'Administração',
    DIREITO: 'Direito',
    PSICOLOGIA: 'Psicologia',
    PEDAGOGIA: 'Pedagogia',
    CONTABIL: 'Ciências Contábeis',
    ENFERMAGEM: 'Enfermagem',
    FISIOTERAPIA: 'Fisioterapia',
    NUTRICAO: 'Nutrição',
    ED_FISICA: 'Educação Física',
    ARQUITETURA: 'Arquitetura e Urbanismo',
    ENGENHARIA: 'Engenharia Civil',
  };
  return mapa[codigo] || codigo;
};
