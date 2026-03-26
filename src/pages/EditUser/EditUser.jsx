import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType";
import CustomInput from "../../components/Atoms/CustomInput/CustomInput";
import { API_URL } from "../../config/api.js";
import TitleType from "../../components/Atoms/TitleType/TitleType";
import ImageInputField from "../../components/Atoms/ImageInputField/ImageInputField";
import "./EditUser.css";

const EditUser = () => {
  const { adopterId } = useParams(); // Obtém o ID da URL, se disponível
  const { user, updateUserData } = useAuth(); // Obtém o usuário autenticado e a função para atualizar o contexto
  const navigate = useNavigate();
  const [adopterData, setAdopterData] = useState({
    fullName: "",
    description: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    profileImg: "",
    profession: "", // Novo campo para profissão
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [noNumber, setNoNumber] = useState(false);

  useEffect(() => {
    const fetchAdopterData = async () => {
      try {
        const idToFetch = adopterId || user?._id; // Usa o ID da URL ou o ID do usuário autenticado
        if (!idToFetch) {
          setError("ID do adotante não encontrado.");
          setLoading(false);
          return;
        }

        console.log("Buscando dados do adotante com ID:", idToFetch);

        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/adopters/${idToFetch}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar dados do adotante (${response.status})`
          );
        }

        const data = await response.json();
        console.log("Dados do adotante recebidos:", data);        setAdopterData({
          fullName: data.fullName || "",
          description: data.description || "",
          phone: data.phone || "",
          cep: data.cep || "",
          street: data.street || "",
          number: data.number || "",
          neighborhood: data.neighborhood || "",
          complement: data.complement || "",
          city: data.city || "",
          state: data.state || "",
          profileImg: data.profileImg || "",
          profession: data.profession || "", // Inclua o campo profissão
        });
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar os dados do adotante:", error);
        setError("Não foi possível carregar os dados do adotante.");
        setLoading(false);
      }
    };

    fetchAdopterData();
  }, [adopterId, user]);

  if (loading) {
    return (
      <div id="edit_user">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setAdopterData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };
  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "centerpet_default");
    data.append("cloud_name", "dx8zzla5s");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dx8zzla5s/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.error?.message || "Erro ao fazer upload da imagem"
      );
    }
    return result.secure_url;
  };

  // Função para buscar endereço pelo CEP
  const buscarEnderecoPorCep = async (cep) => {
    // Remover caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    setLoadingCep(true);
    try {
      // Usar o serviço ViaCEP para buscar o endereço
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data = await response.json();

      // Verificar se o CEP existe e não tem erro
      if (!data.erro) {        // Atualizar os campos de endereço com os dados retornados
        setAdopterData(prevData => ({
          ...prevData,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          cep: cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2") // Formata o CEP
        }));
      } else {
        Swal.fire({
          title: "CEP Inválido",
          text: "O CEP informado não existe. Por favor, verifique e tente novamente.",
          icon: "error",
          confirmButtonColor: "#D14D72",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      Swal.fire({
        title: "Erro",
        text: "Ocorreu um erro ao buscar o CEP. Por favor, tente novamente mais tarde.",
        icon: "error",
        confirmButtonColor: "#D14D72",
      });
    } finally {
      setLoadingCep(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Confirmar alterações",
      text: "Tem certeza que deseja salvar as alterações no perfil?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#D14D72",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, salvar alterações",
      cancelButtonText: "Revisar dados",
      showCloseButton: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        Swal.fire({
          title: "Salvando alterações...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const token = localStorage.getItem("token");
        const idToUpdate = adopterId || user?._id;
        let profileImgUrl = adopterData.profileImg;
        if (adopterData.profileImg instanceof File) {
          profileImgUrl = await uploadImageToCloudinary(adopterData.profileImg);
        }
        const updateData = {
          fullName: adopterData.fullName,
          description: adopterData.description,
          phone: adopterData.phone,
          cep: adopterData.cep,
          street: adopterData.street,
          number: adopterData.number,
          neighborhood: adopterData.neighborhood,
          complement: adopterData.complement,
          city: adopterData.city,
          state: adopterData.state,
          profession: adopterData.profession,
          profileImg: profileImgUrl,
        };
        const response = await fetch(
          `${API_URL}/adopters/editProfile/${idToUpdate}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(updateData),
          }
        );
        if (!response.ok) {
          throw new Error("Erro ao atualizar os dados do adotante.");
        }
        const updatedUser = await response.json();
        // Atualiza o contexto e localStorage com os dados atualizados
        updateUserData({
          ...user,
          ...updatedUser.data || updatedUser,
          profileImg: profileImgUrl // Garante que a nova URL da imagem seja incluída
        });
        Swal.fire({
          title: "Sucesso!",
          text: "Dados atualizados com sucesso.",
          icon: "success",
          confirmButtonColor: "#D14D72"
        }).then(() => {
          navigate(`/adopter-profile/${idToUpdate}`);
        });
      } catch (error) {
        console.error("Erro ao atualizar os dados do adotante:", error);
        Swal.fire({
          title: "Erro!",
          text: "Não foi possível atualizar os dados.",
          icon: "error",
          confirmButtonColor: "#D14D72"
        });
      }
    });
  };
  return (
    <div id="edit_user">
      <div id="edit-form-container">
        <form id="edit-form" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <TitleType type="h1" className="mb-4">
              Editar Perfil
            </TitleType>
          </div>
          
          <div id="user-img-profile">
            <h2>Sua foto de perfil</h2>
            <div className="image-input-container">
              <ImageInputField
                currentImage={adopterData.profileImg}
                onImageChange={(file) => handleInputChange("profileImg", file)}
                size={200}
              />
            </div>
          </div>          <label>Nome completo:</label>
          <CustomInput
            type="text"
            value={adopterData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            width="70rem"
            className="custom-input-responsive"
            required
          />

          <label>Telefone:</label>
          <CustomInput
            type="tel"
            value={adopterData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="(XX) XXXXX-XXXX"
            width="70rem"
            className="custom-input-responsive"
            required
          />

          <label>Profissão:</label>
          <CustomInput
            type="text"
            value={adopterData.profession}
            onChange={(e) => handleInputChange("profession", e.target.value)}
            placeholder="Digite sua profissão"
            width="70rem"
            className="custom-input-responsive"
          />
            <div id="edit-input-textarea">
            <label>Descrição</label>
            <textarea
              name="edit-form-input"
              id="edit-user-input-description"
              rows={6}
              value={adopterData.description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  handleInputChange("description", e.target.value);
                }
              }}
              placeholder="Descreva-se brevemente..."
              maxLength={500}
            ></textarea>
            <div className="character-counter">
              {adopterData.description ? adopterData.description.length : 0}/500 caracteres
            </div>
          </div><div className="endereco-section">
            <h3>Endereço</h3>
            <div className="row_user_form">              <div className="col_user_form">
                <label>CEP:</label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <CustomInput
                    type="text"
                    placeholder="CEP"
                    value={adopterData.cep}
                    onChange={(e) => {
                      const newCep = e.target.value;
                      handleInputChange("cep", newCep);
                      // Verificar se o CEP tem 8 dígitos (sem formatação) para buscar automaticamente
                      if (newCep.replace(/\D/g, "").length === 8) {
                        buscarEnderecoPorCep(newCep);
                      }
                    }}
                    width="11.4rem"
                    className="custom-input-responsive"
                    maxLength={9}
                    disabled={loadingCep}
                  />
                  {loadingCep ? (
                    <span>Buscando CEP...</span>
                  ) : (
                    <button
                      type="button"
                      className="cep-helper-btn"
                      onClick={() =>
                        window.open(
                          "https://buscacepinter.correios.com.br/app/endereco/index.php",
                          "_blank"
                        )
                      }
                    >
                      Não sei meu CEP
                    </button>
                  )}
                </div>
              </div>              <div className="col_user_form">
                <label>Rua:</label>
                <CustomInput
                  type="text"
                  placeholder="Rua"
                  value={adopterData.street}
                  width="20rem"
                  className="custom-input-responsive"
                  readOnly
                />
              </div>
                <div className="col_user_form">
                <label>Número:</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                  }}
                >
                  <CustomInput
                    type="text"
                    placeholder="Número"
                    value={noNumber ? "S/N" : adopterData.number}
                    onChange={(e) => handleInputChange("number", e.target.value)}
                    width="10rem"
                    disabled={noNumber}
                  />
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.97rem",
                      color: "#d14d72",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={noNumber}
                      onChange={(e) => {
                        setNoNumber(e.target.checked);
                        if (e.target.checked) {
                          handleInputChange("number", "S/N");
                        } else {
                          handleInputChange("number", "");
                        }
                      }}
                      style={{ marginRight: "0.4rem" }}
                    />
                    Sem número
                  </label>
                </div>
              </div>
            </div>
            
            <div className="row_user_form">              <div className="col_user_form">
                <label>Bairro:</label>
                <CustomInput
                  type="text"
                  placeholder="Bairro"
                  value={adopterData.neighborhood}
                  width="21rem"
                  className="custom-input-responsive"
                  readOnly
                />
              </div>                <div className="col_user_form">
                <label>Cidade:</label>
                <CustomInput
                  type="text"
                  placeholder="Cidade"
                  value={adopterData.city}
                  width="20rem"
                  className="custom-input-responsive"
                  readOnly
                />
              </div>
              <div className="col_user_form">
                <label>Estado:</label>
                <CustomInput
                  type="text"
                  placeholder="UF"
                  value={adopterData.state}
                  width="6rem"
                  className="custom-input-responsive"
                  readOnly
                />
              </div>
            </div>
            
            <div className="row_user_form">
              <div className="col_user_form">
                <label>Complemento:</label>
                <CustomInput
                  type="text"
                  placeholder="Complemento"
                  value={adopterData.complement}
                  onChange={(e) => handleInputChange("complement", e.target.value)}
                  width="100%"
                />
              </div>
            </div>
          </div>        <div id="edit-buttons-options">
            <ButtonType type="submit" width="250px">
              Salvar Alterações
            </ButtonType>            
            <ButtonType
              type="button"
              width="250px"
              bgColor="#FF4D4D"
              onClick={(e) => {
                e.preventDefault(); // Previne o comportamento padrão
                Swal.fire({
                  title: "Tem certeza?",
                  text: "Todas as alterações feitas serão perdidas.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#D14D72",
                  cancelButtonColor: "#6c757d",
                  confirmButtonText: "Sim, cancelar",
                  cancelButtonText: "Continuar editando",
                  showCloseButton: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate(`/adopter-profile/${adopterId || user?._id}`);
                  }
                });
              }}
            >
              Cancelar
            </ButtonType>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
