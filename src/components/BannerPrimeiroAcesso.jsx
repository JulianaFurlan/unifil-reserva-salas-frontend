import { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useAuth } from "../hooks/useAuth";

const DURACAO_SAIDA_MS = 300;

export default function BannerPrimeiroAcesso() {
  const { user } = useAuth();
  const [visivel, setVisivel] = useState(false);
  const [saindo, setSaindo] = useState(false);

  // so mostra pra quem ainda esta com a senha temporaria, e guarda o "ja visto" por usuario
  const chaveTutorialVisto = `tutorial-visto-${user?.id ?? "anonimo"}`;

  useEffect(() => {
    if (!user?.senhaTemporaria) {
      setVisivel(false);
      return;
    }
    const jaViu = localStorage.getItem(chaveTutorialVisto);
    if (!jaViu) setVisivel(true);
  }, [user?.senhaTemporaria, chaveTutorialVisto]);

  const fechar = () => {
    setSaindo(true);
    setTimeout(() => {
      localStorage.setItem(chaveTutorialVisto, "true");
      setVisivel(false);
    }, DURACAO_SAIDA_MS);
  };

  if (!visivel) return null;

  return (
    <div className={`banner-primeiro-acesso ${saindo ? "banner-primeiro-acesso-saindo" : ""}`}>
      <div className="banner-primeiro-acesso-conteudo">
        <AiOutlineInfoCircle size={22} className="banner-primeiro-acesso-icone" />
        <p className="banner-primeiro-acesso-texto">
          Bem-vindo ao Sistema de Reservas da UniFil! É seu primeiro acesso? Clique no ícone{" "}
          <strong>?</strong> ao lado dos títulos para ver os tutoriais em vídeo de cada funcionalidade.
        </p>
        <button type="button" className="banner-primeiro-acesso-fechar" onClick={fechar}>
          Entendi
        </button>
      </div>
    </div>
  );
}
