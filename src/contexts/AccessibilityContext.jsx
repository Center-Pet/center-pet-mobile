import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  // Alterando os valores padrão para false (desativados)
  const [settings, setSettings] = useState({
    colorBlindFilter: false, // desativado por padrão
    vLibras: false, // desativado por padrão
  });

  // Carregar configurações do localStorage ao iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Salvar configurações no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Gerencia o VLibras com base nas configurações
    if (settings.vLibras) {
      // Ativa o VLibras
      if (window.VLibras) {
        const vw = document.querySelector('.enabled');
        if (vw) vw.style.display = 'block';
      }
    } else {
      // Desativa o VLibras
      const vw = document.querySelector('.enabled');
      if (vw) vw.style.display = 'none';
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};