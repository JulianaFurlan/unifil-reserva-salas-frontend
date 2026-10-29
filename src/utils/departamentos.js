export const DEPARTAMENTOS = [
  { value: "CC", label: "Ciência da Computação" },
  { value: "ADS", label: "Análise e Desenvolvimento de Sistemas" },
  { value: "SI", label: "Sistemas de Informação" },
  { value: "ADM", label: "Administração" },
  { value: "DIREITO", label: "Direito" },
  { value: "PSICOLOGIA", label: "Psicologia" },
  { value: "PEDAGOGIA", label: "Pedagogia" },
  { value: "CONTABIL", label: "Ciências Contábeis" },
  { value: "ENFERMAGEM", label: "Enfermagem" },
  { value: "FISIOTERAPIA", label: "Fisioterapia" },
  { value: "NUTRICAO", label: "Nutrição" },
  { value: "ED_FISICA", label: "Educação Física" },
  { value: "ARQUITETURA", label: "Arquitetura e Urbanismo" },
  { value: "ENGENHARIA", label: "Engenharia Civil" },
];

export const nomeDepartamento = (codigo) => {
  const encontrado = DEPARTAMENTOS.find(d => d.value === codigo);
  return encontrado ? encontrado.label : codigo;
};
