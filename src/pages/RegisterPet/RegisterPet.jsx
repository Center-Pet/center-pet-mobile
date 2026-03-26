"use client";
import { useState, useEffect } from "react";
import { BiErrorCircle } from "react-icons/bi";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ImageUploadGrid from "../../components/Molecules/ImageUploadGrid/ImageUploadGrid";
import OngCard from "../../components/Molecules/OngCard/OngCard";
import {
  Dog,
  Cat,
  IdentificationCard,
  TextAlignLeft,
  GenderMale,
  GenderFemale,
  CalendarBlank,
  PawPrint,
  Ruler,
  Scissors,
  Syringe,
  ShieldCheck,
  MapPin,
  Heartbeat,
  Clock,
  ChartPie,
} from "phosphor-react";
import "./RegisterPet.css";
import { API_URL } from "../../config/api";

const dogBreeds = [
  "Sem Raça Definida (SRD)",
  "Akita",
  "Basset Hound",
  "Beagle",
  "Bernese Mountain Dog",
  "Bichon Frisé",
  "Border Collie",
  "Boxer",
  "Bulldog Francês",
  "Bulldog Inglês",
  "Bull Terrier",
  "Cane Corso",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Cocker Spaniel",
  "Dachshund",
  "Dálmata",
  "Doberman",
  "Golden Retriever",
  "Husky Siberiano",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Lhasa Apso",
  "Maltês",
  "Pastor Alemão",
  "Pastor Australiano",
  "Pequinês",
  "Pinscher",
  "Pit Bull",
  "Poodle",
  "Pug",
  "Rottweiler",
  "São Bernardo",
  "Schnauzer",
  "Shar Pei",
  "Shih Tzu",
  "Spitz Alemão",
  "Weimaraner",
  "Yorkshire Terrier",
];

const catBreeds = [
  "Sem Raça Definida (SRD)",
  "Abissínio",
  "American Shorthair",
  "Angorá",
  "Balinês",
  "Bengal",
  "Birmanês",
  "Bombaim",
  "British Shorthair",
  "Burmês",
  "Chartreux",
  "Cornish Rex",
  "Devon Rex",
  "Exótico",
  "Himalaio",
  "Maine Coon",
  "Mau Egípcio",
  "Munchkin",
  "Norueguês da Floresta",
  "Oriental",
  "Persa",
  "Ragdoll",
  "Sagrado da Birmânia",
  "Savannah",
  "Scottish Fold",
  "Siamês",
  "Siberiano",
  "Singapura",
  "Somali",
  "Sphynx",
  "Turkish Van",
];

const specialConditions = [
  "Nenhuma",
  "Cego",
  "Surdo",
  "Amputado",
  "Deficiência Motora",
  "Doença Renal",
  "Doença Cardíaca",
  "Diabetes",
  "Epilepsia",
  "Alergia Alimentar",
  "Alergia de Pele",
  "Leishmaniose",
  "Cinomose",
  "Parvovirose",
  "FIV (Imunodeficiência Felina)",
  "FeLV (Leucemia Felina)",
  "Obesidade",
  "Idoso",
  "Outro",
];

