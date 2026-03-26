import { useAccessibility } from "../../contexts/AccessibilityContext";
import "./Settings.css";

export default function Settings() {
  const { settings, updateSettings } = useAccessibility();

  const handleColorBlindToggle = () => {
    updateSettings({ colorBlindFilter: !settings.colorBlindFilter });
  };

  const handleVLibrasToggle = () => {
    updateSettings({ vLibras: !settings.vLibras });
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Configurações</h1>
        
        <div className="settings-section">
          <h2>Recursos de Acessibilidade</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Filtro para Daltonismo</h3>
              <p>Ativa filtros visuais que auxiliam pessoas com diferentes tipos de daltonismo.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.colorBlindFilter} 
                onChange={handleColorBlindToggle} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>VLibras</h3>
              <p>Tradutor de Português para Língua Brasileira de Sinais.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.vLibras} 
                onChange={handleVLibrasToggle} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}