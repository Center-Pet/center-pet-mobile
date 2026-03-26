import React from "react";
import "./OngCard.css";

export default function OngCard({ imageUrl, ongName, ongId }) {
  return (
    <div className="register-ong-section">
      <div>
        <h3>Este Pet está sobre a proteção de:</h3>
      </div>
      <div className="register-ong-card">
        <img src={imageUrl} alt={ongName} className="register-ong-image" />
        {ongId && ongName ? (
          <a href={`/ong-profile/${ongId}`} className="register-ong-title">{ongName}</a>
        ) : (
          <span className="register-ong-title">{ongName || 'ONG'}</span>
        )}
      </div>
    </div>
  );
}
