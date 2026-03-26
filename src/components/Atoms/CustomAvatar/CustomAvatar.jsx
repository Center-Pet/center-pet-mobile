import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomAvatar.css";
import useAuth from "../../../hooks/useAuth";
import Swal from 'sweetalert2';
import PawAnimation from "../../Molecules/PawAnimation/PawAnimation";
import ReactDOMServer from "react-dom/server";
import { Gear } from "phosphor-react";
import { API_URL } from "../../../config/api";
import slugify from '../../../utils/slugify';

const defaultAvatar = "https://i.imgur.com/B2BFUeU.png";

export default function CustomAvatar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user, userType } = useAuth();
  const avatarRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const pawAnimationHtml = ReactDOMServer.renderToString(
        <PawAnimation text="Saindo..." vertical={true} width={160} height={160} />
      );

      Swal.fire({
        title: 'Saindo',
        html: pawAnimationHtml,
        showConfirmButton: false,
        allowOutsideClick: false
      });

      const response = await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      Swal.close();
      logout();
      navigate('/home');

      Swal.fire({
        icon: response.ok ? 'success' : 'warning',
        title: response.ok
          ? 'Logout realizado com sucesso!'
          : 'Sessão encerrada com problema de conexão',
        showConfirmButton: false,
        timer: 1500
      });

      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      logout();
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível comunicar com o servidor. Sessão encerrada localmente.',
        confirmButtonColor: '#D14D72'
      });
      navigate('/login');
    }

    handleCloseMenu();
  };

  const handleProfile = () => {
    if (user) {
      if (userType === "Adopter" && user._id) {
        navigate(`/adopter-profile/${user._id}`);
      } else if (userType === "Ong" && user._id && user.name) {
        navigate(`/ong-profile/${slugify(user.name)}`);
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    handleCloseMenu();
  };

  return (
    user && (
      <div className="custom-avatar-container" ref={avatarRef}>
        <img
          className="custom-avatar-icon"
          src={user.profileImg || defaultAvatar}
          alt="Avatar"
          onClick={handleToggleMenu}
        />
        {isMenuOpen && (
          <div className="custom-avatar-menu">
            <button className="custom-avatar-menu-item" onClick={handleProfile}>
              Meu Perfil
            </button>
            {userType === "Ong" && (
              <button className="custom-avatar-menu-item" onClick={() => {
                navigate("/register-pet");
                handleCloseMenu();
              }}>
                Cadastrar Pet
              </button>
            )}
            {/* Botão de configurações para todos os usuários */}
            <button className="custom-avatar-menu-item" onClick={() => {
              navigate("/configuracoes");
              handleCloseMenu();
            }}>
              Configurações
            </button>
            <button className="custom-avatar-menu-item" onClick={handleLogout}>
              Sair
            </button>
          </div>
        )}
      </div>
    )
  );
}
