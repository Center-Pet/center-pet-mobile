import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import TitleType from "../../components/Atoms/TitleType/TitleType";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";
import "./AdoptionPage.css";
import { CaretLeft, WhatsappLogo, EnvelopeSimple } from "phosphor-react";
import slugify from '../../utils/slugify';
import PawAnimation from '../../components/Molecules/PawAnimation/PawAnimation';
import ReactDOMServer from 'react-dom/server';

export default function AdoptionPage() {
  const { adoptionId } = useParams();
  const navigate = useNavigate();
  const { userType } = useAuth();

  const [pet, setPet] = useState(null);
  const [adopter, setAdopter] = useState(null);
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [adoptionStatus, setAdoptionStatus] = useState(null);

  const toggleDetails = () => setShowDetails((prev) => !prev);

  useEffect(() => {
    if (!adoptionId) {
      Swal.fire({
        title: "Erro",
        text: "ID da adoção está ausente na URL.",
        icon: "error",
      }).then(() => navigate("/", { replace: true }));
      return;
    }

    const fetchData = async () => {
      try {
        // Tentar buscar a adoção diretamente primeiro
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (!user._id) {
          throw new Error("Usuário não autenticado");
        }

        let adoptionData = null;

        // Primeiro, tentar buscar a adoção diretamente (se a rota existir)
        try {
          const directRes = await fetch(`${API_URL}/adoptions/${adoptionId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (directRes.ok) {
            adoptionData = await directRes.json();
            console.log("Adoção encontrada via rota direta:", adoptionData);
          }
        } catch (directError) {
          console.log("Rota direta não disponível, tentando via lista:", directError);
        }

        // Se não conseguiu via rota direta, buscar via lista da ONG
        if (!adoptionData) {
          console.log("Buscando via lista de adoções da ONG...");
          
          // Buscar adoções da ONG do usuário logado
          const adoptionsRes = await fetch(`${API_URL}/adoptions/by-ong/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (!adoptionsRes.ok) throw new Error("Erro ao buscar adoções.");
          const adoptionsData = await adoptionsRes.json();
          
          // Encontrar a adoção específica pelo ID
          adoptionData = adoptionsData.adoptions?.find(adoption => adoption._id === adoptionId) || 
                        adoptionsData.find(adoption => adoption._id === adoptionId);
          
          if (!adoptionData) {
            throw new Error("Adoção não encontrada");
          }
          
          console.log("Adoção encontrada via lista:", adoptionData);
        }
        
        console.log("Dados da adoção:", adoptionData);

        // Verificar se temos os IDs necessários
        const petId = adoptionData.petId?._id || adoptionData.petId;
        const userId = adoptionData.userId?._id || adoptionData.userId;
        const ongId = adoptionData.ongId?._id || adoptionData.ongId;
        
        console.log("IDs extraídos:", { petId, userId, ongId });

        if (!petId || !userId || !ongId) {
          throw new Error("Dados da adoção incompletos");
        }

        // Com os IDs obtidos da adoção, buscar informações do pet, adotante e ONG
        const [petRes, adopterRes, ongRes] = await Promise.all([
          fetch(`${API_URL}/pets/${petId}`),
          fetch(`${API_URL}/adopters/${userId}`),
          fetch(`${API_URL}/ongs/${ongId}`),
        ]);

        if (!petRes.ok) throw new Error("Erro ao buscar informações do pet.");
        if (!adopterRes.ok) throw new Error("Erro ao buscar informações do adotante.");
        if (!ongRes.ok) throw new Error("Erro ao buscar informações da ONG.");

        const [petData, adopterData, ongData] = await Promise.all([
          petRes.json(),
          adopterRes.json(),
          ongRes.json(),
        ]);

        console.log("Dados carregados:", { petData, adopterData, ongData });

        setPet(petData.data || petData);
        setAdopter(adopterData.data || adopterData);
        setOng(ongData.data || ongData);
        setAdoptionStatus(adoptionData.status);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        Swal.fire({
          title: "Erro",
          text: "Erro ao carregar informações da adoção. Por favor, tente novamente.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adoptionId, navigate]);

  const handleAccept = async () => {
    const result = await Swal.fire({
      title: "Aceitar solicitação?",
      text: "Você tem certeza que deseja aceitar esta adoção? O adotante será notificado por email.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4caf50",
      cancelButtonColor: "#ff4d4d",
      confirmButtonText: "Sim, aceitar",
      cancelButtonText: "Cancelar",
      background: "#fff",
      color: "#333",
    });
    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Chamar rota de aceitação de adoção (envia e-mail)
        const adoptionRes = await fetch(`${API_URL}/adoptions/accept/${adoptionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

        if (!adoptionRes.ok) throw new Error("Erro ao aceitar adoção.");

        // Atualizar status do pet para Adotado
        const petRes = await fetch(`${API_URL}/pets/update/${pet._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ 
            status: "Adotado",
            name: pet.name,
            type: pet.type,
            coat: pet.coat,
            state: pet.state,
            city: pet.city,
            description: pet.description,
            gender: pet.gender,
            age: pet.age,
            breed: pet.breed,
            size: pet.size,
            health: {
              vaccinated: pet.health.vaccinated,
              castrated: pet.health.castrated,
              dewormed: pet.health.dewormed,
              specialCondition: pet.health.specialCondition
            },
            waitingTime: pet.waitingTime,
            ongId: pet.ongId,
            image: pet.image
          })
        });

        if (!petRes.ok) throw new Error("Erro ao atualizar status do pet.");

        await Swal.fire({
          title: "Solicitação aceita!",
          text: "O adotante foi notificado por email. Agora é só combinar a entrega!",
          icon: "success",
          confirmButtonColor: "#4caf50",
          background: "#fff",
          color: "#333",
        });
        navigate(`/ong-profile/${slugify(ong?.name)}`);
      } catch (err) {
        Swal.fire({
          title: "Erro",
          text: err.message || "Erro ao aceitar solicitação.",
          icon: "error",
          confirmButtonColor: "#ff4d4d",
          background: "#fff",
          color: "#333",
        });
      }
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Recusar solicitação?",
      text: "Tem certeza que deseja recusar esta adoção? O adotante será notificado por email.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4d",
      cancelButtonColor: "#4caf50",
      confirmButtonText: "Sim, recusar adoção",
      cancelButtonText: "Voltar",
      background: "#fff",
      color: "#333",
    });
    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Chamar rota de recusa de adoção (envia e-mail)
        const res = await fetch(`${API_URL}/adoptions/reject/${adoptionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        if (!res.ok) throw new Error("Erro ao cancelar solicitação.");
        await Swal.fire({
          title: "Solicitação cancelada!",
          text: "O adotante foi notificado por email.",
          icon: "info",
          confirmButtonColor: "#ff4d4d",
          background: "#fff",
          color: "#333",
        });
        navigate(`/ong-profile/${slugify(ong?.name)}`);
      } catch (err) {
        Swal.fire({
          title: "Erro",
          text: err.message || "Erro ao cancelar solicitação.",
          icon: "error",
          confirmButtonColor: "#ff4d4d",
          background: "#fff",
          color: "#333",
        });
      }
      setLoading(false);
    }
  };

  function getImageUrl(img) {
    if (!img) return "https://i.imgur.com/B2BFUeU.png";
    if (Array.isArray(img)) img = img[0];
    if (!img) return "https://i.imgur.com/B2BFUeU.png";
    if (img.startsWith("http")) return img;
    return `${API_URL}/uploads/${img}`;
  }

  const openImageModal = (idx) => {
    setCurrentImageIndex(idx);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
    setShowImages(true);
  };

  const handleImageClick = (e) => {
    if (!adopter?.environmentImages?.length) return;
    const img = e.target;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;
    const newZoomLevel = zoomLevel === 1 ? 2.5 : 1;
    const offsetX = (0.5 - relativeX) * 100;
    const offsetY = (0.5 - relativeY) * 100;
    setZoomLevel(newZoomLevel);
    if (newZoomLevel > 1) {
      setZoomPosition({ x: offsetX, y: offsetY });
    } else {
      setZoomPosition({ x: 0, y: 0 });
    }
  };

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
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Função utilitária para formatar o telefone para o padrão internacional brasileiro
  function formatPhoneToWhatsapp(phone) {
    if (!phone) return "";
    let onlyNumbers = phone.replace(/\D/g, "");
    // Se já começa com 55, retorna direto
    if (onlyNumbers.startsWith("55")) return onlyNumbers;
    // Remove zeros à esquerda
    onlyNumbers = onlyNumbers.replace(/^0+/, "");
    // Se tem 11 ou 10 dígitos, adiciona 55
    if (onlyNumbers.length === 11 || onlyNumbers.length === 10) {
      return "55" + onlyNumbers;
    }
    // Se já tem 13 dígitos (ex: 5511999999999), retorna direto
    if (onlyNumbers.length === 13 && onlyNumbers.startsWith("55")) return onlyNumbers;
    // Fallback: retorna só os números
    return onlyNumbers;
  }

  return (
    <div className="adoption-page-container">
      <button
        onClick={() => navigate(`/ong-profile/${slugify(ong?.name)}`)}
        style={{
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          color: "#D14D72",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 8
        }}
        aria-label="Voltar ao perfil"
      >
        <CaretLeft size={20} style={{ marginRight: 6 }} /> Voltar ao perfil
      </button>
      <TitleType>Detalhes da Solicitação de Adoção</TitleType>
      <div className="adoption-info-section">
        <div className="adoption-card">
          <h3>Pet</h3>
          <div>
            <img
              src={getImageUrl(pet?.images || pet?.image)}
              alt={pet?.name || "Imagem do pet"}
              className="adoption-pet-img"
            />

            <p><strong>Nome:</strong> {pet?.name || "Não informado"}</p>
            <p><strong>Espécie:</strong> {pet?.type || "Não informado"}</p>
            <p><strong>Raça:</strong> {pet?.breed || "Não informado"}</p>
            <p><strong>Sexo:</strong> {pet?.gender || "Não informado"}</p>
            <p><strong>Idade:</strong> {pet?.age || "Não informado"}</p>
            <p><strong>Porte:</strong> {pet?.size || "Não informado"}</p>
            <p><strong>Pelagem:</strong> {pet?.coat || "Não informado"}</p>
            <p><strong>Cidade:</strong> {pet?.city || "Não informada"}</p>
            <p><strong>Estado:</strong> {pet?.state || "Não informado"}</p>
            <p><strong>Tempo de espera:</strong> {pet?.waitingTime ? `${pet.waitingTime} dias` : "Não informado"}</p>
          </div>
        </div>
        <div className="adoption-card">
          <h3>Adotante</h3>
          <div>
            <img
              src={adopter?.profileImg || "https://i.imgur.com/B2BFUeU.png"}
              alt="Foto do adotante"
              className="adoption-pet-img"
            />

            <p><strong>Nome:</strong> {adopter?.fullName || "Não informado"}</p>
            <p><strong>Email:</strong> {adopter?.email || "Não informado"}</p>
            <p><strong>Telefone:</strong> {adopter?.phone || "Não informado"}</p>
            <p><strong>Profissão:</strong> {adopter?.profession || "Não informado"}</p>
            <p><strong>Descrição pessoal:</strong> {adopter?.description || "Não informada"}</p>
            <p><strong>Data de nascimento:</strong> {adopter?.birth ? new Date(adopter.birth).toLocaleDateString() : "Não informada"}</p>
            <p><strong>Endereço:</strong> {adopter?.street || "Rua não informada"}, Nº {adopter?.number || "s/n"} — {adopter?.neighborhood || "Bairro não informado"}, {adopter?.city || "Cidade não informada"} - {adopter?.cep || "CEP não informado"}</p>

            <ButtonType onClick={toggleDetails} className="toggle-details-btn">
              {showDetails ? "Ocultar detalhes" : "Mostrar mais detalhes"}
            </ButtonType>

            {showDetails && (
              <div className="adopter-details">

                <p><strong>Tipo de moradia:</strong> {adopter?.housingType || "Não informado"}</p>
                <p><strong>Possui casa própria:</strong> {adopter?.homeOwnership === "Own" ? "Sim" : adopter?.homeOwnership === "Rent" ? "Alugada" : "Não informado"}</p>
                <p><strong>Animais são permitidos:</strong> {adopter?.petsAllowed === true ? "Sim" : adopter?.petsAllowed === false ? "Não" : "Não informado"}</p>
                <p><strong>Local é seguro:</strong> {adopter?.homeSafety === true ? "Sim" : adopter?.homeSafety === false ? "Não" : "Não informado"}</p>

                <p><strong>Número de moradores:</strong> {adopter?.numberOfHouseholdMembers ?? "Não informado"}</p>
                <p><strong>Já teve ou tem pets?</strong> {adopter?.hasOrHadPets || "Não informado"}</p>
                <p><strong>Detalhes dos pets:</strong> {adopter?.currentPetsDetails || "Não informado"}</p>
                <p><strong>Onde o pet dormirá:</strong> {adopter?.sleepingPlace || "Não informado"}</p>
                <p><strong>Horas sozinho por dia:</strong> {adopter?.petAloneHoursPerDay || "Não informado"}</p>

                <p><strong>Motivo para adoção:</strong> {adopter?.reasonToAdopt || "Não informado"}</p>
                <p><strong>Comportamento esperado:</strong> {adopter?.expectedPetBehavior || "Não informado"}</p>
                <p><strong>Como lida com comportamento ruim:</strong> {adopter?.howHandleUndesiredBehavior || "Não informado"}</p>
                <p><strong>Treinar o pet:</strong> {adopter?.willingToTrain === true ? "Sim" : "Não"}</p>
                <p><strong>Vacinar regularmente:</strong> {adopter?.keepVaccinesUpToDate === true ? "Sim" : "Não"}</p>
                <p><strong>Veterinário com frequência:</strong> {adopter?.regularVetVisits === true ? "Sim" : "Não"}</p>
                <p><strong>Compromisso de não abandonar:</strong> {adopter?.commitToNeverAbandon === true ? "Sim" : "Não"}</p>
                <p><strong>Devolveria à ONG?</strong> {adopter?.returnToOng === true ? "Sim" : "Não"}</p>
                <p><strong>Possui alergia:</strong> {adopter?.allergy === true ? "Sim" : "Não"}</p>

                <p><strong>Ciente da lei:</strong> {adopter?.awareOfLaw === true ? "Sim" : "Não"}</p>
                <p><strong>Ciente das responsabilidades:</strong> {adopter?.awareOfResponsibilities === true ? "Sim" : "Não"}</p>
                <p><strong>Família concorda:</strong> {adopter?.familyAgreement === true ? "Sim" : "Não"}</p>
                <p><strong>Concorda com declaração final:</strong> {adopter?.finalDeclarationAgreement === true ? "Sim" : "Não"}</p>
                <p><strong>Tem condições financeiras:</strong> {adopter?.financialConditions === true ? "Sim" : "Não"}</p>
                {adopter?.environmentImages && adopter.environmentImages.length > 0 && (
                  <ButtonType onClick={() => openImageModal(0)} className="show-images-btn" style={{marginTop: 16}}>
                    Ver fotos do ambiente
                  </ButtonType>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bloco de contato com o adotante aprovado */}
      {adoptionStatus === "approved" && adopter && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          margin: "32px 0"
        }}>
          <span style={{
            fontWeight: "bold",
            color: "#4CAF50",
            fontSize: "1.2rem",
            marginBottom: "8px"
          }}>
            Entre em contato com o adotante aprovado:
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            <ButtonType
              as="a"
              href={`https://wa.me/${formatPhoneToWhatsapp(adopter.phone)}`}
              target="_blank"
              bgColor="#25D366"
              color="#fff"
              style={{ minWidth: 140 }}
              icon={<WhatsappLogo size={22} weight="fill" />}
            >
              WhatsApp
            </ButtonType>
            <ButtonType
              as="a"
              href={`mailto:${adopter.email}`}
              bgColor="#D14D72"
              color="#fff"
              style={{ minWidth: 140 }}
              icon={<EnvelopeSimple size={22} weight="fill" />}
            >
              E-mail
            </ButtonType>
          </div>
        </div>
      )}
      {/* Bloco de alteração de status */}
      {userType === "Ong" && adoptionStatus && (
        <div className="adoption-actions" style={{ margin: "32px 0", display: "flex", gap: 16 }}>
          {adoptionStatus === "requestReceived" && (
            <>
              <button
                className="accept-btn"
                onClick={handleAccept}
                disabled={loading}
                style={{
                  background: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                Aceitar Solicitação
              </button>
              <button
                className="reject-btn"
                onClick={handleReject}
                disabled={loading}
                style={{
                  background: "#ff4d4d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                Recusar Solicitação
              </button>
            </>
          )}
          {adoptionStatus !== "requestReceived" && adoptionStatus !== "canceled" && adoptionStatus !== "rejected" && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const newStatus = e.target.status.value;
                
                // Atualizar status da adoção
                const adoptionRes = await fetch(`${API_URL}/adoptions/update/${adoptionId}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({ status: newStatus })
                });
                if (!adoptionRes.ok) throw new Error("Erro ao atualizar status da adoção.");

                // Se o status for "canceled", atualizar o pet para "Disponível"
                if (newStatus === "canceled") {
                  const petRes = await fetch(`${API_URL}/pets/update/${pet._id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ 
                      status: "Disponível",
                      name: pet.name,
                      type: pet.type,
                      coat: pet.coat,
                      state: pet.state,
                      city: pet.city,
                      description: pet.description,
                      gender: pet.gender,
                      age: pet.age,
                      breed: pet.breed,
                      size: pet.size,
                      health: {
                        vaccinated: pet.health.vaccinated,
                        castrated: pet.health.castrated,
                        dewormed: pet.health.dewormed,
                        specialCondition: pet.health.specialCondition
                      },
                      waitingTime: pet.waitingTime,
                      ongId: pet.ongId,
                      image: pet.image
                    })
                  });
                  if (!petRes.ok) throw new Error("Erro ao atualizar status do pet.");
                }

                await Swal.fire({
                  title: "Status atualizado!",
                  icon: "success",
                  confirmButtonColor: "#4caf50",
                  background: "#fff",
                  color: "#333",
                });
                setAdoptionStatus(newStatus);
              } catch (err) {
                Swal.fire({
                  title: "Erro",
                  text: err.message || "Erro ao atualizar status.",
                  icon: "error",
                  confirmButtonColor: "#ff4d4d",
                  background: "#fff",
                  color: "#333",
                });
              }
              setLoading(false);
            }}>
              <label htmlFor="status">Alterar status da adoção:</label>
              <select name="status" defaultValue={adoptionStatus} style={{ margin: "0 12px", padding: 8, borderRadius: 6 }}>
                <option value="completed">Concluída</option>
                <option value="canceled">Cancelada</option>
              </select>
              <button type="submit" className="accept-btn" disabled={loading} style={{ marginLeft: 8 }}>
                Salvar
              </button>
            </form>
          )}
        </div>
      )}
      {/* Modal de galeria de imagens do adotante */}
      {showImages && adopter?.environmentImages && (
        <div className="image-modal-overlay" onClick={() => setShowImages(false)}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowImages(false)}>×</button>
            <div className="image-modal-main">
              <button className="nav-btn prev-btn" onClick={e => {e.stopPropagation(); setCurrentImageIndex(i => i === 0 ? adopter.environmentImages.length - 1 : i - 1); setZoomLevel(1); setZoomPosition({x:0,y:0});}}>❮</button>
              <div
                className="image-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={getImageUrl(adopter.environmentImages[currentImageIndex])}
                  alt={`Ambiente ${currentImageIndex + 1}`}
                  className="modal-image"
                  onClick={handleImageClick}
                  style={{
                    transform: `scale(${zoomLevel}) translate(${zoomPosition.x / zoomLevel}px, ${zoomPosition.y / zoomLevel}px)`,
                    cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                    transition: isDragging ? "none" : "transform 0.3s ease-out",
                  }}
                />
              </div>
              <button className="nav-btn next-btn" onClick={e => {e.stopPropagation(); setCurrentImageIndex(i => i === adopter.environmentImages.length - 1 ? 0 : i + 1); setZoomLevel(1); setZoomPosition({x:0,y:0});}}>❯</button>
            </div>
            <div className="image-modal-thumbnails">
              {adopter.environmentImages.map((image, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={e => {e.stopPropagation(); setCurrentImageIndex(idx); setZoomLevel(1); setZoomPosition({x:0,y:0});}}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
