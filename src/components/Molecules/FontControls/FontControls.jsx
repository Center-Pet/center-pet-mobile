import { useState, useEffect } from 'react';
import './FontControls.css'; // Importando o CSS para estilização

export default function FontControls() {
  const [fontSize, setFontSize] = useState(100);

  // Apply font size to the whole page
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const increaseFont = () => setFontSize(prev => Math.min(prev + 10, 200));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 10, 50));
  const resetFont = () => setFontSize(100);

  return (
    <div id="accessibility-controls" aria-label="Font size controls">
      <button onClick={increaseFont} aria-label="Increase text size">A+</button>
      <button onClick={decreaseFont} aria-label="Decrease text size">A-</button>
      <button onClick={resetFont} aria-label="Reset text size">A</button>
    </div>
  );
}
