import React from "react";
import { useNavigate } from "react-router-dom"; // Adicione esta linha
import ScrollToTop from "../../Atoms/ScrollToTop/ScrollToTop";
import "./Footer.css";
import { EnvelopeSimple, FacebookLogo, InstagramLogo } from "phosphor-react";

function Footer() {
  const navigate = useNavigate(); // Adicione esta linha

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="mobile-social-links">
          <div className="social-links">

            <div className="footer-logo">
              <img
                src="/assets/logo/CPCenterPet.png"
                alt="Center Pet Logo"
                style={{ cursor: "pointer" }}
                onClick={() => navigate('/home')}
              />
            </div>
            <div className="social-media">
              <span>Siga-nos:</span>
              <a href="https://www.instagram.com/centerpet_oficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramLogo size={30} color="rgb(254, 242, 244)"/>
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookLogo size={30} color="rgb(254, 242, 244)"/>
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <EnvelopeSimple size={30} color="rgb(254, 242, 244)"/>
              </a>
            </div>

          </div>
        </div>
        <div className="social-links">
          <span>Siga-nos:</span>
          <div className="social-media">
            <a href="https://www.instagram.com/centerpet_oficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramLogo size={30} color="rgb(254, 242, 244)"/>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookLogo size={30} color="rgb(254, 242, 244)"/>
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <EnvelopeSimple size={30} color="rgb(254, 242, 244)"/>
            </a>
          </div>
        </div>
        <div className="footer-logo">
          <img
            src="/assets/logo/CPCenterPet.png"
            alt="Center Pet Logo"
            style={{ cursor: "pointer" }}
            onClick={() => navigate('/home')}
          />
        </div>
        <nav className="footer-nav">
          <a href="/">Início</a>
          <a href="/home">Sobre</a>
          <a href="/catalog">Catálogo</a>
        </nav>
      </div>

      <ScrollToTop />

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Center Pet. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
