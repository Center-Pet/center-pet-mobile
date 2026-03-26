import React, { useEffect, useState } from "react";
import PetShowcase from "../../components/Organisms/PetShowcase/PetShowcase";
import Filter from "../../components/Atoms/Filter/Filter";
import { API_URL } from "../../config/api.js";
import "./Catalog.css";

const Catalog = () => {
  const [petsMaisPacientes, setPetsMaisPacientes] = useState([]);
  const [petsEspeciais, setPetsEspeciais] = useState([]);
  const [novosPets, setNovosPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPets, setFilteredPets] = useState({
    special: [],
    patient: [],
    new: [],
  });
  const [activeFilters, setActiveFilters] = useState({
    gender: [],
    size: [],
    age: [],
    health: [],
    coat: [],
    state: "",
    city: "",
  });

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/pets`);
        const data = await response.json();

        // Processando todos os pets para garantir formato consistente
        const processedPets = data.map((pet) => ({
          ...pet,
          id: pet._id,
          // Processando as imagens
          image:
            pet.image?.[0] ||
            pet.photos?.[0] ||
            pet.imagens?.[0] ||
            (Array.isArray(pet.image) && pet.image.length > 0
              ? pet.image[0]
              : null) ||
            "https://i.imgur.com/B2BFUeU.png",
          // Processando as informações de saúde
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
          coat: pet.coat || "",
          status: pet.status || "Disponível", // Adicionando status com valor padrão
        }));

        // Filtrando apenas pets disponíveis
        const availablePets = processedPets.filter(pet => pet.status === "Disponível");

        // Pets Especiais: filtra os que têm condições especiais
        const especiais = availablePets.filter(
          (pet) => pet.hasSpecialCondition
        );
        setPetsEspeciais(especiais);

        // Pets Mais Pacientes: maiores waitingTime
        const pacientes = [...availablePets]
          .filter((pet) => !isNaN(Number(pet.waitingTime)))
          .sort((a, b) => Number(b.waitingTime) - Number(a.waitingTime))
          .slice(0, 10);
        setPetsMaisPacientes(pacientes);

        // Novos Pets: ordena por registerDate
        const novos = [...availablePets]
          .filter((pet) => pet.registerDate)
          .sort((a, b) => new Date(b.registerDate) - new Date(a.registerDate))
          .slice(0, 10);
        setNovosPets(novos);

        // Inicializa filteredPets com todos os pets iniciais
        setFilteredPets({
          special: especiais,
          patient: pacientes,
          new: novos,
        });
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
        setPetsEspeciais([]);
        setPetsMaisPacientes([]);
        setNovosPets([]);
        setFilteredPets({
          special: [],
          patient: [],
          new: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Função utilitária para normalizar strings (remove acentos, caixa e final o/a)
  function normalize(str) {
    return (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/(o|a)$/i, "")
      .toLowerCase()
      .trim();
  }

  // Efeito para aplicar filtros quando activeFilters mudar
  useEffect(() => {
    const hasActiveFilters = 
      Object.values(activeFilters).some(value => 
        Array.isArray(value) ? value.length > 0 : !!value
      );

    // Se não há filtros ativos, mostramos todos os pets originais
    if (!hasActiveFilters) {
      setFilteredPets({
        special: petsEspeciais,
        patient: petsMaisPacientes,
        new: novosPets,
      });
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
          if (filter === "Idoso") return petAge.toLowerCase().includes("idoso");
          return false;
        });
        if (!matches) return false;
      }

      // Verificar filtro de pelagem
      if (activeFilters.coat && activeFilters.coat.length > 0) {
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

    // Aplicar filtros a cada categoria de pets
    setFilteredPets({
      special: petsEspeciais.filter(matchesFilters),
      patient: petsMaisPacientes.filter(matchesFilters),
      new: novosPets.filter(matchesFilters),
    });
  }, [activeFilters, petsEspeciais, petsMaisPacientes, novosPets]);

  // Handler para atualizar os filtros ativos
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="catalog-container">
      {/* Componente de filtro no início da página */}
      <div className="catalog-header">
        <Filter onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* PetShowcase para pets especiais */}
          <PetShowcase
            title="Pets Especiais"
            pets={filteredPets.special}
            category="special"
            limit={8} // Limitando para mostrar apenas 8 pets inicialmente
          />

          {/* PetShowcase para pets mais pacientes */}
          <PetShowcase
            title="Pets Mais Pacientes"
            pets={filteredPets.patient}
            category="more-patient"
            limit={8}
          />

          {/* PetShowcase para novos pets */}
          <PetShowcase
            title="Novos Pets"
            pets={filteredPets.new}
            category="new"
            limit={8}
          />
        </>
      )}
    </div>
  );
};

export default Catalog;
