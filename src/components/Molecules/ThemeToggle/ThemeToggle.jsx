import { useEffect, useState } from 'react';
import './ThemeToggle.css';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.className = theme; // Aplica a classe do tema ao <html>
    localStorage.setItem('theme', theme); // Salva o tema no localStorage
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button className="theme-toggle-button" onClick={toggleTheme} aria-label="Alternar tema">
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

export default ThemeToggle;
