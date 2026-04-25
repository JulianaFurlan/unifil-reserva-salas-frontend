import logoUnifil from "../../assets/logo-Unifil.png";

export default function Header() {
return (
<>
    {/* LINHA LARANJA NO TOPO */}
    <div className="top-thin-bar" />

    {/* FAIXA CINZA CLARO COM LOGO E NOME */}
    <header className="top-gray-bar">
    <div className="logo-container">
        <img 
        src={logoUnifil} 
        alt="Logo UniFil" 
        className="logo-image"
        />
        <div className="divider">|</div>
        <div className="university-name">
        Centro Universitário Filadélfia
        </div>
    </div>
    </header>
</>
);
}