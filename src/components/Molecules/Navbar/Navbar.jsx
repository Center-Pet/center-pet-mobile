import React, { useState, useEffect, useRef } from "react";
import ButtonType from '../../Atoms/ButtonType/ButtonType';
import './Navbar.css';
import { useNavigate, Link } from 'react-router-dom';
import CustomAvatar from '../../Atoms/CustomAvatar/CustomAvatar';
import useAuth from '../../../hooks/useAuth';
import { Heart, House, PawPrint, Note, User, ChartLine, Gear } from "phosphor-react";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const menuRef = useRef(null); // Adicione esta linha
    const navigate = useNavigate();
    const { isAuthenticated, userType, user, isLoading } = useAuth();

    // Detectar quando a tela está em modo mobile
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth <= 780);
        };
        
        // Verificar tamanho inicial
        checkScreenSize();
        
        // Adicionar listener para redimensionamento
        window.addEventListener('resize', checkScreenSize);
        
        // Limpar listener
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Fecha o menu ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
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

    // Verificar se o usuário precisa preencher o formulário
    const needsToFillForm = isAuthenticated && userType === "Adopter" && !user?.safeAdopter;
    
    // Verificar se é uma ONG
    const isOng = isAuthenticated && userType === "Ong";

    // Determinar se deve mostrar o ícone de configurações
    // Mostra apenas se não estiver autenticado E não estiver em mobile OU se estiver em mobile mas o menu não estiver aberto
    const shouldShowSettingsIcon = !isAuthenticated && (!isMobileView || (isMobileView && !isMenuOpen));

    return (
        <header>
            <div
                className="pink_square"
                onClick={() => navigate(isOng ? '/home-ong' : '/home')}
                style={{ cursor: "pointer" }} // opcional: mostra que é clicável
            ></div>
            <nav id='navbar'>
                <Link to={isOng ? "/home-ong" : "/home"} className="logo-link">
                    <img
                        id="logo"
                        src="/assets/logo/CenterPet.png"
                        alt="Center Pet Logo"
                    />
                </Link>
                <button className="hamburger-menu" onClick={toggleMenu}>
                    ☰
                </button>

                {/* Menu para desktop */}
                <ul className="menu-desktop">
                    <li>
                        <ButtonType bgColor={"#D14D72"} onClick={() => navigate(isOng ? '/home-ong' : '/home')}><House size={25} />Home</ButtonType>
                    </li>
                    {isOng ? (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => navigate(`/catalog-filter?ongId=${user?._id}`)}><PawPrint size={25} />Gerenciar Pets</ButtonType>
                        </li>
                    ) : (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => navigate('/catalog')}><PawPrint size={25} />Catálogo</ButtonType>
                        </li>
                    )}

                    {/* Botão de ONG apenas para usuários do tipo ONG */}
                    {isOng && (
                        <>
                            <li>
                                <ButtonType bgColor={"#D14D72"} onClick={() => navigate('/dashboard')}><ChartLine size={25} />Estatísticas</ButtonType>
                            </li>
                        </>
                    )}

                    {/* Botão formulário apenas para adotantes que NÃO preencheram o formulário */}
                    {needsToFillForm && (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => navigate('/form-safe-adopter')}><Note size={25} /> Formulário</ButtonType>
                        </li>
                    )}

                    {/* Se não estiver logado, mostrar botão de login */}
                    {!isAuthenticated && (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => navigate('/login')}><User size={25} />Login</ButtonType>
                        </li>
                    )}
                </ul>

                {/* Menu para mobile */}
                <ul
                    className={`menu ${isMenuOpen ? "open" : ""}`}
                    ref={menuRef} // Adicione o ref aqui
                >
                    <button className="close-menu" onClick={closeMenu}>✕</button>
                    <li>
                        <ButtonType bgColor={"#D14D72"} onClick={() => { navigate(isOng ? '/home-ong' : '/home'); closeMenu(); }}><House size={25} />Home</ButtonType>
                    </li>
                    {isOng ? (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => { navigate(`/catalog-filter?ongId=${user?._id}`); closeMenu(); }}><PawPrint size={25} />Gerenciar Pets</ButtonType>
                        </li>
                    ) : (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => { navigate('/catalog'); closeMenu(); }}><PawPrint size={25} /> Catálogo</ButtonType>
                        </li>
                    )}

                    {isOng && (
                        <>
                            <li>
                                <ButtonType bgColor={"#D14D72"} onClick={() => { navigate('/dashboard'); closeMenu(); }}><ChartLine size={25} />Estatísticas</ButtonType>
                            </li>
                        </>
                    )}

                    {/* Botão formulário apenas para adotantes que NÃO preencheram o formulário */}
                    {needsToFillForm && (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => { navigate('/form-safe-adopter'); closeMenu(); }}><Note size={25} />Formulário</ButtonType>
                        </li>
                    )}

                    {/* Botão de configurações no menu mobile para todos os usuários */}
                    <li>
                        <ButtonType bgColor={"#D14D72"} onClick={() => { navigate('/configuracoes'); closeMenu(); }}><Gear size={25} /> Configurações</ButtonType>
                    </li>

                    {!isAuthenticated && (
                        <li>
                            <ButtonType bgColor={"#D14D72"} onClick={() => { navigate('/login'); closeMenu(); }}><User size={25} /> Login</ButtonType>
                        </li>
                    )}
                </ul>

                {/* Avatar do usuário ou ícone de configurações */}
                {!isLoading && isAuthenticated ? (
                    <div className="avatar-icon">
                        <CustomAvatar />
                    </div>
                ) : (
                    shouldShowSettingsIcon && (
                        <div className="settings-icon" onClick={() => navigate('/configuracoes')}>
                            <Gear size={28} weight="fill" />
                        </div>
                    )
                )}
            </nav>
        </header>
    );
};

export default Navbar;