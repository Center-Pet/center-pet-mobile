"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiErrorCircle } from "react-icons/bi";
import { API_URL } from "../../config/api.js";
import Swal from "sweetalert2";
import ImageUploadGrid from "../../components/Molecules/ImageUploadGrid/ImageUploadGrid";
import OngCard from "../../components/Molecules/OngCard/OngCard";
import useAuth from "../../hooks/useAuth";
import {
  Dog,
  IdentificationCard,
  TextAlignLeft,
  GenderMale,
  CalendarBlank,
  PawPrint,
  Ruler,
  Scissors,
  Syringe,
  ShieldCheck,
  MapPin,
  Heartbeat,
  Clock,
} from "phosphor-react";
import "./EditPet.css";

// Arrays de raças e condições especiais (importados de RegisterPet)
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
  "Yorkshire Terrier"
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
  "Turkish Van"
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

export default function EditPet() {
  const { petId } = useParams(); // Obter o ID do pet da URL
  const navigate = useNavigate();
  const { token } = useAuth(); // Obtém apenas o token que será usado na requisição

  const [petImages, setPetImages] = useState([]);
  const [ongData, setOngData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para cidades e estados
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formErrors, setFormErrors] = useState({});

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
    status: "", 
  });

  const [showConditionsDropdown, setShowConditionsDropdown] = useState(false);

  // Carregar estados do Brasil ao montar o componente
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Erro ao carregar estados:", err));
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

        // Extrair apenas o número do campo waitingTime, removendo qualquer texto
        let waitingTimeValue = "";
        if (data.waitingTime) {
          // Extrai apenas os números
          const numericPart = data.waitingTime.toString().match(/\d+/);
          waitingTimeValue = numericPart ? numericPart[0] : "";
        }

        // Verificar se os campos city e state existem diretamente no objeto
        let state = data.state || "";
        let city = data.city || "";

        console.log("Cidade e estado do pet:", { city, state });

        // Preencher o estado com os dados recebidos
        setPetInfo({
          name: data.name || "",
          type: data.type || "",
          coat: data.coat || "",
          state: state,
          city: city,
          bio: data.bio || "",
          gender: data.gender || "",
          age: data.age || "",
          breed: data.breed || "",
          size: data.size || "",
          vaccinated: data.health?.vaccinated ? "Sim" : "Não",
          castrated: data.health?.castrated ? "Sim" : "Não",
          dewormed: data.health?.dewormed ? "Sim" : "Não",
          specialConditions: data.health?.specialCondition ? 
            (Array.isArray(data.health.specialCondition) ? 
             data.health.specialCondition : 
             data.health.specialCondition.split(", ").filter(condition => condition.trim() !== "")) : 
            ["Nenhuma"],
          waitingTime: waitingTimeValue,
          status: data.status || "Disponível", // Carregando o status do pet
        });

        // Definir imagens do pet
        setPetImages(data.image || []);

        // Carregar cidades se o estado for selecionado
        if (state) {
          try {
            const stateObj = states.find(
              (s) => s.sigla === state || s.nome === state
            );
            if (stateObj) {
              const res = await fetch(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateObj.sigla}/municipios`
              );
              const citiesData = await res.json();
              setCities(citiesData.map((city) => city.nome));
            }
          } catch (err) {
            console.error("Erro ao carregar cidades:", err);
          }
        }

        // Buscar dados da ONG
        if (data.ongId) {
          try {
            const ongResponse = await fetch(
              `${API_URL}/ongs/${data.ongId}`
            );

            if (ongResponse.ok) {
              const ongResponseData = await ongResponse.json();
              if (ongResponseData.success && ongResponseData.data) {
                setOngData(ongResponseData.data);
              }
            }
          } catch (err) {
            console.error("Erro ao buscar dados da ONG:", err);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar pet:", err);
        setError(err.message);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível carregar os dados do pet para edição.",
          icon: "error",
          confirmButtonColor: "#FF8BA7",
        });
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetData();
    }
  }, [petId, states]);

  const handleImageAdd = (newImage) => {
    if (petImages.length < 6) {
      setPetImages([...petImages, newImage]);
      // Remove o erro de imagens se existir
      if (formErrors.images) {
        setFormErrors((prev) => ({
          ...prev,
          images: undefined,
        }));
      }
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    setPetImages((currentImages) =>
      currentImages.filter((_, index) => index !== indexToDelete)
    );
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limitar descrição a 500 caracteres
    if (name === "bio" && value.length > 500) {
      return;
    }

    if (name === "type") {
      setPetInfo((prev) => ({
        ...prev,
        [name]: value,
        breed: "", // Resetar a raça quando mudar o tipo
      }));
    } else {
      setPetInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpar erro do campo quando for preenchido
    if (value.trim() !== "") {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "centerpet_default");
    data.append("cloud_name", "dx8zzla5s");

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
      return result.secure_url;
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const errors = {};

    // Campos obrigatórios
    const requiredFields = [
      "name",
      "type",
      "age",
      "gender",
      "size",
      "coat",
      "bio",
      "status", // Adicionado o status como campo obrigatório
    ];
    requiredFields.forEach((field) => {
      if (!petInfo[field] || petInfo[field].trim() === "") {
        errors[field] = `Este campo é obrigatório`;
      }
    });

    // Validação de condições especiais
    const conditions = petInfo.specialConditions || [];
    const realConditions = conditions.filter(condition => condition !== "Nenhuma");
    if (realConditions.length === 0 && !conditions.includes("Nenhuma")) {
      errors.specialConditions = "Selecione pelo menos uma condição";
    }

    // Validação de localização
    if (!petInfo.state || !petInfo.city) {
      errors.state = "Localização é obrigatória";
      errors.city = "Localização é obrigatória";
    }

    // Validação de campos booleanos
    ["vaccinated", "castrated", "dewormed"].forEach((field) => {
      if (petInfo[field] === "") {
        errors[field] = "Selecione uma opção";
      }
    });

    return errors;
  };

  // Função de salvar com melhorias
  const handleSave = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = document.querySelector(".error-message");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Modal de confirmação
    Swal.fire({
      title: "Confirmar alterações",
      text: "Tem certeza que todos os dados estão corretos?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF8BA7",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, salvar alterações",
      cancelButtonText: "Revisar dados",
      showCloseButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsSubmitting(true);

          // Mostrar loading
          Swal.fire({
            title: "Salvando alterações...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Separar URLs existentes e novos arquivos de imagem
          const existingImageUrls = petImages.filter(
            (img) => typeof img === "string"
          );
          const newImageFiles = petImages.filter((img) => img instanceof File);

          let allImageUrls = [...existingImageUrls];

          // Se houver novas imagens, fazer upload para o Cloudinary
          if (newImageFiles.length > 0) {
            Swal.fire({
              title: "Enviando imagens...",
              text: "Isso pode levar alguns instantes",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });

            try {
              const cloudinaryUrls = [];
              for (const imageFile of newImageFiles) {
                const imageUrl = await uploadImageToCloudinary(imageFile);
                cloudinaryUrls.push(imageUrl);
              }
              allImageUrls = [...allImageUrls, ...cloudinaryUrls];
            } catch (uploadError) {
              console.error("Erro ao fazer upload de imagens:", uploadError);
              throw new Error(
                "Falha ao processar as novas imagens. Tente novamente."
              );
            }
          }

          // Preparar dados para atualização
          const conditionsToSend = petInfo.specialConditions.filter(condition => 
            condition !== "Nenhuma" || petInfo.specialConditions.length === 1
          );
          
          const updatedPetInfo = {
            name: petInfo.name,
            type: petInfo.type,
            coat: petInfo.coat,
            city: petInfo.city,
            state: petInfo.state,
            bio: petInfo.bio,
            gender: petInfo.gender,
            age: petInfo.age,
            breed: petInfo.breed,
            size: petInfo.size,
            health: {
              vaccinated: petInfo.vaccinated === "Sim",
              castrated: petInfo.castrated === "Sim",
              dewormed: petInfo.dewormed === "Sim",
              specialCondition: conditionsToSend, // Envia o array diretamente
            },
            waitingTime: petInfo.waitingTime,
            status: petInfo.status,
            image: allImageUrls,
          };

          // Enviar para a API
          console.log("Enviando dados do pet para a API:", updatedPetInfo);
          // Adicionar antes do fetch para verificar o valor do status
          console.log("Status do pet a ser enviado:", petInfo.status);
          const response = await fetch(
            `${API_URL}/pets/update/${petId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updatedPetInfo),
            }
          );

          const responseText = await response.text();
          console.log("Resposta da API (texto):", responseText);

          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error("Erro ao converter resposta para JSON:", e);
          }

          if (!response.ok) {
            throw new Error(
              responseData?.message ||
                `Erro ao atualizar pet (${response.status}): ${responseText}`
            );
          }

          // Mostrar sucesso
          Swal.fire({
            title: "Sucesso!",
            text: "As alterações foram salvas com sucesso.",
            icon: "success",
            confirmButtonColor: "#FF8BA7",
          }).then(() => {
            // Voltar para a página do pet
            navigate(`/pet-info/${petId}`);
          });
        } catch (error) {
          console.error("Erro ao salvar alterações:", error);
          Swal.fire({
            title: "Erro",
            text:
              error.message ||
              "Não foi possível salvar as alterações. Por favor, tente novamente.",
            icon: "error",
            confirmButtonColor: "#FF8BA7",
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Todas as alterações feitas serão perdidas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF8BA7",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Continuar editando",
      showCloseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/pet-info/${petId}`);
      }
    });
  };

  const ErrorMessage = ({ message }) => (
    <div className="error-message">
      <BiErrorCircle className="error-icon" />
      <span>{message}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="edit-pet-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pet-info-container">
        <div className="error-container">
          <p>Erro ao carregar informações: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-info-container">
      <div className="pet-profile-card">
        <div className="pet-main-info">
          <div className="pet-image-container">
            <ImageUploadGrid
              images={petImages}
              onImageAdd={handleImageAdd}
              onImageDelete={handleDeleteImage}
              maxImages={6}
              mainImage={true}
            />
            {formErrors.images && <ErrorMessage message={formErrors.images} />}

            <OngCard
              imageUrl={
                ongData?.profileImg || "https://i.imgur.com/B2BFUeU.png"
              }
              ongName={ongData?.name || "ONG"}
              ongId={ongData?._id}
            />
          </div>

          <div className="pet-details">
            <h2>Editar Pet</h2>
            <div className="info-row">
              <label className="info-label">
                <IdentificationCard size={20} style={{ marginRight: 6 }} />
                Nome do Pet:
              </label>
              <input
                type="text"
                name="name"
                value={petInfo.name}
                onChange={handleInputChange}
                placeholder="Nome do pet"
                className={`input-field ${formErrors.name ? "error" : ""}`}
              />
              {formErrors.name && <ErrorMessage message={formErrors.name} />}
            </div>            <div className="info-row">
              <label className="info-label">
                <TextAlignLeft size={20} style={{ marginRight: 6 }} />
                Biografia:
              </label>
              <textarea
                name="bio"
                value={petInfo.bio}
                onChange={handleInputChange}
                placeholder="Conte um pouco sobre o pet..."
                maxLength={500}
                className={`input-field bio-field ${
                  formErrors.bio ? "error" : ""
                }`}
              />
              <div className="character-counter">
                {petInfo.bio ? petInfo.bio.length : 0}/500 caracteres
              </div>
              {formErrors.bio && (
                <ErrorMessage message={formErrors.bio} />
              )}
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
                  <option value="Outro">Outro</option>
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
                  disabled={!petInfo.type || petInfo.type === "Outro"}
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
                {petInfo.type === "Outro" && (
                  <input
                    type="text"
                    name="breed"
                    value={petInfo.breed}
                    onChange={handleInputChange}
                    placeholder="Digite a raça"
                    className={`input-field ${formErrors.breed ? "error" : ""}`}
                  />
                )}
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
                  <Clock size={20} style={{ marginRight: 6 }} />
                  Tempo de Espera:
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="number"
                    name="waitingTime"
                    value={petInfo.waitingTime}
                    onChange={handleInputChange}
                    placeholder="Ex: 3"
                    min="0"
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
                  <Clock size={20} style={{ marginRight: 6 }} />
                  Status:
                </label>
                <select
                  name="status"
                  value={petInfo.status}
                  onChange={handleInputChange}
                  className={`input-field ${
                    formErrors.status ? "error" : ""
                  }`}
                >
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
                onClick={handleSave}
                className="adopt-button"
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>

              <button
                onClick={handleCancel}
                className="adopt-button cancel-button"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
