import { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import "./CustomSelect.css";


export default function CustomSelect({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Selecione...",
  disabled = false,
  className = "",
}) {
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);

  const selecionado = options.find(o => String(o.value) === String(value));

  const dispararChange = (novoValor) => {
    onChange?.({ target: { name, value: novoValor } });
  };

  const abrir = () => {
    if (disabled) return;
    const indiceAtual = options.findIndex(o => String(o.value) === String(value));
    setIndiceAtivo(indiceAtual >= 0 ? indiceAtual : 0);
    setAberto(true);
  };

  const escolher = (opcao) => {
    if (opcao.disabled) return;
    dispararChange(opcao.value);
    setAberto(false);
  };

  const proximoIndiceHabilitado = (atual, direcao) => {
    let proximo = atual;
    for (let i = 0; i < options.length; i++) {
      proximo += direcao;
      if (proximo < 0 || proximo >= options.length) break;
      if (!options[proximo]?.disabled) return proximo;
    }
    return atual;
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!aberto) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        abrir();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setAberto(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo(prev => proximoIndiceHabilitado(prev, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo(prev => proximoIndiceHabilitado(prev, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opcao = options[indiceAtivo];
      if (opcao) escolher(opcao);
    }
  };

  return (
    <div className={`custom-select ${aberto ? "custom-select-aberto" : ""} ${disabled ? "custom-select-disabled" : ""} ${className}`}>
      <button
        type="button"
        className="custom-select-gatilho"
        disabled={disabled}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setAberto(false);
          onBlur?.({ target: { name, value } });
        }}
      >
        <span className={`custom-select-valor ${!selecionado ? "custom-select-placeholder" : ""}`}>
          {selecionado ? selecionado.label : placeholder}
        </span>
        <AiOutlineDown className="custom-select-seta" size={13} />
      </button>

      {aberto && (
        <ul className="custom-select-lista" role="listbox">
          {options.length === 0 ? (
            <li className="custom-select-vazio">Nenhuma opção disponível</li>
          ) : (
            options.map((opcao, i) => (
              <li
                key={opcao.value}
                role="option"
                aria-selected={String(opcao.value) === String(value)}
                className={[
                  "custom-select-opcao",
                  opcao.disabled ? "custom-select-opcao-disabled" : "",
                  String(opcao.value) === String(value) ? "custom-select-opcao-selecionada" : "",
                  i === indiceAtivo ? "custom-select-opcao-ativa" : "",
                ].join(" ").trim()}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setIndiceAtivo(i)}
                onClick={() => escolher(opcao)}
              >
                {opcao.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
