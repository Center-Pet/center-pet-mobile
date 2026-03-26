const SvgColorBlindFilters = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
    <defs>
      {/* Protanomalia - Deficiência leve na percepção do vermelho */}
      <filter id="protanomalia">
        <feColorMatrix
          type="matrix"
          values="0.817, 0.183, 0, 0, 0
                 0.333, 0.667, 0, 0, 0
                 0, 0.125, 0.875, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>

      {/* Protanopia - Ausência da percepção do vermelho */}
      <filter id="protanopia">
        <feColorMatrix
          type="matrix"
          values="0.567, 0.433, 0, 0, 0
                 0.558, 0.442, 0, 0, 0
                 0, 0.242, 0.758, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>

      {/* Deuteranomalia - Deficiência leve na percepção do verde */}
      <filter id="deuteranomalia">
        <feColorMatrix
          type="matrix"
          values="0.8, 0.2, 0, 0, 0
                 0.258, 0.742, 0, 0, 0
                 0, 0.142, 0.858, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>

      {/* Deuteranopia - Ausência da percepção do verde */}
      <filter id="deuteranopia">
        <feColorMatrix
          type="matrix"
          values="0.625, 0.375, 0, 0, 0
                 0.7, 0.3, 0, 0, 0
                 0, 0.3, 0.7, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>

      {/* Tritanomalia - Deficiência leve na percepção do azul */}
      <filter id="tritanomalia">
        <feColorMatrix
          type="matrix"
          values="0.967, 0.033, 0, 0, 0
                 0, 0.733, 0.267, 0, 0
                 0, 0.183, 0.817, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>

      {/* Tritanopia - Ausência da percepção do azul */}
      <filter id="tritanopia">
        <feColorMatrix
          type="matrix"
          values="0.95, 0.05, 0, 0, 0
                 0, 0.433, 0.567, 0, 0
                 0, 0.475, 0.525, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>

      {/* Acromatopsia - Ausência total de percepção de cor (visão em preto e branco) */}
      <filter id="acromatopsia">
        <feColorMatrix
          type="matrix"
          values="0.299, 0.587, 0.114, 0, 0
                 0.299, 0.587, 0.114, 0, 0
                 0.299, 0.587, 0.114, 0, 0
                 0, 0, 0, 1, 0"
        />
      </filter>
    </defs>
  </svg>
);

export default SvgColorBlindFilters;
