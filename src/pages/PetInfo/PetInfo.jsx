import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PetShowcase from "../../components/Organisms/PetShowcase/PetShowcase";
import SocialShare from "../../components/Atoms/SocialShare/SocialShare";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType";
import { PencilSimple, Trash, Heart } from "phosphor-react";
import Swal from "sweetalert2";
import "./PetInfo.css";
import {
  Dog,
  Scissors,
  CalendarBlank,
  MapPin,
  GenderMale,
  PawPrint,
  Ruler,
  Syringe,
  ShieldCheck,
  Heartbeat,
  Clock,
  ChartPie
} from "phosphor-react";
import { API_URL } from "../../config/api";
import slugify from '../../utils/slugify';

function getWaitingTime(waitingTime) {
  if (!waitingTime) return "Não informado";
  const months = parseInt(waitingTime);
  if (isNaN(months)) return "Não informado";
  return months === 1 ? "1 mês" : `${months} meses`;
}

const PetInfo = () => {
  const { petId } = useParams(); // Obtém o ID do pet da URL
  const navigate = useNavigate();
  const { user, userType, isAuthenticated } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [pet, setPet] = useState(null);
  const [ongData, setOngData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);
  const [adoptionRequested, setAdoptionRequested] = useState(false); // Novo estado para controlar a solicitação de adoção

  // Atualize os estados para o zoom dinâmico
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Buscar dados do pet da API
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        // Buscar informações do pet
        const response = await fetch(
          `${API_URL}/pets/${petId}`
        );

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar informações do pet (${response.status})`
          );
        }

        const data = await response.json();
        console.log("Dados do pet:", data);
        setPet(data);

        // Buscar informações da ONG
        if (data.ongId) {
          try {
            // Usar a rota correta para API de produção
            const ongResponse = await fetch(
              `${API_URL}/ongs/${data.ongId}`
            );

            if (ongResponse.ok) {
              const ongResponseData = await ongResponse.json();
              console.log("Resposta completa da API de ONGs:", ongResponseData);

              // A estrutura da API retorna o objeto da ONG em data.data
              if (ongResponseData.success && ongResponseData.data) {
                setOngData(ongResponseData.data);
              } else {
                console.error(
                  "Formato de resposta da API de ONGs inesperado:",
                  ongResponseData
                );
              }
            } else {
              console.error(
                `Erro ao buscar dados da ONG: ${ongResponse.status}`
              );
            }
          } catch (err) {
            console.error("Erro ao buscar dados da ONG:", err);
          }
        }

        // Após carregar o pet, buscar pets similares (mesma espécie)
        if (data.type) {
          try {
            const similarResponse = await fetch(
              `${API_URL}/pets?type=${data.type}&limit=12&exclude=${petId}`
            );
            if (similarResponse.ok) {
              const similarData = await similarResponse.json();
              // Formatar os dados para o PetShowcase e filtrar apenas pets disponíveis
              const formattedPets = (similarData.data || similarData)
                .filter(pet => pet.status === "Disponível" && pet._id !== petId)
                .map(pet => ({
                  id: pet._id,
                  image: pet.image?.[0] || pet.photos?.[0] || pet.imagens?.[0] ||
                    (Array.isArray(pet.image) && pet.image.length > 0 ? pet.image[0] : null) ||
                    "https://i.imgur.com/B2BFUeU.png",
                  name: pet.name,
                  gender: pet.gender,
                  age: pet.age,
                  type: pet.type,
                  hasSpecialCondition: pet.health?.specialCondition &&
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
                  status: pet.status || "Disponível"
                }));
              setSimilarPets(formattedPets);
            }
          } catch (err) {
            console.error("Erro ao buscar pets similares:", err);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar pet:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetData();
    }
  }, [petId]);

  // Manipuladores de eventos
  const handleEditPet = () => {
    navigate(`/edit-pet/${petId}`);
  };

  const handleAdoptPet = async () => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Necessário",
        text: "Para adotar um pet, você precisa estar logado como adotante.",
        icon: "info",
        confirmButtonColor: "#FF8BA7",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    // Verificar se o usuário é um adotante
    if (userType !== "Adopter") {
      Swal.fire({
        title: "Erro",
        text: "Apenas adotantes podem solicitar adoção de pets.",
        icon: "error",
        confirmButtonColor: "#FF8BA7",
      });
      return;
    }

    // Verificar se o usuário é um Safe Adopter
    if (!user.safeAdopter) {
      Swal.fire({
        title: "Formulário de Adoção Pendente",
        text: "Para adotar um pet, você precisa preencher o formulário de adotante seguro primeiro.",
        icon: "warning",
        confirmButtonColor: "#FF8BA7",
        showCancelButton: true,
        cancelButtonText: "Mais tarde",
        confirmButtonText: "Preencher agora",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/form-safe-adopter");
        }
      });
      return;
    }

    // Cria a adoção no banco de dados
    try {
      Swal.fire({
        title: "Enviando solicitação...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        `${API_URL}/adoptions/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: user._id,
            petId: pet._id,
            ongId: pet.ongId,
            status: status || "requestReceived",
            requestDate: new Date(),
          }),
        }
      );

      const data = await response.json();
      Swal.close();

      if (!response.ok) {
        // Tratamento para solicitação recente
        if (response.status === 400 && data.message?.includes("solicitação de adoção")) {
          Swal.fire({
            title: "Solicitação recente",
            text: data.message,
            icon: "warning",
            confirmButtonColor: "#FF8BA7",
          });
          return;
        }
        // Outros erros
        throw new Error(data.message || "Erro ao criar solicitação de adoção.");
      }

      // Enviar email de solicitação de adoção
      await fetch(
        `${API_URL}/emails/adoption-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            adopterName: user.fullName,
            adopterEmail: user.email,
            petName: pet.name,
            ongId: pet.ongId,
            petId: pet._id,
          }),
        }
      );

      Swal.fire({
        title: "Solicitação Enviada!",
        html: `
          <p>Sua solicitação para adotar <strong>${pet.name
          }</strong> foi enviada com sucesso para a ONG <strong>${ongData ? ongData.name : ""
          }</strong>.</p>
          <p>Agora é necessário aguardar a análise da ONG, que irá verificar as informações fornecidas no seu formulário de adotante seguro.</p>
          <p>Você receberá uma notificação assim que houver uma resposta.</p>
        `,
        icon: "success",
        confirmButtonColor: "#FF8BA7",
        confirmButtonText: "Entendi",
      }).then((result) => {
        if (result.isConfirmed) {
          setAdoptionRequested(true);
          navigate("../", {
            state: {
              adopterId: user._id,
              petId: pet._id,
              ongId: pet.ongId,
            },
          });
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Erro",
        text:
          error.message || "Não foi possível criar a solicitação de adoção.",
        icon: "error",
        confirmButtonColor: "#FF8BA7",
      });
    }
  };

  // Adicione a função para lidar com a remoção do pet
  const handleDeletePet = () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4D4D",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, deletar pet",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Mostrar loading
          Swal.fire({
            title: "Deletando pet...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Fazer requisição para deletar o pet
          const response = await fetch(
            `${API_URL}/pets/delete/${petId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao deletar pet");
          }

          Swal.fire({
            title: "Sucesso!",
            text: "Pet removido com sucesso.",
            icon: "success",
            confirmButtonColor: "#FF8BA7",
          }).then(() => {
            // Redirecionar para o perfil da ONG
            navigate(`/ong-profile/${user._id}`);
          });
        } catch (error) {
          console.error("Erro ao deletar pet:", error);
          Swal.fire({
            title: "Erro",
            text: "Não foi possível deletar o pet.",
            icon: "error",
            confirmButtonColor: "#FF8BA7",
          });
        }
      }
    });
  };

  // Função para marcar o pet como adotado
  const handleMarkAsAdopted = () => {
    Swal.fire({
      title: "Marcar como Adotado",
      text: `Tem certeza que deseja marcar ${pet.name} como adotado? Esta ação pode ser revertida editando o pet.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, marcar como adotado",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Mostrar loading
          Swal.fire({
            title: "Atualizando status...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Fazer requisição para atualizar o status do pet
          const response = await fetch(
            `${API_URL}/pets/update/${petId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                status: "Adotado"
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao atualizar status do pet");
          }

          const updatedPet = await response.json();

          // Atualizar o estado local do pet
          setPet(prevPet => ({
            ...prevPet,
            status: "Adotado"
          }));

          Swal.fire({
            title: "Sucesso!",
            text: `${pet.name} foi marcado como adotado com sucesso!`,
            icon: "success",
            confirmButtonColor: "#4CAF50",
          });
        } catch (error) {
          console.error("Erro ao marcar pet como adotado:", error);
          Swal.fire({
            title: "Erro",
            text: "Não foi possível marcar o pet como adotado.",
            icon: "error",
            confirmButtonColor: "#FF8BA7",
          });
        }
      }
    });
  };

  // Funções para controle do modal de imagem
  const openImageModal = () => {
    setIsImageModalOpen(true);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // Função para lidar com cliques na imagem para zoom
  const handleImageClick = (e) => {
    e.stopPropagation(); // Impede que o clique feche o modal

    // Se já estiver no zoom máximo, volta ao normal
    if (zoomLevel >= 2.5) {
      setZoomLevel(1);
      setZoomPosition({ x: 0, y: 0 });
      return;
    }

    // Caso contrário, faz zoom no ponto clicado
    const imageElement = e.target;
    const { left, top, width, height } = imageElement.getBoundingClientRect();

    // Calcula a posição relativa do clique dentro da imagem (0 a 1)
    const relativeX = (e.clientX - left) / width;
    const relativeY = (e.clientY - top) / height;

    // Aumenta o zoom
    const newZoomLevel = zoomLevel === 1 ? 2.5 : 1;

    // Calcula o deslocamento para centralizar o zoom no ponto clicado
    const offsetX = (0.5 - relativeX) * 100;
    const offsetY = (0.5 - relativeY) * 100;

    setZoomLevel(newZoomLevel);

    if (newZoomLevel > 1) {
      setZoomPosition({ x: offsetX, y: offsetY });
    } else {
      setZoomPosition({ x: 0, y: 0 });
    }
  };

  // Funções para arrastar a imagem quando ampliada
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - zoomPosition.x,
        y: e.clientY - zoomPosition.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setZoomPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="pet-info-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pet-info-container">
        <div className="error-container">
          <p>Erro ao carregar informações: {error || "Pet não encontrado"}</p>
        </div>
      </div>
    );
  }

  // Prepara as imagens do pet
  const petImages = pet.image || [];

  const handleThumbnailClick = (index) => {
    setCurrentImage(index);
  };

  const handleNextImage = () => {
    setCurrentImage((prevIndex) => (prevIndex + 1) % petImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImage((prevIndex) =>
      prevIndex === 0 ? petImages.length - 1 : prevIndex - 1
    );
  };

  // Verificar permissões com base no tipo de usuário
  const isOngOwner =
    isAuthenticated && user && userType === "Ong" && pet?.ongId === user._id;
  const isOngButNotOwner =
    isAuthenticated && user && userType === "Ong" && pet?.ongId !== user._id;
  const canAdopt =
    (!isAuthenticated || (isAuthenticated && userType === "Adopter")) && 
    pet?.status !== "Adotado"; // Não pode adotar se o pet já foi adotado

  const petFields = [
    {
      label: "Espécie",
      value: pet.type,
      icon: <Dog size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Pelagem",
      value: pet.coat,
      icon: <Scissors size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Idade",
      value: pet.age,
      icon: <CalendarBlank size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Gênero",
      value: pet.gender,
      icon: <GenderMale size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Raça",
      value: pet.breed,
      icon: <PawPrint size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Porte",
      value: pet.size,
      icon: <Ruler size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Vacinado",
      value: pet.health?.vaccinated ? "Sim" : "Não",
      icon: <Syringe size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Castrado",
      value: pet.health?.castrated ? "Sim" : "Não",
      icon: <ShieldCheck size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Vermifugado",
      value: pet.health?.dewormed ? "Sim" : "Não",
      icon: <ShieldCheck size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Esperando um amigo há",
      value: getWaitingTime(pet.waitingTime),
      icon: <Clock size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Condição Especial",
      value: Array.isArray(pet.health?.specialCondition) ? 
             pet.health.specialCondition.join(", ") : 
             pet.health?.specialCondition || "Nenhuma",
      icon: <Heartbeat size={20} style={{ marginRight: 6 }} />,
    },
    {
      label: "Status",
      value: pet.status || "Não informado", // Removido o texto "meses" que estava sendo adicionado incorretamente
      icon: <ChartPie size={20} style={{ marginRight: 6 }} />

    },
  ];

  return (
    <>
      <div className="pet-info-container">
        <div className="pet-profile-card">
          <div className="pet-main-info">
            <div className="pet-image-container">
              <button
                className="nav-button prev-button"
                onClick={handlePrevImage}
                disabled={petImages.length <= 1}
              >
                &#8249;
              </button>
              <img
                src={
                  petImages[currentImage] || "https://i.imgur.com/B2BFUeU.png"
                }
                alt={pet.name}
                className="pet-main-image"
                onClick={openImageModal}
                style={{ cursor: "zoom-in" }}
              />
              <button
                className="nav-button next-button"
                onClick={handleNextImage}
                disabled={petImages.length <= 1}
              >
                &#8250;
              </button>
              {petImages.length > 0 && (
                <div className="pet-thumbnails">
                  {petImages.map((image, index) => (
                    <img
                      key={index}
                      src={image || "https://i.imgur.com/B2BFUeU.png"}
                      alt={`${pet.name} thumbnail ${index + 1}`}
                      className={`pet-thumbnail ${currentImage === index ? "active" : ""
                        }`}
                      onClick={() => handleThumbnailClick(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="pet-details">
              <div className="petinfo-title-row">
                <h2>Conheça {pet.name}</h2>
                <SocialShare 
                  url={window.location.href}
                  title={`Conheça ${pet.name} - Center Pet`}
                />
              </div>
              <h4 className="petinfo-ong-subtitle">
                De{" "}
                <strong>
                  <a href={`/ong-profile/${ongData ? slugify(ongData.name) : ''}`}>
                    {ongData ? ongData.name : "Carregando..."}
                  </a>
                </strong>
              </h4>
              <h4 className="location-subtitle">
                <MapPin size={16} style={{ marginRight: 4 }} />
                {pet.city && pet.state ? `${pet.city}, ${pet.state}` : "Localização não informada"}
              </h4>
              <p className="pet-bio">
                {pet.bio || "Sem descrição disponível."}
              </p>
              <div className="pet-info-grid">
                {petFields.map(({ label, value, icon }) => {
                  const isSpecialCondition = label === "Condição Especial";
                  // Verifica se o valor é uma string e tem um comprimento que justifique a quebra
                  const needsFullWidth = isSpecialCondition && typeof value === 'string' && value.length > 25;

                  return (
                    <div 
                      className={`info-row ${needsFullWidth ? 'full-width' : ''}`} 
                      key={label}
                    >
                      <span className="info-label">
                        {icon}
                        {label}:
                      </span>
                      <span className="info-value">{value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Lógica para mostrar botões baseados no tipo de usuário */}
              <div className="pet-action-buttons">
                {/* Se for ONG proprietária, mostrar botões de editar e deletar lado a lado */}
                {isOngOwner && (
                  <div className="button-row">
                    <ButtonType
                      onClick={handleEditPet}
                      bgColor="#D14D72"
                      color="#FFFFFF"
                      width="200px"
                      margin="0"
                    >
                      <PencilSimple size={20} /> Editar Pet
                    </ButtonType>
                    <ButtonType
                      onClick={handleDeletePet}
                      bgColor="#FF4D4D"
                      color="#FFFFFF"
                      width="200px"
                      margin="0"
                    >
                      <Trash size={20} /> Deletar Pet
                    </ButtonType>
                  </div>
                )}

                {/* Botão para marcar como adotado (apenas para ONG proprietária e se o pet não estiver adotado) */}
                {isOngOwner && pet?.status !== "Adotado" && (
                  <div className="button-row" style={{ marginTop: "10px" }}>
                    <ButtonType
                      onClick={handleMarkAsAdopted}
                      bgColor="#4CAF50"
                      color="#FFFFFF"
                      width="200px"
                      margin="0"
                    >
                      <Heart size={25} /> Marcar como Adotado
                    </ButtonType>
                  </div>
                )}

                {/* Se não for ONG ou for adotante, mostrar botão de adotar */}
                {canAdopt && (
                  <button
                    className={`adopt-button ${adoptionRequested ? "requested" : ""
                      }`}
                    onClick={handleAdoptPet}
                    disabled={adoptionRequested}
                  >
                    {adoptionRequested ? "Solicitado" : "Adotar!"}
                  </button>
                )}

                {/* Mostrar mensagem quando o pet já foi adotado */}
                {pet?.status === "Adotado" && canAdopt && (
                  <div className="adopted-message">
                    <p>🐾 Este pet já foi adotado e não está mais disponível!</p>
                  </div>
                )}

                {/* Se for ONG mas não for a proprietária, não mostrar botões */}
                {isOngButNotOwner && (
                  <p className="info-message">
                    Como organização, você não pode adotar este pet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pets Similares */}
        <section className="similar-pets-section">
          <PetShowcase
            title="Pets Similares"
            pets={similarPets}
            category="similar"
            limit={4}
          />
        </section>
      </div>

      {/* Modal para exibir imagem em tamanho real */}
      {isImageModalOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="image-container"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={
                  petImages[currentImage] || "https://i.imgur.com/B2BFUeU.png"
                }
                alt={pet.name}
                onClick={handleImageClick}
                style={{
                  transform: `scale(${zoomLevel}) translate(${zoomPosition.x / zoomLevel
                    }px, ${zoomPosition.y / zoomLevel}px)`,
                  cursor:
                    zoomLevel > 1
                      ? isDragging
                        ? "grabbing"
                        : "grab"
                      : "zoom-in",
                  transition: isDragging ? "none" : "transform 0.3s ease-out",
                }}
              />
            </div>
            <div className="image-navigation">
              <button
                className="nav-button prev-modal-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentImage > 0) {
                    setCurrentImage(currentImage - 1);
                    setZoomLevel(1);
                    setZoomPosition({ x: 0, y: 0 });
                  }
                }}
                disabled={currentImage === 0 || petImages.length <= 1}
              >
                <span>&#8249;</span>
              </button>
              <span>
                {currentImage + 1} / {petImages.length}
              </span>
              <button
                className="nav-button next-modal-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentImage < petImages.length - 1) {
                    setCurrentImage(currentImage + 1);
                    setZoomLevel(1);
                    setZoomPosition({ x: 0, y: 0 });
                  }
                }}
                disabled={
                  currentImage === petImages.length - 1 || petImages.length <= 1
                }
              >
                <span>&#8250;</span>
              </button>
            </div>
            <button
              className="close-modal-button"
              onClick={closeImageModal}
              aria-label="Fechar"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PetInfo;