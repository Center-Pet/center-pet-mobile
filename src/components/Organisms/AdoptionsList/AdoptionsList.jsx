import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import './AdoptionsList.css';
import Title from "../../Atoms/TitleType/TitleType";
import { API_URL } from '../../../config/api';
import { CaretDown, CaretLeft, CaretRight } from "phosphor-react";
import Filter from '../../Atoms/Filter/Filter';

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

export default function AdoptionsList({ ongId, statusFilter = [] }) {
  const [adoptions, setAdoptions] = useState([]);
    const [adoptionsWithDetails, setAdoptionsWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    'Solicitação Recebida',
    'Em Andamento',
    'Aprovada',
    'Recusada',
    'Cancelada',
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
        const token = localStorage.getItem("token");
        const url = `${API_URL}/adoptions/by-ong/${ongId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        if (data && data.adoptions) {
                    setAdoptions(data.adoptions);
        } else if (Array.isArray(data)) {
                    setAdoptions(data);
                } else {
                    setAdoptions([]);
                }
            } catch {
        setAdoptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptions();
    }, [ongId]);

    // Buscar detalhes do adotante (opcional, pode ser removido se não precisar)
    useEffect(() => {
        if (adoptions.length === 0) return;
        const fetchAdoptersDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const adoptionsWithAdopterDetails = [];
                for (const adoption of adoptions) {
                    if (!adoption.userId || !adoption.userId._id) {
                        adoptionsWithAdopterDetails.push(adoption);
                        continue;
                    }
                    try {
                        const adopterRes = await fetch(
                            `${API_URL}/adopters/${adoption.userId._id}`,
                            {
                                headers: {
                                    Authorization: token ? `Bearer ${token}` : "",
                                },
                            }
                        );
                        if (adopterRes.ok) {
                            const adopterDetails = await adopterRes.json();
                            adoptionsWithAdopterDetails.push({
                                ...adoption,
                                adopterDetails
                            });
                        } else {
                            adoptionsWithAdopterDetails.push(adoption);
                        }
                    } catch {
                        adoptionsWithAdopterDetails.push(adoption);
                    }
                }
                setAdoptionsWithDetails(adoptionsWithAdopterDetails);
            } catch {
                // erro silencioso
            }
        };
        fetchAdoptersDetails();
    }, [adoptions]);

    const displayAdoptions = adoptionsWithDetails.length > 0 ? adoptionsWithDetails : adoptions;

    // Filtro de status
    const filteredAdoptions = statusFilter.length > 0
        ? displayAdoptions.filter(adoption => statusFilter.includes(adoption.status))
        : displayAdoptions;
    const statusFilteredAdoptions = selectedStatus.length > 0
      ? filteredAdoptions.filter(adoption => selectedStatus.includes(traduzirStatus(adoption.status)))
      : filteredAdoptions;

    // Ordenar por data decrescente (mais recente primeiro)
    const sortedAdoptions = [...statusFilteredAdoptions].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    function traduzirStatus(status) {
        switch ((status || '').toLowerCase()) {
            case 'requestreceived':
                return 'Solicitação Recebida';
            case 'inprogress':
                return 'Em Andamento';
            case 'approved':
                return 'Aprovada';
            case 'rejected':
                return 'Recusada';
            case 'canceled':
                return 'Cancelada';
            case 'inadjustment':
                return 'Em Adaptação';
            case 'completed':
                return 'Concluída';
            case 'return':
                return 'Retorno';
            default:
                return status || 'Pendente';
        }
    }

    // Paginação
    const totalPages = Math.ceil(sortedAdoptions.length / itemsPerPage);
    const initialI = (currentPage - 1) * itemsPerPage;
    const visibleItems = sortedAdoptions.slice(initialI, initialI + itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Expandir/colapsar detalhes
    const showDescription = (target) => {
        const itemDescription = target.nextElementSibling;
        const iconCaret = target.querySelector('svg');
        if (itemDescription.classList.contains('active')) {
            itemDescription.classList.remove('active');
            itemDescription.classList.add('inactive');
            iconCaret.classList.remove('active');
            iconCaret.classList.add('inactive');
        } else {
            itemDescription.classList.remove('inactive');
            itemDescription.classList.add('active');
            iconCaret.classList.remove('inactive');
            iconCaret.classList.add('active');
        }
  };

  if (loading) return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
    if (!filteredAdoptions.length) return <div className="adoptions-table-empty">Nenhuma adoção encontrada.</div>;

  return (
        <div className="adoptions-list-container">
      <div className="adoptions-list-header" style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
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
            ) : sortedAdoptions.length === 0 ? (
                <div className="adoptions-table-empty">Nenhuma adoção encontrada.</div>
            ) : (
                <div className="adoptions-list">
                    <div className="adoptions-list-mobile">
                        {visibleItems.map((adoption) => (
                            <div key={adoption._id} className="adoptions-list-item-mobile">
                                <div className="adoption-list-item-summary" onClick={(e) => showDescription(e.currentTarget)}>
                                    <div className="adoption-basic-details">
                                        <p><b>Pet:</b> {adoption.petId?.name || "Não informado"}</p>
                                        <p><b>Status:</b> <span className={`adoption-status adoption-status-${adoption.status}`}>{traduzirStatus(adoption.status)}</span></p>
                                    </div>
                                    <CaretDown size={45} color="rgb(0, 0, 0)" className="inactive" />
                                </div>
                                <div className="adoption-list-item-description inactive">
                                    <p><b>Nome do pet:</b> {adoption.petId?.name || "Não informado"}</p>
                                    <p><b>Nome do adotante:</b> {adoption.adopterDetails?.fullName || adoption.userId?.fullName || "Não informado"}</p>
                                    <p><b>Cidade:</b> {adoption.adopterDetails?.city || (adoption.adopterDetails?.address?.city) || adoption.userId?.city || "Não informado"}</p>
                                    <p><b>Contato:</b> {adoption.adopterDetails?.phone || adoption.adopterDetails?.email || adoption.userId?.email || "Não informado"}</p>
                                    <p><b>Data de Solicitação:</b> {adoption.requestDate ? new Date(adoption.requestDate).toLocaleDateString("pt-BR") : "Não informado"}</p>
                                    <p><b>Status:</b> <span className={`adoption-status adoption-status-${adoption.status}`}>{traduzirStatus(adoption.status)}</span></p>
                    <Link
                      className="adoptions-table-link"
                      to={`/adoption/${adoption._id}`}
                    >
                      Ver Mais
                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination-list">
                        <button className="pagination-list-button" onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <CaretLeft size={25} color="#FFC8D1" />
              </button>
                        <span>{currentPage} de {totalPages} páginas</span>
                        <button className="pagination-list-button" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <CaretRight size={25} color="#FFC8D1" />
              </button>
                  </div>
                </div>
            )}
    </div>
  );
}