import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PencilSimple, Trash } from "phosphor-react";
import TitleType from "../../components/Atoms/TitleType/TitleType";
import "./AdopterProfile.css";
import useAuth from "../../hooks/useAuth";
import { API_URL } from "../../config/api";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType"; // Importe o componente ButtonType
import Swal from "sweetalert2";

const AdopterProfile = () => {
  const { adopterId } = useParams();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [adopter, setAdopter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lógica de redirecionamento movida para dentro do useEffect
    if (!adopterId && isAuthenticated && user?._id) {
      navigate(`/adopter-profile/${user._id}`, { replace: true });
      return;
    }

    const fetchAdopter = async () => {
      try {
        if (!adopterId) {
          setError("ID do adotante não encontrado na URL");
          setLoading(false);
          return;
        }

        console.log("Buscando adotante com ID:", adopterId);

        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/adopters/${adopterId}`,
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

        // Adicione este log detalhado
        console.log("Dados completos do adotante:", data);
        console.log("Cidade do adotante:", data.city);
        console.log("Bairro do adotante:", data.neighborhood);

        setAdopter(data);
      } catch (error) {
        console.error("Erro:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (adopterId) {
      fetchAdopter();
    }
  }, [adopterId, isAuthenticated, user, navigate]);

  if (loading)
    return (
      <div className="adopter-profile-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <p>Erro: {error}</p>
      </div>
    );
  if (!adopter)
    return (
      <div className="not-found-container">
        <p>Adotante não encontrado.</p>
      </div>
    );

  return (
    <div className="adopter-profile-container">
      <div className="adopter-profile-content">
        <div className="adopter-profile-header-container">
          <div className="adopter-profile-header">
            <img
              src={adopter.profileImg || "https://i.imgur.com/B2BFUeU.png"}
              alt={`Foto de ${adopter.fullName}`}
              className="adopter-profile-image"
            />

            <div className="adopter-profile-header-main">
              <div className="adopter-profile-header-top-item">
                <div className="name-adopter">
                  <TitleType color="#D14D72">
                    {adopter.fullName || "Nome não disponível"}
                  </TitleType>
                  {user && user._id === adopter._id && (
                    <div className="adopter-profile-buttons">
                      <ButtonType
                        onClick={() => navigate("/edit-user")}
                        bgColor="#D14D72"
                        color="#FFFFFF"
                        width="200px"
                        margin="0"
                      >
                        <PencilSimple />
                        Editar
                      </ButtonType>
                      <ButtonType
                        width="200px"
                        bgColor="#FF4D4D"
                        color="#FFFFFF"
                        margin="0"
                        onClick={() => {
                          Swal.fire({
                            title: "Tem certeza?",
                            text: "Esta ação é irreversível. Deseja realmente deletar sua conta?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#FF4D4D",
                            cancelButtonColor: "#6c757d",
                            confirmButtonText: "Sim, deletar",
                            cancelButtonText: "Cancelar",
                          }).then(async (result) => {
                            if (result.isConfirmed) {
                              try {
                                const token = localStorage.getItem("token");
                                const response = await fetch(
                                  `${API_URL}/adopters/delete/${adopterId}`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: token
                                        ? `Bearer ${token}`
                                        : "",
                                      "Content-Type": "application/json",
                                    },
                                  }
                                );
                                if (!response.ok) {
                                  throw new Error(
                                    "Erro ao deletar a conta. Tente novamente."
                                  );
                                }
                                localStorage.removeItem("token");
                                logout();
                                navigate('/home');
                                Swal.fire(
                                  "Deletado!",
                                  "Sua conta foi deletada com sucesso.",
                                  "success"
                                );
                              } catch (error) {
                                console.error(error);
                                Swal.fire(
                                  "Erro!",
                                  "Não foi possível deletar a conta. Tente novamente mais tarde.",
                                  "error"
                                );
                              }
                            }
                          });
                        }}
                      >
                        <Trash />
                        Deletar conta
                      </ButtonType>
                    </div>
                  )}
                </div>
                <div>
                  {/* Adicionar botão de edição - apenas se o usuário logado for o dono do perfil */}
                </div>
              </div>
              <div className="description-adopter">
                <p>{adopter.description || "Descrição não disponível."}</p>
              </div>
              <div className="info-adopter">
                <div className="info-adopter-item">
                  <h3>Cidade</h3>
                  <p>{adopter.city || "Cidade não informada"}</p>
                </div>

                {/* Adicione um campo de endereço completo se desejar */}
                <div className="info-adopter-item">
                  <h3>Bairro</h3>
                  <p>{adopter.neighborhood || "Não informado"}</p>
                </div>

                <div className="info-adopter-item">
                  <h3>Adotante seguro</h3>
                  <p>{adopter.safeAdopter ? "Sim" : "Não"}</p>
                </div>
              </div>
              <div className="adopter-profile-buttons mobile">
                <ButtonType
                  onClick={() => navigate('/edit-user')}
                  bgColor="#D14D72"
                  color="#FFFFFF"
                  margin="0"
                >
                  <PencilSimple/><span>Editar</span>
                </ButtonType>
                <ButtonType
                  bgColor="#FF4D4D"
                  color="#FFFFFF"
                  margin="0"
                  onClick={() => {
                    Swal.fire({
                      title: 'Tem certeza?',
                      text: 'Esta ação é irreversível. Deseja realmente deletar sua conta?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#FF4D4D',
                      cancelButtonColor: '#6c757d',
                      confirmButtonText: 'Sim, deletar',
                      cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API_URL}/adopters/delete/${adopterId}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': token ? `Bearer ${token}` : '',
                              'Content-Type': 'application/json'
                            }
                          });
                          if (!response.ok) {
                            throw new Error('Erro ao deletar a conta. Tente novamente.');
                          }
                          localStorage.removeItem('token');
                          logout();
                          navigate('/home');
                          Swal.fire('Deletado!', 'Sua conta foi deletada com sucesso.', 'success');
                        } catch (error) {
                          console.error(error);
                          Swal.fire('Erro!', 'Não foi possível deletar a conta. Tente novamente mais tarde.', 'error');
                        }
                      }
                    });
                  }}
                >
                  <Trash/><span>Deletar conta</span>
                </ButtonType>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdopterProfile;
