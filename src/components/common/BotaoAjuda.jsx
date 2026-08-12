// src/components/common/BotaoAjuda.jsx
import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

export default function BotaoAjuda({ videoUrl, titulo, descricao }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    const aoPressionarTecla = (e) => {
      if (e.key === "Escape") setAberto(false);
    };

    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        className="btn-ajuda"
        onClick={() => setAberto(true)}
        title={titulo || "Ajuda"}
        aria-label={titulo ? `Tutorial: ${titulo}` : "Tutorial em vídeo"}
      >
        <HelpCircle size={20} />
      </button>

      {aberto && (
        <div className="ajuda-modal-overlay" onClick={() => setAberto(false)}>
          <div className="ajuda-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ajuda-modal-header">
              <h3 className="ajuda-modal-titulo">{titulo}</h3>
              <button
                type="button"
                className="ajuda-modal-fechar"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {descricao && <p className="ajuda-modal-descricao">{descricao}</p>}

            <div className="ajuda-video-container">
              <iframe
                className="ajuda-video-iframe"
                src={videoUrl}
                title={titulo || "Tutorial em vídeo"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