export default function RegisterPet() {
  const { user } = useAuth(); // Obtenha o usuário autenticado
  const navigate = useNavigate();
  const [petImageFiles, setPetImageFiles] = useState([]); // Armazena os arquivos reais das imagens
  const [petImagePreviews, setPetImagePreviews] = useState([]); // Armazena as URLs de preview
  const [petInfo, setPetInfo] = useState({
    name: "",
    type: "",
    coat: "",
    state: "",
    city: "",
    bio: "",
    gender: "",
    age: "",
    breed: "",
    size: "",
    vaccinated: "",
    castrated: "",
    dewormed: "",
    specialConditions: ["Nenhuma"],
    waitingTime: "",
    status: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adicione um novo estado para armazenar os detalhes da ONG
  const [ongDetails, setOngDetails] = useState({
    name: "",
    profileImage: "",
  });

  // Ajuste o useEffect que busca os detalhes da ONG
  useEffect(() => {
    const fetchOngDetails = async () => {
      if (user && user._id) {
        try {
          console.log("Buscando dados da ONG:", user._id);

          const url = `${API_URL}/ongs/${user._id}`;
          console.log("URL da requisição:", url);

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch ONG details: ${response.status}`);
          }

          const responseData = await response.json();
          console.log("ONG details fetched:", responseData);

          // A resposta tem um formato { success: true, data: {...} }
          // onde os dados da ONG estão dentro do objeto data
          const data = responseData.data;

          // O campo correto é profileImg, não profileImage
          const imgUrl = data?.profileImg;
          const ongName = data?.name;

          console.log("URL da imagem encontrada:", imgUrl);
          console.log("Nome da ONG encontrado:", ongName);

          const placeholderImage =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABLSURBVHhe7cExAQAAAMKg9U9tDQ8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AUJsAAHAchrDAAAAAElFTkSuQmCC";

          setOngDetails({
            name: ongName || user.name || "ONG",
            profileImage: imgUrl || placeholderImage,
          });

          console.log("ongDetails após atualização:", {
            name: ongName || user.name || "ONG",
            profileImage: imgUrl || placeholderImage,
          });
        } catch (error) {
          console.error("Error fetching ONG details:", error);

          // Em caso de falha na API, use os dados do objeto user como fallback
          const placeholderImage =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABLSURBVHhe7cExAQAAAMKg9U9tDQ8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AUJsAAHAchrDAAAAAElFTkSuQmCC";

          setOngDetails({
            name: user.name || "ONG",
            profileImage: user.profileImg || placeholderImage,
          });
        }
      }
    };

    fetchOngDetails();
  }, [user]);

  const handleImageAdd = (newImageFile) => {
    // Adicionar o arquivo ao array de arquivos
    setPetImageFiles([...petImageFiles, newImageFile]);

    // Criar URL de preview para mostrar ao usuário
    const previewUrl = URL.createObjectURL(newImageFile);
    setPetImagePreviews([...petImagePreviews, previewUrl]);

    if (formErrors.images) {
      setFormErrors((prev) => ({
        ...prev,
        images: undefined,
      }));
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    setPetImageFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToDelete)
    );

    setPetImagePreviews((currentPreviews) => {
      // Revoga a URL para evitar vazamento de memória
      URL.revokeObjectURL(currentPreviews[indexToDelete]);
      return currentPreviews.filter((_, index) => index !== indexToDelete);
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Limitar biografia a 500 caracteres
    if (name === "bio" && value.length > 500) {
      return;
    }

    if (name === "type") {
      setPetInfo((prev) => ({
        ...prev,
        [name]: value,
        breed: "",
      }));
    } else {
      setPetInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (value.trim() !== "") {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const ErrorMessage = ({ message }) => (
    <div className="error-message">
      <BiErrorCircle className="error-icon" />
      <span>{message}</span>
    </div>
  );

  const validateForm = () => {
    const errors = {};

    if (petImageFiles.length === 0) {
      errors.images = "Adicione pelo menos uma foto do pet";
    }

    Object.keys(petInfo).forEach((key) => {
      if (key === "specialConditions") {
        // Validação específica para condições especiais
        const conditions = petInfo[key] || [];
        const realConditions = conditions.filter(condition => condition !== "Nenhuma");
        if (realConditions.length === 0 && !conditions.includes("Nenhuma")) {
          errors[key] = "Selecione pelo menos uma condição";
        }
      } else if (!petInfo[key] || petInfo[key] === "") {
        errors[key] = "Este campo é obrigatório";
      }
    });

    if (petInfo.dewormed === "") {
      errors.dewormed = "Selecione uma opção";
    }

    if (petInfo.vaccinated === "") {
      errors.vaccinated = "Selecione uma opção";
    }

    if (petInfo.castrated === "") {
      errors.castrated = "Selecione uma opção";
    }

    return errors;
  };

  // Adicione a função de upload para o Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "centerpet_default"); // mesmo upload preset da ONG
    data.append("cloud_name", "dx8zzla5s"); // mesmo cloud name da ONG

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dx8zzla5s/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();
      console.log("Resposta do Cloudinary:", result);

      if (!response.ok) {
        throw new Error(
          result.error ? result.error.message : "Erro ao fazer upload da imagem"
        );
      }
      console.log("URL da imagem gerada:", result.secure_url);
      return result.secure_url; // retorna a URL da imagem
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      throw error;
    }
  };

  // Modifique a função handleSubmit para usar o Cloudinary
  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      Swal.fire({
        title: "Confirmar registro",
        text: "Tem certeza que todos os dados estão corretos?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#FF8BA7",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, registrar pet",
        cancelButtonText: "Revisar dados",
        showCloseButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsSubmitting(true);

            // Mostrar loading de uploads
            Swal.fire({
              title: "Enviando imagens...",
              text: "Isso pode levar alguns instantes",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });

            // Upload das imagens para o Cloudinary
            const cloudinaryUrls = [];
            for (const imageFile of petImageFiles) {
              const imageUrl = await uploadImageToCloudinary(imageFile);
              cloudinaryUrls.push(imageUrl);
            }

            // Preparar dados para envio
            const conditionsToSend = petInfo.specialConditions.filter(condition => 
              condition !== "Nenhuma" || petInfo.specialConditions.length === 1
            );
            
            const petData = {
              ...petInfo,
              ongId: user._id, // ID da ONG logada
              imagens: cloudinaryUrls, // Array de URLs do Cloudinary
              status: petInfo.status || "Disponível",  // Garante que o status seja enviado explicitamente
              specialCondition: conditionsToSend // Envia o array diretamente
            };

            Swal.fire({
              title: "Registrando pet...",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });

            // Enviar dados para a API
            const response = await fetch(
              `${API_URL}/pets/register`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(petData),
              }
            );

            // Verificar se a requisição foi bem-sucedida
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Erro ao registrar pet");
            }

            const data = await response.json();
            console.log("Pet registrado:", data);

            Swal.fire({
              title: "Sucesso!",
              text: "Pet registrado com sucesso.",
              icon: "success",
              confirmButtonColor: "#FF8BA7",
            }).then(() => {
              // Redirecionar para o perfil da ONG após o registro bem-sucedido
              navigate(`/ong-profile/${user._id}`);
            });
          } catch (error) {
            console.error("Erro ao registrar pet:", error);

            Swal.fire({
              title: "Erro",
              text:
                error.message ||
                "Não foi possível registrar o pet. Por favor, tente novamente.",
              icon: "error",
              confirmButtonColor: "#FF8BA7",
            });
          } finally {
            setIsSubmitting(false);
          }
        }
      });
    } else {
      const firstErrorField = document.querySelector(".error-message");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Todos os dados preenchidos serão perdidos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF8BA7",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, cancelar ",
      cancelButtonText: "Continuar preenchendo",
      showCloseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Registro cancelado pelo usuário");
        window.history.back();
      }
    });
  };

  // Adicione este useEffect para debug
  useEffect(() => {
    if (user) {
      console.log("Objeto user:", user);
    }
  }, [user]);

  // Estados para cidades e estados
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showConditionsDropdown, setShowConditionsDropdown] = useState(false);

  useEffect(() => {
    // Carregar estados do Brasil ao montar o componente
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((res) => res.json())
      .then((data) => setStates(data));
  }, []);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showConditionsDropdown && !event.target.closest('.custom-multiselect')) {
        setShowConditionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConditionsDropdown]);

  // Garantir que sempre haja pelo menos uma condição selecionada
  useEffect(() => {
    if (!petInfo.specialConditions || petInfo.specialConditions.length === 0) {
      setPetInfo(prev => ({
        ...prev,
        specialConditions: ["Nenhuma"]
      }));
    }
  }, [petInfo.specialConditions]);

  return (
    <form onSubmit={handleSubmit} className="pet-info-container">
      <div className="pet-profile-card">
        <div className="pet-main-info">
          <div className="pet-image-container">
            <ImageUploadGrid
              images={petImagePreviews}
              onImageAdd={handleImageAdd}
              onImageDelete={handleDeleteImage}
              maxImages={6}
              mainImage={true}
            />
            {formErrors.images && <ErrorMessage message={formErrors.images} />}

            <OngCard
              imageUrl={ongDetails.profileImage}
              ongName={ongDetails.name}
              ongId={user?._id}
            />
          </div>

          <div className="pet-details">
            <h2>Registrar novo Pet</h2>
            <div className="info-row">
              <label className="info-label">
                <IdentificationCard size={20} style={{ marginRight: 6 }} />
                Nome do Pet:
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nome do Pet"
                value={petInfo.name}
                onChange={handleInputChange}
                className={`input-field ${formErrors.name ? "error" : ""}`}
              />
              {formErrors.name && <ErrorMessage message={formErrors.name} />}
            </div>

            <div className="info-row">
              <label className="info-label">
                <TextAlignLeft size={20} style={{ marginRight: 6 }} />
                Biografia:
              </label>{" "}
              <textarea
                name="bio"
                placeholder="Conte sobre a personalidade, rotina, preferências, histórico, necessidades especiais e curiosidades do pet."
                value={petInfo.bio}
                onChange={handleInputChange}
                maxLength={500}
                className={`input-field bio-field ${
                  formErrors.bio ? "error" : ""
                }`}
              />
              <div className="character-counter">
                {petInfo.bio ? petInfo.bio.length : 0}/500 caracteres
              </div>
              {formErrors.bio && <ErrorMessage message={formErrors.bio} />}
            </div>

            <div className="pet-info-grid two-columns">
              <div className="info-row">
                <label className="info-label">
                  <Dog size={20} style={{ marginRight: 6 }} />
                  Espécie:
                </label>
                <select
                  name="type"
                  value={petInfo.type}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.type ? "error" : ""}`}
                >
                  {!petInfo.type && <option value="">Selecione</option>}
                  <option value="Cachorro">Cachorro</option>
                  <option value="Gato">Gato</option>
                </select>
                {formErrors.type && <ErrorMessage message={formErrors.type} />}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <GenderMale size={20} style={{ marginRight: 6 }} />
                  Gênero:
                </label>
                <select
                  name="gender"
                  value={petInfo.gender}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.gender ? "error" : ""}`}
                >
                  {!petInfo.gender && <option value="">Selecione</option>}
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
                {formErrors.gender && (
                  <ErrorMessage message={formErrors.gender} />
                )}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <CalendarBlank size={20} style={{ marginRight: 6 }} />
                  Idade:
                </label>
                <select
                  name="age"
                  value={petInfo.age}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.age ? "error" : ""}`}
                >
                  {!petInfo.age && <option value="">Selecione</option>}
                  <option value="Filhote">Filhote</option>
                  <option value="Jovem">Jovem</option>
                  <option value="Adulto">Adulto</option>
                  <option value="Idoso">Idoso</option>
                </select>
                {formErrors.age && <ErrorMessage message={formErrors.age} />}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <PawPrint size={20} style={{ marginRight: 6 }} />
                  Raça:
                </label>
                <select
                  name="breed"
                  value={petInfo.breed}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.breed ? "error" : ""}`}
                  disabled={!petInfo.type}
                >
                  {!petInfo.breed && <option value="">Selecione</option>}
                  {(petInfo.type === "Cachorro"
                    ? dogBreeds
                    : petInfo.type === "Gato"
                    ? catBreeds
                    : []
                  ).map((breed, idx) => (
                    <option key={idx} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
                {formErrors.breed && (
                  <ErrorMessage message={formErrors.breed} />
                )}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <Ruler size={20} style={{ marginRight: 6 }} />
                  Porte:
                </label>
                <select
                  name="size"
                  value={petInfo.size}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.size ? "error" : ""}`}
                >
                  {!petInfo.size && <option value="">Selecione</option>}
                  <option value="Pequeno">Pequeno</option>
                  <option value="Médio">Médio</option>
                  <option value="Grande">Grande</option>
                </select>
                {formErrors.size && <ErrorMessage message={formErrors.size} />}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <Scissors size={20} style={{ marginRight: 6 }} />
                  Pelagem:
                </label>
                <select
                  name="coat"
                  value={petInfo.coat}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.coat ? "error" : ""}`}
                >
                  {!petInfo.coat && <option value="">Selecione</option>}
                  <option value="Curta">Curta</option>
                  <option value="Média">Média</option>
                  <option value="Longa">Longa</option>
                </select>
                {formErrors.coat && <ErrorMessage message={formErrors.coat} />}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <Syringe size={20} style={{ marginRight: 6 }} />
                  Vacinado:
                </label>
                <select
                  name="vaccinated"
                  value={petInfo.vaccinated}
                  onChange={handleInputChange}
                  className={`input-field ${
                    formErrors.vaccinated ? "error" : ""
                  }`}
                >
                  {!petInfo.vaccinated && <option value="">Selecione</option>}
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                {formErrors.vaccinated && (
                  <ErrorMessage message={formErrors.vaccinated} />
                )}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <ShieldCheck size={20} style={{ marginRight: 6 }} />
                  Castrado:
                </label>
                <select
                  name="castrated"
                  value={petInfo.castrated}
                  onChange={handleInputChange}
                  className={`input-field ${
                    formErrors.castrated ? "error" : ""
                  }`}
                >
                  {!petInfo.castrated && <option value="">Selecione</option>}
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                {formErrors.castrated && (
                  <ErrorMessage message={formErrors.castrated} />
                )}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <ShieldCheck size={20} style={{ marginRight: 6 }} />
                  Vermifugado:
                </label>
                <select
                  name="dewormed"
                  value={petInfo.dewormed}
                  onChange={handleInputChange}
                  className={`input-field ${
                    formErrors.dewormed ? "error" : ""
                  }`}
                >
                  {!petInfo.dewormed && <option value="">Selecione</option>}
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                {formErrors.dewormed && (
                  <ErrorMessage message={formErrors.dewormed} />
                )}
              </div>

              <div className="info-row">
                <label className="info-label">
                  <Heartbeat size={20} style={{ marginRight: 6 }} />
                  Condições Especiais:
                </label>
                <div className="custom-multiselect">
                  <div 
                    className={`input-field multiselect-trigger ${formErrors.specialConditions ? "error" : ""}`}
                    onClick={() => setShowConditionsDropdown(!showConditionsDropdown)}
                  >
                    {petInfo.specialConditions.length === 0 ? "Selecione as condições" : 
                     petInfo.specialConditions.length === 1 ? petInfo.specialConditions[0] :
                     `${petInfo.specialConditions.length} condições selecionadas`}
                  </div>
                  {showConditionsDropdown && (
                    <div className="multiselect-dropdown">
                      {specialConditions.map((condition, idx) => (
                        <label key={idx} className="multiselect-option">
                          <input
                            type="checkbox"
                            value={condition}
                            checked={petInfo.specialConditions.includes(condition)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const conditionValue = e.target.value;
                              
                              if (conditionValue === "Nenhuma") {
                                // Se "Nenhuma" foi selecionada, limpa todas as outras condições
                                if (isChecked) {
                                  setPetInfo(prev => ({
                                    ...prev,
                                    specialConditions: ["Nenhuma"]
                                  }));
                                } else {
                                  // Se "Nenhuma" foi desselecionada, não permite (sempre deve ter pelo menos uma)
                                  setPetInfo(prev => ({
                                    ...prev,
                                    specialConditions: ["Nenhuma"]
                                  }));
                                }
                              } else {
                                // Para outras condições
                                if (isChecked) {
                                  // Adiciona a condição e remove "Nenhuma"
                                  setPetInfo(prev => ({
                                    ...prev,
                                    specialConditions: prev.specialConditions
                                      .filter(c => c !== "Nenhuma")
                                      .concat(conditionValue)
                                  }));
                                } else {
                                  // Remove a condição
                                  const newConditions = petInfo.specialConditions.filter(c => c !== conditionValue);
                                  
                                  // Se não sobrou nenhuma condição, adiciona "Nenhuma"
                                  if (newConditions.length === 0) {
                                    setPetInfo(prev => ({
                                      ...prev,
                                      specialConditions: ["Nenhuma"]
                                    }));
                                  } else {
                                    setPetInfo(prev => ({
                                      ...prev,
                                      specialConditions: newConditions
                                    }));
                                  }
                                }
                              }
                              
                              setFormErrors(prev => ({
                                ...prev,
                                specialConditions: undefined,
                              }));
                            }}
                          />
                          <span className="checkmark"></span>
                          <span className="option-text">{condition}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.specialConditions && (
                  <ErrorMessage message={formErrors.specialConditions} />
                )}
              </div>
              <div className="info-row">
                <label className="info-label">
                  <MapPin size={20} style={{ marginRight: 6 }} />
                  Estado:
                </label>
                <select
                  name="state"
                  value={petInfo.state || ""}
                  onChange={async (e) => {
                    handleInputChange(e);
                    // Buscar cidades ao selecionar o estado
                    const uf = e.target.value;
                    if (uf) {
                      try {
                        const res = await fetch(
                          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
                        );
                        const data = await res.json();
                        setCities(data.map((city) => city.nome));
                      } catch {
                        setCities([]);
                      }
                    } else {
                      setCities([]);
                    }
                    setPetInfo((prev) => ({ ...prev, city: "" }));
                  }}
                  className={`input-field ${formErrors.state ? "error" : ""}`}
                >
                  <option value="">Selecione o estado</option>
                  {states.map((uf) => (
                    <option key={uf.id} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  ))}
                </select>
                {formErrors.state && (
                  <ErrorMessage message={formErrors.state} />
                )}
              </div>
              <div className="info-row">
                <label className="info-label">
                  <MapPin size={20} style={{ marginRight: 6 }} />
                  Cidade:
                </label>
                <select
                  name="city"
                  value={petInfo.city || ""}
                  onChange={handleInputChange}
                  className={`input-field ${formErrors.city ? "error" : ""}`}
                  disabled={!petInfo.state}
                >
                  <option value="">Selecione a cidade</option>
                  {cities.map((city, idx) => (
                    <option key={idx} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {formErrors.city && <ErrorMessage message={formErrors.city} />}
              </div>
                <div className="info-row">
                  <label className="info-label">
                    <Clock size={20} style={{ marginRight: 6 }} />
                    Tempo de Espera:
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="number"
                      name="waitingTime"
                      placeholder="Ex: 2"
                      min={0}
                      value={petInfo.waitingTime}
                      onChange={handleInputChange}
                      className={`input-field ${
                        formErrors.waitingTime ? "error" : ""
                      }`}
                      style={{ marginRight: "8px" }}
                    />
                    <span>{parseInt(petInfo.waitingTime) === 1 ? "mês" : "meses"}</span>
                  </div>
                  {formErrors.waitingTime && (
                    <ErrorMessage message={formErrors.waitingTime} />
                  )}
                </div>
                <div className="info-row">
                  <label className="info-label">
                    <ChartPie size={20} style={{ marginRight: 6 }} />
                    Status:
                  </label>
                  <select
                    name="status"
                    value={petInfo.status}
                    onChange={handleInputChange}
                    className={`input-field ${formErrors.status ? "error" : ""}`}
                  >
                    {!petInfo.status && <option value="">Selecione</option>}
                    <option value="Disponível">Disponível</option>
                    <option value="Indisponível">Indisponível</option>
                    <option value="Adotado">Adotado</option>
                    <option value="Aguardando">Aguardando</option>
                  </select>
                  {formErrors.status && <ErrorMessage message={formErrors.status} />}
                </div>
            </div>
            <div className="action-buttons">
              <button
                type="submit"
                className="adopt-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrar Pet"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="adopt-button cancel-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
