import React from "react";
import "./PawAnimation.css";

const PawAnimation = ({
  width = 60,
  height = 60,
  text = "Aguarde um instante",
  style = {},
  vertical = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 60"
      style={{ marginBottom: 8 }}
    >
      <g>
        {/* Sombra da pata */}
        <ellipse cx="30" cy="54" rx="18" ry="5" fill="#f3d6e0" opacity="0.7" />
        
        {/* Grupo da pata com a classe de animação */}
        <g
          id="paw"
          className={vertical ? "pawwalk-vertical" : "pawwalk-horizontal"}
        >
          {/* Parte principal da pata (almofada central) */}
          <ellipse cx="30" cy="35" rx="12" ry="10" fill="#D14D72" />
          
          {/* Dedos/almofadas da pata - reposicionados para evitar sobreposição excessiva */}
          {/* Almofada esquerda */}
          <g className="paw-pad">
            <ellipse cx="16" cy="25" rx="4" ry="5" fill="#D14D72" />
          </g>
          {/* Almofada direita */}
          <g className="paw-pad" style={{ animationDelay: "0.1s" }}>
            <ellipse cx="44" cy="25" rx="4" ry="5" fill="#D14D72" />
          </g>
          {/* Almofada superior esquerda */}
          <g className="paw-pad" style={{ animationDelay: "0.05s" }}>
            <ellipse cx="24" cy="16" rx="3.5" ry="4" fill="#D14D72" />
          </g>
          {/* Almofada superior direita */}
          <g className="paw-pad" style={{ animationDelay: "0.15s" }}>
            <ellipse cx="36" cy="16" rx="3.5" ry="4" fill="#D14D72" />
          </g>
        </g>
      </g>
    </svg>
    <span style={{ 
      marginTop: 10, 
      color: "#666", 
      fontWeight: "500",
      fontSize: "0.95rem"
    }}>{text}</span>
  </div>
);

export default PawAnimation;