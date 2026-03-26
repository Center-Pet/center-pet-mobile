"use client";

import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CardPet from "../../Molecules/CardPet/CardPet";
import { CaretLeft, CaretRight } from "phosphor-react";
import "./PetShowcase.css";
import Title from "../../Atoms/TitleType/TitleType";
import slugify from '../../../utils/slugify';

// Função para obter a mensagem apropriada de acordo com a categoria
const getNoItemsMessage = (category) => {
  switch (category) {
    case "special":
      return "Não há pets com condições especiais disponíveis no momento.";
    case "more-patient":
      return "Não há pets mais pacientes disponíveis no momento.";
    case "new":
      return "Não há novos pets disponíveis no momento.";
    default:
      return "Nenhum pet encontrado nesta categoria.";
  }
};

const PetShowcase = ({ 
  title, 
  pets, 
  category,
  ongId, 
  ongName,
  limit = 0,
  customComponent,
  showAllPets = false
}) => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filtrar pets por status se não estiver na tela de ONGs
  const filteredPets = category === "ongs"
    ? pets
    : (showAllPets ? pets : pets.filter(pet => pet.status === "Disponível"));

  // Limitar a quantidade de items exibidos se houver limite definido
  const displayItems = limit > 0 ? filteredPets.slice(0, limit) : filteredPets;

  const scrollRight = () => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollLeft = () => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scrollRight();
    } else if (isRightSwipe) {
      scrollLeft();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const handleCardClick = (itemId) => {
    // Se for uma ONG
    if (category === "ongs") {
      navigate(`/ong-profile/${itemId}`);
    } else {
      // Se for um pet
      navigate(`/pet-info/${itemId}`);
    }
  };

  const handleSeeMore = () => {
    // Se for ONGs, navegar para o catálogo de ONGs
    if (category === "ongs") {
      navigate(
        `/catalog-filter?category=ongs&title=${encodeURIComponent(
          `Todas as ONGs Parceiras`
        )}`
      );
      return;
    }
    
    // Se estiver na página de uma ONG, redireciona para ver todos os pets dessa ONG
    if (ongId) {
      // Detectar se todos os pets são adotados
      const allPetsAdopted = pets.length > 0 && pets.every(pet => pet.status === "Adotado");
      
      // Detectar se é o showcase de pets não adotados (baseado no título)
      const isNonAdoptedPets = title === "Pets disponíveis e outros";
      
      // Se o título for 'Últimos pets cadastrados', use um título mais amigável
      const isUltimosPets = title === "Últimos pets cadastrados";
      
      // Construir o título adequado para a URL
      let urlTitle;
      if (isUltimosPets) {
        urlTitle = "Pets cadastrados";
      } else if (title === "Pets adotados") {
        urlTitle = ongName ? `Pets adotados de ${ongName}` : "Pets adotados";
      } else if (title === "Pets disponíveis e outros" || title === "Pets disponíveis") {
        urlTitle = ongName ? `Pets disponíveis de ${ongName}` : "Pets disponíveis";
      } else if (title.includes("Pets")) {
        urlTitle = ongName ? `${title} de ${ongName}` : title;
      } else {
        urlTitle = ongName ? `Pets de ${title} de ${ongName}` : `Pets de ${title}`;
      }
      
      // Construir a URL com parâmetros
      let url = `/catalog-filter?ongId=${ongId}&title=${encodeURIComponent(urlTitle)}`;
      
      // Se todos os pets são adotados, adicionar filtro de status
      if (allPetsAdopted) {
        url += `&statusFilter=Adotado`;
      }
      // Se é o showcase de pets não adotados, adicionar filtro para excluir adotados
      else if (isNonAdoptedPets) {
        url += `&statusFilter=not-adopted`;
      }
      
      navigate(url);
    }
    // Se estiver no catálogo e tiver uma categoria definida
    else if (location.pathname === "/catalog" && category) {
      let categoryTitle = title;

      // Para garantir que o título enviado na URL seja explicativo
      switch (category) {
        case "special":
          categoryTitle = "Todos os Pets Especiais";
          break;
        case "more-patient":
          categoryTitle = "Todos os Pets Mais Pacientes";
          break;
        case "new":
          categoryTitle = "Todos os Pets Recém Adicionados";
          break;
        default:
          categoryTitle = `Todos os ${title}`;
      }

      // Navegação para a página de filtro com os parâmetros adequados
      navigate(
        `/catalog-filter?category=${category}&title=${encodeURIComponent(
          categoryTitle
        )}`
      );
    }
    // Caso padrão, volta para o catálogo principal
    else {
      navigate("/catalog");
    }
  };

  return (
    <div className="pet-showcase-container">
      <div className="pet-showcase-header">
        <Title>{title}</Title>
        <div className="pet-showcase-buttons">
          <button
            className="pet-showcase-button"
            onClick={scrollLeft}
            aria-label="Ver itens anteriores"
          >
            <CaretLeft size={16} />
          </button>
          <button
            className="pet-showcase-button"
            onClick={scrollRight}
            aria-label="Ver mais itens"
          >
            <CaretRight size={16} />
          </button>
          <button
            className="pet-see-more-button"
            onClick={handleSeeMore}
            style={{
              display:
                limit > 0 && filteredPets.length > limit
                  ? "inline-block"
                  : limit > 0
                  ? "none"
                  : "inline-block",
            }}
          >
            {location.pathname === "/catalog" ? "Ver Categoria" : "Ver Todos"}
          </button>
        </div>
      </div>

      {filteredPets && filteredPets.length > 0 ? (
        <div 
          className="pet-showcase-carousel" 
          ref={carouselRef} 
          role="region"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {displayItems.map((item, index) => (
            <div key={index} className="pet-showcase-item">
              {customComponent && category === "ongs" ? (
                customComponent({
                  ...item,
                  slug: slugify(item.name),
                  onClick: () => navigate(`/ong-profile/${slugify(item.name)}`)
                })
              ) : customComponent ? (
                customComponent(item)
              ) : (
                <CardPet
                  image={item.image}
                  name={item.name}
                  gender={item.gender}
                  age={item.age}
                  type={item.type}
                  hasSpecialCondition={item.hasSpecialCondition}
                  specialCondition={item.specialCondition}
                  vaccinated={item.vaccinated}
                  castrated={item.castrated}
                  dewormed={item.dewormed}
                  onClick={() => handleCardClick(item.id)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-pets-container">
          <p className="no-pets-message">{getNoItemsMessage(category)}</p>
        </div>
      )}
    </div>
  );
};



export default PetShowcase;
