import { useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CardPet from "../../components/Molecules/CardPet/CardPet";
import OngChart from "../../components/Molecules/OngChart/OngChart";
import Filter from "../../components/Atoms/Filter/Filter";
import Title from "../../components/Atoms/TitleType/TitleType";
import "./CatalogFilter.css";
import { API_URL } from "../../config/api";
import slugify from '../../utils/slugify';
import useAuth from "../../hooks/useAuth";

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

function normalize(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/(o|a)$/i, "") // remove final 'o' ou 'a' (Curto/Curta, Médio/Média, Longo/Longa)
    .toLowerCase()
    .trim();
}

const CatalogFilter = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  // Pega parâmetros da URL
  const ongId = searchParams.get("ongId");
  const pageTitle = searchParams.get("title") || (ongId ? "Gerenciar Pets" : "Catálogo");
  const category = searchParams.get("category");
  const statusFilter = searchParams.get("statusFilter"); // Novo parâmetro para filtrar por status
  
  // Verificar se estamos exibindo ONGs ou pets
  const isOngsView = category === "ongs";

  // Estado para os filtros ativos (agora incluindo pelagem)
  const [activeFilters, setActiveFilters] = useState({
    gender: [],
    size: [],
    age: [],
    health: [],
    coat: [], // Adicionando o novo filtro de pelagem
    status: [],
    type: [],
    state: "",
    city: "",
  });

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        let apiUrl;
        
        // Determinar qual endpoint chamar
        if (isOngsView) {
          // Buscar ONGs
          apiUrl = `${API_URL}/ongs`;
        } else {
          // Buscar pets
          apiUrl = ongId 
            ? `${API_URL}/pets/by-ong/${ongId}`
            : `${API_URL}/pets`;
        }

        // Fazer a requisição para a API
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados (${response.status})`);
        }

        // Processar os dados da resposta
        const data = await response.json();
        const dataArray = Array.isArray(data.data) ? data.data : data;

        if (isOngsView) {
          // Processar ONGs
          setItems(dataArray);
          setFilteredItems(dataArray);
        } else {
          // Processar Pets
          const processedPets = dataArray.map((pet) => ({
            ...pet,
            id: pet._id,
            image:
              pet.image?.[0] ||
              pet.photos?.[0] ||
              pet.imagens?.[0] ||
              (Array.isArray(pet.image) && pet.image.length > 0
                ? pet.image[0]
                : null) ||
              "https://i.imgur.com/B2BFUeU.png",
            // Processar atributos de saúde para filtragem
            hasSpecialCondition:
              pet.health?.specialCondition &&
              (Array.isArray(pet.health.specialCondition) ? 
               pet.health.specialCondition.some(condition => condition.toLowerCase() !== "nenhuma") :
               pet.health.specialCondition.trim().toLowerCase() !== "nenhuma"),
            specialCondition: Array.isArray(pet.health?.specialCondition) ? 
                             pet.health.specialCondition.join(", ") : 
                             pet.health?.specialCondition || "Nenhuma",
            vaccinated: pet.health?.vaccinated || false,
            castrated: pet.health?.castrated || false,
            dewormed: pet.health?.dewormed || false,
            coat: pet.coat || "", // <-- ADICIONE ESTA LINHA
          }));

          // Aplicar filtro com base na categoria da URL
          let filteredByCategory = processedPets;

          if (category && category !== "ongs") {
            switch (category) {
              case "special":
                // Filtrar pets com condição especial
                filteredByCategory = processedPets.filter(
                  (pet) => pet.hasSpecialCondition
                );
                break;

              case "more-patient":
                // Filtrar e ordenar pets por tempo de espera
                filteredByCategory = [...processedPets]
                  .filter((pet) => !isNaN(Number(pet.waitingTime)))
                  .sort((a, b) => Number(b.waitingTime) - Number(a.waitingTime));
                break;

              case "new":
                // Filtrar e ordenar pets por data de registro
                filteredByCategory = [...processedPets]
                  .filter((pet) => pet.registerDate)
                  .sort(
                    (a, b) => new Date(b.registerDate) - new Date(a.registerDate)
                  );
                break;

              default:
                // Sem filtro especial
                break;
            }
          }

          // Filtrar por status: se não tem ongId (vem do Catalog), mostrar apenas disponíveis
          // Se tem ongId (vem do ONGProfile), mostrar todos os status
          if (!ongId) {
            filteredByCategory = filteredByCategory.filter(pet => pet.status === "Disponível");
          } else if (statusFilter) {
            // Se tem statusFilter específico, aplicar esse filtro
            if (statusFilter === "not-adopted") {
              // Excluir pets adotados
              filteredByCategory = filteredByCategory.filter(pet => pet.status !== "Adotado");
            } else {
              // Filtrar por status específico
              filteredByCategory = filteredByCategory.filter(pet => pet.status === statusFilter);
            }
          }

          setItems(filteredByCategory);
          setFilteredItems(filteredByCategory);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [ongId, category, isOngsView, statusFilter]);

  // Efeito para aplicar filtros do componente Filter (apenas para pets)
  useEffect(() => {
    if (isOngsView) {
      // Se for ONGs, não aplica filtros
      return;
    }
    
    const hasActiveFilters = 
      Object.values(activeFilters).some(value => 
        Array.isArray(value) ? value.length > 0 : !!value
      );

    // Se não há filtros ativos, mostra todos os pets da categoria
    if (!hasActiveFilters) {
      // Mesmo sem filtros ativos, se não tem ongId (vem do Catalog), filtrar apenas disponíveis
      if (!ongId) {
        setFilteredItems(items.filter(pet => pet.status === "Disponível"));
      } else if (statusFilter) {
        // Se tem statusFilter específico, aplicar esse filtro
        if (statusFilter === "not-adopted") {
          // Excluir pets adotados
          setFilteredItems(items.filter(pet => pet.status !== "Adotado"));
        } else {
          // Filtrar por status específico
          setFilteredItems(items.filter(pet => pet.status === statusFilter));
        }
      } else {
        setFilteredItems(items);
      }
      setCurrentPage(1);
      return;
    }

    // Função para verificar se um pet passa pelos filtros ativos
    const matchesFilters = (pet) => {
      // Verificar filtro de localização (Estado)
      if (activeFilters.state && pet.state !== activeFilters.state) {
        return false;
      }

      // Verificar filtro de localização (Cidade)
      if (activeFilters.city && pet.city !== activeFilters.city) {
        return false;
      }
      
      // Verificar filtro de espécie
      if (
        activeFilters.type.length > 0 &&
        !activeFilters.type.includes(pet.type)
      ) {
        return false;
      }
      
      // Verificar filtro de status
      if (activeFilters.status && activeFilters.status.length > 0) {
        if (!activeFilters.status.includes(pet.status)) {
          return false;
        }
      }
      // Verificar filtro de gênero
      if (
        activeFilters.gender.length > 0 &&
        !activeFilters.gender.includes(pet.gender)
      ) {
        return false;
      }

      // Verificar filtro de porte
      if (activeFilters.size.length > 0) {
        const petSize = pet.size || "";
        const matches = activeFilters.size.some((filter) => {
          if (filter === "Pequeno Porte")
            return petSize.toLowerCase().includes("pequeno");
          if (filter === "Médio Porte")
            return (
              petSize.toLowerCase().includes("médio") ||
              petSize.toLowerCase().includes("medio")
            );
          if (filter === "Grande Porte")
            return petSize.toLowerCase().includes("grande");
          return false;
        });
        if (!matches) return false;
      }

      // Verificar filtro de idade
      if (activeFilters.age.length > 0) {
        const petAge = pet.age || "";
        const matches = activeFilters.age.some((filter) => {
          if (filter === "Filhote")
            return petAge.toLowerCase().includes("filhote");
          if (filter === "Jovem") return petAge.toLowerCase().includes("jovem");
          if (filter === "Adulto")
            return petAge.toLowerCase().includes("adulto");
          if (filter === "Idoso")
            return petAge.toLowerCase().includes("idoso");
          return false;
        });
        if (!matches) return false;
      }

      // Verificar filtro de pelagem
      if (activeFilters.coat.length > 0) {
        const petCoat = normalize(pet.coat);
        const matches = activeFilters.coat.some((filter) => {
          return petCoat === normalize(filter);
        });
        if (!matches) return false;
      }

      // Verificar filtros de saúde
      if (activeFilters.health.length > 0) {
        const matches = activeFilters.health.every((filter) => {
          if (filter === "Vacinado") return pet.vaccinated;
          if (filter === "Não Vacinado") return !pet.vaccinated;
          if (filter === "Vermifugado") return pet.dewormed;
          if (filter === "Não Vermifugado") return !pet.dewormed;
          if (filter === "Castrado") return pet.castrated;
          if (filter === "Não Castrado") return !pet.castrated;
          if (filter === "Condição Especial") return pet.hasSpecialCondition;
          return true;
        });
        if (!matches) return false;
      }

      return true;
    };

    // Aplicar filtros
    setFilteredItems(items.filter(matchesFilters));
    setCurrentPage(1); // Resetar para primeira página ao aplicar filtros
  }, [activeFilters, items, isOngsView, ongId, statusFilter]);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Handlers para navegação de página
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handler para aplicação de filtros
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="conjunt-catalog">
      <div className="catalog-header">
        <div className="catalog-title-container">
          <Title>{pageTitle}</Title>
        </div>
        {!isOngsView && (
          <div className="filter-container">
            <Filter onFilterChange={handleFilterChange} userType={userType} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {isOngsView ? (
            // Render ONGs grid
            <div className="ongs-grid">
              {currentItems.length > 0 ? (
                currentItems.map((ong, index) => (
                  <OngChart 
                    key={index}
                    ongData={ong}
                    onClick={() => navigate(`/ong-profile/${slugify(ong.name)}`)}
                  />
                ))
              ) : (
                <p className="no-items-message">
                  Nenhuma ONG encontrada.
                </p>
              )}
            </div>
          ) : (
            // Render Pets grid
            <div className="page-pet-grid">
              {currentItems.length > 0 ? (
                currentItems.map((pet, index) => (
                  (ongId && user && user._id === ongId && userType === 'Ong') ? (
                    <div className="pet-card-with-status" key={index}>
                      <CardPet
                        image={pet.image}
                        name={pet.name}
                        gender={pet.gender}
                        age={pet.age}
                        type={pet.type}
                        hasSpecialCondition={pet.hasSpecialCondition}
                        specialCondition={pet.specialCondition}
                        vaccinated={pet.vaccinated}
                        castrated={pet.castrated}
                        dewormed={pet.dewormed}
                        onClick={() => navigate(`/pet-info/${pet.id}`)}
                      />
                      <span className={`pet-status pet-status-${pet.status?.toLowerCase()}`}>
                        {pet.status || 'Disponível'}
                      </span>
                    </div>
                  ) : (
                    <CardPet
                      key={index}
                      image={pet.image}
                      name={pet.name}
                      gender={pet.gender}
                      age={pet.age}
                      type={pet.type}
                      hasSpecialCondition={pet.hasSpecialCondition}
                      specialCondition={pet.specialCondition}
                      vaccinated={pet.vaccinated}
                      castrated={pet.castrated}
                      dewormed={pet.dewormed}
                      onClick={() => navigate(`/pet-info/${pet.id}`)}
                    />
                  )
                ))
              ) : (
                <p className="no-pets-message">
                  {activeFilters && 
                   (Object.values(activeFilters).some(arr => arr.length > 0) ||
                    activeFilters.coat.length > 0)
                    ? "Nenhum pet encontrado com os filtros selecionados." 
                    : getNoItemsMessage(category)}
                </p>
              )}
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="pagination-controls">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="pagination-button"
                aria-label="Página anterior"
              >
                <CaretLeft size={24} weight="bold" />
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="pagination-button"
                aria-label="Próxima página"
              >
                <CaretRight size={24} weight="bold" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CatalogFilter;
