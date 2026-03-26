import React from 'react';
import './ButtonType.css';

const ButtonType = ({ children, onClick, bgColor = '#D14D72', color = '#FEF2F4', width, margin, icon, href, target, style }) => {
  const commonStyle = { backgroundColor: bgColor, color: color, width: width, margin: margin, ...style };

  if (href) {
    return (
      <a
        className="Button-type"
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={commonStyle}
      >
        {icon && (
          typeof icon === "string"
            ? <img src={icon} alt="icon" className="button-icon" />
            : <span className="button-icon">{icon}</span>
        )}
        {children}
      </a>
    );
  }

  return (
    <button
      className="Button-type"
      onClick={onClick}
      style={commonStyle}
    >
      {icon && (
        typeof icon === "string"
          ? <img src={icon} alt="icon" className="button-icon" />
          : <span className="button-icon">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default ButtonType;