import { Funnel, X, CaretDown, CaretUp } from "phosphor-react";
import "./Filter.css";
import { useState, useEffect, useRef } from "react";

// Subcomponente para cada dropdown de filtro
const FilterDropdown = ({ 
  category, 
  options, 
  selected, // Para multi-seleção (array)
  onChange, // Para multi-seleção
  isLocation = false, // Identifica se é um filtro de localização
  value, // Para seleção única (string)
  onValueChange, // Para seleção única
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemClick = (optionValue) => {
    onValueChange(category, optionValue);
    setIsOpen(false);
  };
  
  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (option) => {
    onChange(category, option);
  };

  const filteredOptions = isLocation && category === "Cidade"
    ? options.filter(opt => opt.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  let displayValue = category;
  if (isLocation && value) {
    const selectedOption = options.find(o => (o.sigla || o.nome) === value);
    if (selectedOption) {
      displayValue = selectedOption.nome;
    }
  }
  
  const selectionCount = Array.isArray(selected) ? selected.length : 0;
  const isActive = isLocation ? !!value : selectionCount > 0;

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button 
        className={`filter-button ${isActive ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {displayValue} {selectionCount > 0 && `(${selectionCount})`}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {isLocation ? (
            <>
              {category === "Cidade" && (
                <input
                  type="text"
                  className="dropdown-search"
                  placeholder="Buscar cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              )}
              <div className="dropdown-options-list">
                {filteredOptions.map((option, idx) => (
                  <div 
                    key={idx} 
                    className="dropdown-item" 
                    onClick={() => handleItemClick(option.sigla || option.nome)}
                  >
                    {option.nome}
                  </div>
                ))}
              </div>
            </>
          ) : (
            options.map((option, idx) => (
              <label key={idx} className="dropdown-item">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                <span className="checkmark"></span>
                {option}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Componente principal do Filtro
const Filter = ({ onFilterChange, userType }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    gender: [],
    size: [],
    age: [],
    health: [],
    coat: [],
    status: [],
    state: "",
    city: "",
  });
  
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); // Novo estado para controlar expansão

  // Busca estados
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => res.json())
      .then(setStates);
  }, []);

  // Busca cidades quando o estado muda
  useEffect(() => {
    if (selectedFilters.state) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedFilters.state}/municipios`)
        .then((res) => res.json())
        .then(setCities);
    } else {
      setCities([]);
    }
  }, [selectedFilters.state]);

  const categories = {
    Espécie: ["Cachorro", "Gato"],
    Gênero: ["Fêmea", "Macho"],
    Porte: ["Grande Porte", "Médio Porte", "Pequeno Porte"],
    Idade: ["Filhote", "Jovem", "Adulto", "Idoso"],
    Pelagem: ["Curta", "Média", "Longa", "Sem pelo"],
    Saúde: [
      "Vacinado",
      "Castrado",
      "Vermifugado",
      "Condição Especial",
    ],
    Status: ["Disponível", "Indisponível", "Aguardando", "Adotado"],
  };

  const categoryKeys = {
    Espécie: "type",
    Gênero: "gender",
    Porte: "size",
    Idade: "age",
    Pelagem: "coat",
    Saúde: "health",
    Status: "status",
  };
  
  const handleFilterChange = (category, option) => {
    const categoryKey = categoryKeys[category];
    
    setSelectedFilters(prev => {
      const currentSelection = prev[categoryKey];
      const newSelection = currentSelection.includes(option)
        ? currentSelection.filter(item => item !== option)
        : [...currentSelection, option];
      return { ...prev, [categoryKey]: newSelection };
    });
  };

  const handleLocationChange = (category, value) => {
    const type = category === 'Estado' ? 'state' : 'city';
    setSelectedFilters(prev => {
      const newFilters = { ...prev, [type]: value };
      if (type === 'state') {
        newFilters.city = ''; // Reseta a cidade quando o estado muda
      }
      return newFilters;
    });
  };

  // Limpa todos os filtros
  const clearFilters = () => {
    setSelectedFilters({
      type: [],
      gender: [],
      size: [],
      age: [],
      health: [],
      coat: [],
      status: [],
      state: "",
      city: "",
    });
  };

  useEffect(() => {
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const totalActiveFilters = 
    Object.values(selectedFilters)
      .filter(v => Array.isArray(v) ? v.length > 0 : !!v)
      .reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 1), 0);

  return (
    <div className="horizontal-filter-bar">
      <div className="filter-group">
        <div 
          className="filter-title-container"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <Funnel size={20} className="filter-icon" />
          <span className="filter-title">Filtros:</span>
          {isExpanded ? (
            <CaretUp size={16} className="filter-toggle-icon" />
          ) : (
            <CaretDown size={16} className="filter-toggle-icon" />
          )}
        </div>
        {isExpanded && (
          <>
            {Object.entries(categories).map(([category, options]) => {
              if (category === "Status" && userType !== "Ong") {
                return null;
              }
              const categoryKey = categoryKeys[category];
              return (
                <FilterDropdown
                  key={category}
                  category={category}
                  options={options}
                  selected={selectedFilters[categoryKey]}
                  onChange={handleFilterChange}
                />
              );
            })}
            {/* Filtros de Localização */}
            <FilterDropdown
              isLocation
              category="Estado"
              options={states}
              value={selectedFilters.state}
              onValueChange={handleLocationChange}
            />
            <FilterDropdown
              isLocation
              category="Cidade"
              options={cities}
              value={selectedFilters.city}
              onValueChange={handleLocationChange}
              disabled={!selectedFilters.state}
            />
          </>
        )}
      </div>
      {totalActiveFilters > 0 && (
        <button className="clear-filters-button" onClick={clearFilters}>
          <X size={16} weight="bold" />
          Limpar Filtros ({totalActiveFilters})
        </button>
      )}
      {totalActiveFilters > 0 && (
        <button className="clear-filters-button-mobile" onClick={clearFilters}>
          Limpar ({totalActiveFilters})
        </button>
      )}
    </div>
  );
};

export default Filter;
