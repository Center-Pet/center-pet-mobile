import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./AdoptionsTable.css";
import { API_URL } from "../../../config/api";
import Title from "../../Atoms/TitleType/TitleType";
import { CaretLeft, CaretRight } from "phosphor-react";
import Filter from '../../Atoms/Filter/Filter';
import FilterDropdown from '../../Atoms/Filter/Filter';

function StatusFilterDropdown({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="filter-dropdown-container" ref={dropdownRef} style={{ display: 'inline-block' }}>
      <button
        className={`filter-button${selected.length > 0 ? ' active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        Status {selected.length > 0 && `(${selected.length})`}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, idx) => (
            <label key={idx} className="dropdown-item">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onChange(option)}
              />
              <span className="checkmark"></span>
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdoptionsTable({ ongId, statusFilter = [] }) {
  const [filteredAdoptions, setFilteredAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const translateStatus = (status) => {
    if (!status) return "Solicitação Recebida";
    
    const statusMap = {
      'requestReceived': 'Solicitação Recebida',
      'inProgress': 'Em Andamento',
      'approved': 'Aprovada',
      'rejected': 'Recusada',
      'canceled': 'Cancelada',
      'inAdjustment': 'Em Adaptação',
      'completed': 'Concluída',
      'return': 'Retorno',
      'pendente': 'Solicitação Recebida'
    };
    
    return statusMap[status] || status;
  };
  
  const statusOptions = [
    'Solicitação Recebida',
    'Em Andamento',
    'Aprovada',
    'Recusada',
    'Cancelada',
    'Em Adaptação',
    'Concluída',
    'Retorno',
  ];
  const [selectedStatus, setSelectedStatus] = useState([]);

  const handleStatusChange = (option) => {
    setSelectedStatus((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // Buscar adoções da ONG
  useEffect(() => {
    if (!ongId) {
      setLoading(false);
      return;
    }
    const fetchAdoptions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/adoptions/by-ong/${ongId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        let fetchedAdoptions = [];
        if (data && data.adoptions) {
          fetchedAdoptions = data.adoptions;
        } else if (Array.isArray(data)) {
          fetchedAdoptions = data;
        }
        // Aplicar o filtro de status
        const statusFilteredAdoptions = selectedStatus.length > 0
          ? fetchedAdoptions.filter(adoption => selectedStatus.includes(translateStatus(adoption.status)))
          : fetchedAdoptions;
        setFilteredAdoptions(statusFilteredAdoptions);
      } catch {
        setFilteredAdoptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptions();
  }, [ongId, selectedStatus]);

  // Calcular o total de páginas
  const totalPages = Math.ceil(filteredAdoptions.length / itemsPerPage);

  // Ordenar por data decrescente (mais recente primeiro)
  const sortedAdoptions = [...filteredAdoptions].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  // Obter as adoções da página atual
  const getCurrentAdoptions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAdoptions.slice(startIndex, endIndex);
  };

  // Função para mudar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="adoptions-table-container">
      <div className="adoptions-table-header" style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
        <Title marginBottom={0}>Solicitações de adoção</Title>
        <StatusFilterDropdown
          options={statusOptions}
          selected={selectedStatus}
          onChange={handleStatusChange}
        />
      </div>
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : !sortedAdoptions.length ? (
        <div className="adoptions-table-empty">Nenhuma adoção encontrada.</div>
      ) : (
        <div className="adoptions-table-wrapper">
          <table className="adoptions-table">
            <thead>
              <tr>
                <th>Nome do Pet</th>
                <th>Nome do Adotante</th>
                <th>Cidade</th>
                <th>Contato</th>
                <th>Data de Solicitação</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {getCurrentAdoptions().map((adoption) => (
                <tr key={adoption._id}>
                  <td>{adoption.petId?.name || "Não informado"}</td>
                  <td>{adoption.userId?.fullName || "Não informado"}</td>
                  <td>{adoption.userId?.city || "Não informado"}</td>
                  <td>{adoption.userId?.phone || adoption.userId?.email || "Não informado"}</td>
                  <td>
                    {adoption.requestDate
                      ? new Date(adoption.requestDate).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </td>
                  <td>
                    <span className={`adoption-status adoption-status-${adoption.status}`}>
                      {translateStatus(adoption.status)}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="adoptions-table-link"
                      to={`/adoption/${adoption._id}`}
                    >
                      Ver Mais
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="pagination-controls" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '20px', 
          margin: '30px 0',
          padding: '20px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              padding: 0,
              backgroundColor: currentPage === 1 ? '#cccccc' : '#d25b82',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s, transform 0.2s'
            }}
            aria-label="Página anterior"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          
          <span className="page-info" style={{
            fontSize: '16px',
            color: '#666',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              padding: 0,
              backgroundColor: currentPage === totalPages ? '#cccccc' : '#d25b82',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s, transform 0.2s'
            }}
            aria-label="Próxima página"
          >
            <CaretRight size={24} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}