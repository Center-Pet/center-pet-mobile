import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; 
import './Background.css'; 
import pawIcon from '/assets/icons/pawIcon.png'; 

const AnimatedBackground = () => {
    const location = useLocation();
    const [paws, setPaws] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      // Verificar se é mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      // Verificar inicialmente
      checkMobile();

      // Adicionar listener para mudanças de tamanho
      window.addEventListener('resize', checkMobile);

      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }, []);

    useEffect(() => {
      const generatePaws = () => {
        const newPaws = [];
        // Reduzir número de patas no mobile
        const numPaws = isMobile ? 12 : 30;
        const maxAttempts = 50;
        const minDistance = isMobile ? 15 : 7; // Maior distância no mobile
  
        for (let index = 0; index < numPaws; index++) {
          let attempts = 0;
          let newPaw;
          let isTooClose = false;
  
          do {
            newPaw = {
              id: index,
              top: Math.random() * 100,
              left: Math.random() * 100,
              rotate: Math.random() * 360,
            };
  
            // Verifica se a nova posição está muito próxima de alguma já existente
            isTooClose = newPaws.some(paw => {
              const dx = newPaw.left - paw.left;
              const dy = newPaw.top - paw.top;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < minDistance;
            });
  
            attempts++;
          } while (isTooClose && attempts < maxAttempts);
  
          newPaws.push(newPaw);
        }
  
        setPaws(newPaws);
      };
  
      generatePaws();
    }, [location.pathname, isMobile]); // Regenera as posições a cada troca de rota ou mudança de tamanho
  
    return (
      <div className="animated-background">
        {paws.map(paw => (
          <img
            key={paw.id}
            src={pawIcon}
            className={`paw-icon ${isMobile ? 'paw-icon-mobile' : ''}`}
            style={{
              top: `${paw.top}%`,
              left: `${paw.left}%`,
              transform: `rotate(${paw.rotate}deg)`,
            }}
            alt="pata"
          />
        ))}
      </div>
    );
  };
  
  export default AnimatedBackground;