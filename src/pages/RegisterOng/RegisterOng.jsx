import "./RegisterOng.css";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType";
import TitleType from "../../components/Atoms/TitleType/TitleType";
import { useState } from "react";
import ImageInputField from "../../components/Atoms/ImageInputField/ImageInputField";
import Swal from "sweetalert2";
import "./RegisterOng.css";
import PawAnimation from "../../components/Molecules/PawAnimation/PawAnimation";
import ReactDOMServer from "react-dom/server";
import { Eye, EyeSlash } from "phosphor-react";
import CustomInput from "../../components/Atoms/CustomInput/CustomInput";
import { API_URL } from "../../config/api";

// Função utilitária para garantir apenas números positivos (usada só onde precisa)
const onlyPositive = (value) => {
  const num = value.replace(/\D/g, "");
  return num.replace(/^0+/, '') || "";
};

// link para rota: <Route path="/register-user" element={<RegisterUser />} />
// import para página: import RegisterUser from '../pages/RegisterUser/RegisterUser'
const RegisterOng = () => {
  const [roleOption, setRoleOption] = useState("ONG");

  // Informações de Cadastro
  const [fullName, setFullName] = useState(); // Nome completo
  const [description, setDescription] = useState(); // Descrição
  const [email, setEmail] = useState(); // Email
  const [password, setPassword] = useState(); // Senha
  const [passwordConfirm, setPasswordConfirm] = useState(); // Confirmar senha
  const [phone, setPhone] = useState(); // Telefone
  const [instagram, setInstagram] = useState(); // Instagram
  const [facebook, setFacebook] = useState(); // Facebook
  const [website, setWebsite] = useState(); // Site
  const [pixKey, setPixKey] = useState(); // Chave Pix

  const [cpf, setCpf] = useState(); // CPF
  const [cnpj, setCnpj] = useState(); // CNPJ
  const [collaborators, setCollaborators] = useState(); // Número de colaboradores

  const [zipCode, setZipCode] = useState(""); // CEP
  const [street, setStreet] = useState(""); // Rua
  const [number, setNumber] = useState(""); // Número
  const [noNumber, setNoNumber] = useState(false); // Sem número
  const [neighborhood, setneighborhood] = useState(""); // Bairro
  const [city, setCity] = useState(""); // Cidade
  const [stateUf, setStateUf] = useState(""); // UF
  const [isFetchingZip, setIsFetchingZip] = useState(false); // Buscando CEP
  const [profileImg, setProfileImg] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({}); // Estado para validação da senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Função para definir a URL da imagem de perfil*/
  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "centerpet_default"); // seu upload preset
    data.append("cloud_name", "dx8zzla5s"); // seu cloud name

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

  // Função para validar CNPJ
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }

  // Função para validar CPF
  function validarCPF(cpf) {
    cpf = String(cpf).replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }

  // Função para validar senha forte
  function validarSenhaForte(senha) {
    // Critérios de senha forte
    const comprimentoMinimo = senha.length >= 8;
    const temNumero = /[0-9]/.test(senha);
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temCaractereEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      senha
    );

    // Retorna objeto com detalhes da validação
    return {
      valido:
        comprimentoMinimo &&
        temNumero &&
        temMaiuscula &&
        temMinuscula &&
        temCaractereEspecial,
      comprimentoMinimo,
      temNumero,
      temMaiuscula,
      temMinuscula,
      temCaractereEspecial,
    };
  }

  // Função para buscar endereço por CEP
  const buscarEnderecoPorCep = async (cepValue) => {
    const cepLimpo = cepValue.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setIsFetchingZip(true);

    // Usando o componente PawAnimation para o loading
    const pawAnimationHtml = ReactDOMServer.renderToString(
      <PawAnimation width={160} height={160} text="Aguarde um instante" />
    );

    Swal.fire({
      title: "Buscando endereço...",
      html: pawAnimationHtml,
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        Swal.fire({
          title: "CEP não encontrado!",
          text: "Verifique o CEP digitado.",
          icon: "error",
          showConfirmButton: false,
          timer: 2500,
          toast: false,
          position: "center",
          customClass: "swal2-toast error",
        });
        setStreet("");
        setneighborhood("");
        setCity("");
        setStateUf("");
      } else {
        setStreet(data.logradouro || "");
        setneighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setStateUf(data.uf || "");
        Swal.close();
      }
    } catch {
      Swal.fire({
        title: "Erro!",
        text: "Não foi possível buscar o endereço.",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        toast: false,
        position: "center",
        customClass: "swal2-toast error",
      });
    }
    setIsFetchingZip(false);
  };

  // Evento acionado ao enviar os dados
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações existentes...
    if (!password) {
      Swal.fire({
        title: "Atenção!",
        text: "Por favor, insira uma senha.",
        icon: "warning",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast warning",
      });
      return;
    }

    // ADICIONE ESTA VERIFICAÇÃO DE SENHA FORTE
    const senhaValidada = validarSenhaForte(password);
    if (!senhaValidada.valido) {
      Swal.fire({
        title: "Senha fraca!",
        text: "Por favor, utilize uma senha forte que atenda a todos os requisitos.",
        icon: "warning",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast warning",
      });
      return;
    }

    if (passwordConfirm !== password) {
      Swal.fire({
        title: "Atenção!",
        text: "Senhas não coincidem.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast error",
      });
      return;
    }
    if (roleOption === "ONG" && !cnpj) {
      Swal.fire({
        title: "Atenção!",
        text: "Por favor, insira um CNPJ válido.",
        icon: "warning",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast warning",
      });
      return;
    }
    if (roleOption === "ONG" && !validarCNPJ(cnpj)) {
      Swal.fire({
        title: "Atenção!",
        text: "CNPJ inválido.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast error",
      });
      return;
    }
    if (roleOption === "Projeto" || roleOption === "Protetor") {
      if (!cpf) {
        Swal.fire({
          title: "Atenção!",
          text: "Por favor, insira um CPF válido.",
          icon: "warning",
          showConfirmButton: false,
          timer: 3000,
          toast: false,
          position: "center",
          customClass: "swal2-toast warning",
        });
        return;
      } else {
        if (!instagram && !facebook && !website) {
          Swal.fire({
            title: "Atenção!",
            text: "Insira pelo menos uma rede social caso você seja um projeto ou protetor.",
            icon: "warning",
            showConfirmButton: false,
            timer: 3000,
            toast: false,
            position: "center",
            customClass: "swal2-toast warning",
          });
          return;
        }
      }
    }
    if (roleOption === "Projeto" && !collaborators) {
      Swal.fire({
        title: "Atenção!",
        text: "Por favor, preencha todos os campos obrigatórios para Projeto.",
        icon: "warning",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast warning",
      });
      return;
    }

    // Validação de CPF para Projeto
    if (roleOption === "Projeto") {
      if (!cpf) {
        Swal.fire({
          title: "Atenção!",
          text: "Por favor, insira um CPF válido para o representante do projeto.",
          icon: "error",
          showConfirmButton: false,
          timer: 3000,
          toast: false,
          position: "center",
          customClass: "swal2-toast error",
        });
        return;
      }
      if (!validarCPF(cpf)) {
        Swal.fire({
          title: "CPF inválido!",
          text: "O CPF do representante do projeto não é válido.",
          icon: "error",
          showConfirmButton: false,
          timer: 3000,
          toast: false,
          position: "center",
          customClass: "swal2-toast error",
        });
        return;
      }
    }

    // Validação de CPF para Protetor
    if (roleOption === "Protetor") {
      if (!cpf) {
        Swal.fire({
          title: "Atenção!",
          text: "Por favor, insira um CPF válido para o protetor.",
          icon: "error",
          showConfirmButton: false,
          timer: 3000,
          toast: false,
          position: "center",
          customClass: "swal2-toast error",
        });
        return;
      }
      if (!validarCPF(cpf)) {
        Swal.fire({
          title: "CPF inválido!",
          text: "O CPF do protetor não é válido.",
          icon: "error",
          showConfirmButton: false,
          timer: 3000,
          toast: false,
          position: "center",
          customClass: "swal2-toast error",
        });
        return;
      }
    }

    if (
      Number(collaborators) < 0 ||
      Number(cnpj) < 0 ||
      Number(cpf) < 0 ||
      Number(phone) < 0 ||
      Number(zipCode) < 0 ||
      Number(number) < 0
    ) {
      Swal.fire({
        title: "Atenção!",
        text: "Não são permitidos valores negativos nos campos numéricos.",
        icon: "warning",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast warning",
      });
      return;
    }

    let profileImageUrl = "";
    // Mostra o loading antes de iniciar o upload usando o componente PawAnimation
    const pawAnimationHtml = ReactDOMServer.renderToString(
      <PawAnimation
        width={160}
        height={160}
        text="Estamos processando seu cadastro..."
        vertical={true}
      />
    );

    Swal.fire({
      title: "Enviando...",
      html: pawAnimationHtml,
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    try {
      if (profileImg) {
        profileImageUrl = await uploadImageToCloudinary(profileImg);
      }

      // Formata URLs das redes sociais antes de enviar
      const formattedInstagram = formatSocialMediaUrl(instagram, 'instagram');
      const formattedFacebook = formatSocialMediaUrl(facebook, 'facebook');
      const formattedWebsite = formatSocialMediaUrl(website, 'website');

      // Preparar dados para envio à API
      const ongData = {
        name: fullName,
        email: email,
        password: password,
        phone: phone,
        description: description || "",
        address: {
          uf: stateUf,
          zipCode: zipCode,
          street: street,
          number: noNumber ? "S/N" : number,
          neighborhood: neighborhood,
          city: city,
          state: stateUf,
        },
        socialMedia: {
          instagram: formattedInstagram || "",
          facebook: formattedFacebook || "",
          website: formattedWebsite || "",
        },
        pixKey: pixKey || "",
        profileImage: profileImageUrl,
        role: roleOption,
        document: {
          type: roleOption === "ONG" ? "CNPJ" : "CPF",
          number: roleOption === "ONG" ? cnpj : cpf,
        },
        collaborators: roleOption === "Projeto" ? collaborators : 0,
      };

      // Chamada à API com a rota correta
      const response = await fetch(
        `${API_URL}/ongs/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ongData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Tratamento de erros específicos
        if (response.status === 400) {
          if (result.error === "Email already exists") {
            throw new Error(
              "Este email já está cadastrado. Por favor, use outro email."
            );
          } else if (result.error === "Document already exists") {
            throw new Error("Este CNPJ/CPF já está cadastrado no sistema.");
          }
        }
        throw new Error(
          result.message || result.error || "Erro ao cadastrar organização"
        );
      }

      // Mostra mensagem de sucesso
      Swal.fire({
        title: "Sucesso!",
        text: "Organização cadastrada com sucesso!",
        icon: "success",
        showConfirmButton: false,
        timer: 3000,
        toast: false,
        position: "center",
        customClass: "swal2-toast success",
      });

      // Redirecionar para página de login após sucesso
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      console.error("Erro no cadastro:", error);

      Swal.fire({
        title: "Erro",
        text:
          error.message ||
          "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        icon: "error",
        confirmButtonColor: "#D14D72",
        confirmButtonText: "OK",
      });
    }
  };

  const showOrgInputs = (value) => {
    resetOrgInputs();
    setRoleOption(value);
  };

  // Reseta os valores dos campos de organização
  const resetOrgInputs = () => {
    setCpf(null);
    setCnpj(null);
    setCollaborators(null);
  };

  const socialMediaValidation = () => {
    if (roleOption === "Projeto" || roleOption === "Protetor") {
      if (!instagram && !facebook && !website) {
        return true;
      }
    }
    return false;
  };
  // Função utilitária para formatar URLs de redes sociais
  const formatSocialMediaUrl = (url, platform) => {
    if (!url) return "";
    
    // Tratamento especial para Instagram
    if (platform === 'instagram') {
      // Se começa com @, extrair o nome de usuário
      if (url.startsWith('@')) {
        return `https://instagram.com/${url.substring(1)}`;
      }
      
      // Se já começa com http:// ou https://, retorna como está
      if (url.match(/^https?:\/\//)) {
        return url;
      }
      
      // Se contém instagram.com, extrair apenas o nome de usuário
      if (url.includes('instagram.com/')) {
        const username = url.split('instagram.com/')[1].split('/')[0];
        return `https://instagram.com/${username}`;
      }
      
      // Caso contrário, assumir que é apenas o nome de usuário
      return `https://instagram.com/${url}`;
    }
    
    // Para outros tipos de redes sociais, se já tem http:// ou https://, manter como está
    if (url.match(/^https?:\/\//)) {
      return url;
    }
    
    // Formata conforme a plataforma
    switch (platform) {
      case 'facebook':
        // Se o usuário inseriu apenas o nome de usuário/página
        if (!url.includes('.')) {
          return `https://facebook.com/${url}`;
        }
        break;
      case 'website':
        // Para sites, sempre adicionar https://
        break;
    }

    // Padrão para todos os casos não específicos acima
    return `https://${url}`;
  };

  return (
    <div className="register_ong">
      <TitleType>Cadastre sua Organização</TitleType>
      <div id="register-text">
        <p>
          Obs: Projetos e Protetores devem informar pelo menos uma rede social
        </p>
      </div>

      <div id="form-container">
        <form id="register-form" onSubmit={handleSubmit}>
          <label>Nome: </label>
          <CustomInput
            type="text"
            placeholder="Nome da organização"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            width="30rem"
            required
          />
          <label>Telefone: </label>
          <CustomInput
            type="tel"
            placeholder="(00)00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)} // Deixe o componente CustomInput cuidar da formatação
            width="30rem"
            required
          />
          <label>Email: </label>
          <CustomInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            width="30rem"
            required
          />{" "}
          <div className="input-textarea">
            <label>Descrição (opcional)</label>
            <textarea
              name="form-input"
              id="input-description"
              rows={6}
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setDescription(e.target.value);
                }
              }}
              maxLength={500}
              placeholder="Descreva sua organização..."
            ></textarea>
            <div className="character-counter">
              {description ? description.length : 0}/500 caracteres
            </div>
          </div>
          {/* Localização */}
          <div className="endereco-section">
            <div className="endereco-label-row">
              <label>
                CEP <span className="required">*</span>
              </label>
              <button
                type="button"
                className="cep-info-btn"
                title="Por que pedimos o endereço?"
                onClick={() =>
                  Swal.fire({
                    title: `<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
                              <span style="font-size:1.7rem;color:#d14d72;">🔒</span>
                              <span style="font-size:1.18rem;color:#d14d72;font-weight:700;">Por que pedimos seu endereço?</span>
                            </div>`,
                    html: `
                      <div class="endereco-modal-content">
                        <p>
                          <b style="color:#d14d72;">Seu endereço <span style="text-decoration:underline;">não será exibido no site</span>.</b>
                        </p>
                        <div class="endereco-modal-box">
                          <span class="endereco-modal-title">Pedimos o endereço apenas por motivos de segurança:</span>
                          <ul>
                            <li>Para verificar a localização da organização</li>
                            <li>Proteger a privacidade de protetores e ONGs</li>
                            <li>Facilitar a busca por pets próximos</li>
                          </ul>
                        </div>
                        <span class="endereco-modal-title">Sua privacidade é prioridade!</span>
                      </div>`,
                    icon: undefined,
                    confirmButtonColor: "#d14d72",
                    confirmButtonText: "Entendi",
                    customClass: {
                      popup: "custom-swal-popup",
                    },
                  })
                }
              >
                <span
                  className="cep-info-icon"
                  aria-label="informação"
                  title="Por que pedimos o endereço?"
                >
                  ℹ️
                </span>{" "}
                Por que pedimos o endereço?
              </button>
              <span className="endereco-privacidade">
                <span
                  className="lock-icon"
                  aria-label="privado"
                  title="Privacidade"
                >
                  🔒
                </span>
                <span>Seu endereço não será divulgado no site</span>
              </span>
            </div>
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
                value={zipCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setZipCode(val);
                  if (val.replace(/\D/g, "").length === 8) {
                    buscarEnderecoPorCep(val);
                  }
                }}
                width="12rem"
                maxLength={9}
                required
              />
              {isFetchingZip && <span>🔄 Buscando...</span>}
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
            </div>

            <label>Rua:</label>
            <CustomInput
              type="text"
              placeholder="Rua"
              value={street}
              width="30rem"
              required
              disabled
            />

            <label>Número:</label>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}
            >
              <CustomInput
                type="text"
                placeholder="Número"
                value={noNumber ? "S/N" : onlyPositive(number)}
                onChange={(e) => setNumber(onlyPositive(e.target.value))}
                width="10rem"
                required={!noNumber}
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
                    if (e.target.checked) setNumber("S/N");
                    else setNumber("");
                  }}
                  style={{ marginRight: "0.4rem" }}
                />
                Sem número
              </label>
            </div>

            <label>Bairro:</label>
            <CustomInput
              type="text"
              placeholder="Bairro"
              value={neighborhood}
              width="20rem"
              required
              disabled
            />

            <label>Cidade:</label>
            <CustomInput
              type="text"
              placeholder="Cidade"
              value={city}
              width="20rem"
              required
              disabled
            />

            <label>UF:</label>
            <CustomInput
              type="text"
              placeholder="UF"
              value={stateUf}
              width="6rem"
              required
              disabled
            />
          </div>          <label>Instagram: </label>
          <CustomInput
            type="text"
            placeholder="@nome_de_usuario"
            value={instagram}
            onChange={(e) => {
              // Garante que sempre comece com @
              const value = e.target.value;
              if (value === '' || value.startsWith('@')) {
                setInstagram(value);
              } else {
                setInstagram(`@${value}`);
              }
            }}
            required={socialMediaValidation()}
            width="30rem"
            className="instagram-input"
          />

          <label>Facebook: </label>
          <CustomInput
            type="text" // Mudamos de "url" para "text" para aceitar qualquer entrada
            placeholder="facebook.com/sua_pagina ou seu_perfil"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            required={socialMediaValidation()}
            width="30rem"
          />
          <label>Site: </label>
          <CustomInput
            type="text" // Mudamos de "url" para "text" para aceitar qualquer entrada
            placeholder="seusite.com.br"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            required={socialMediaValidation()}
            width="30rem"
          />
          <label>Chave Pix (opcional): </label>
          <CustomInput
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            width="30rem"
          />
          <label>Senha: </label>
          <div style={{ position: "relative", width: "100%", maxWidth: "30rem" }}>
            <div className="password-input-container" style={{ position: "relative", width: "100%" }}>
              <CustomInput
                isPassword={true}
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  const novaSenha = e.target.value;
                  setPassword(novaSenha);
                  setPasswordValidation(validarSenhaForte(novaSenha));
                }}
                className={password && !passwordValidation.valido ? "input-error" : ""}
                required
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
                width="100%"
              />
            </div>
            {password && password.length > 0 && (
              <div className="password-strength-meter">
                <h4>Requisitos de senha:</h4>
                <ul className="password-requirements">
                  <li className={passwordValidation.comprimentoMinimo ? 'valid' : 'invalid'}>
                    <span className="password-requirement-icon">{passwordValidation.comprimentoMinimo ? '✓' : '○'}</span>
                    Mínimo de 8 caracteres
                  </li>
                  <li className={passwordValidation.temNumero ? 'valid' : 'invalid'}>
                    <span className="password-requirement-icon">{passwordValidation.temNumero ? '✓' : '○'}</span>
                    Pelo menos um número
                  </li>
                  <li className={passwordValidation.temMaiuscula ? 'valid' : 'invalid'}>
                    <span className="password-requirement-icon">{passwordValidation.temMaiuscula ? '✓' : '○'}</span>
                    Pelo menos uma maiúscula
                  </li>
                  <li className={passwordValidation.temMinuscula ? 'valid' : 'invalid'}>
                    <span className="password-requirement-icon">{passwordValidation.temMinuscula ? '✓' : '○'}</span>
                    Pelo menos uma minúscula
                  </li>
                  <li className={passwordValidation.temCaractereEspecial ? 'valid' : 'invalid'}>
                    <span className="password-requirement-icon">{passwordValidation.temCaractereEspecial ? '✓' : '○'}</span>
                    Pelo menos um caractere especial
                  </li>
                </ul>
              </div>
            )}
          </div>
          <label>Confirmar Senha: </label>
          <div className="password-input-container" style={{ position: "relative", width: "100%", maxWidth: "30rem" }}>
            <CustomInput
              isPassword={true}
              placeholder="Confirme sua Senha"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              showPassword={showConfirmPassword}
              toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              width="100%"
            />
          </div>
          <div id="image">
            <h2>Insira sua imagem de perfil</h2>
            <ImageInputField onImageChange={setProfileImg} />
          </div>
          <div id="options">
            <label>
              <input
                type="radio"
                className="orgOption"
                name="orgOption"
                onChange={() => showOrgInputs("ONG")}
                checked={roleOption === "ONG"}
              />
              ONG
            </label>
            <label>
              <input
                type="radio"
                className="orgOption"
                name="orgOption"
                onChange={() => showOrgInputs("Projeto")}
                checked={roleOption === "Projeto"}
              />
              Projeto
            </label>
            <label>
              <input
                type="radio"
                className="orgOption"
                name="orgOption"
                onChange={() => showOrgInputs("Protetor")}
                checked={roleOption === "Protetor"}
              />
              Protetor
            </label>

            <button
              type="button"
              className="project-type-info-btn"
              title="Como saber o tipo de projeto?"
              onClick={() =>
                Swal.fire({
                  title: `<div style="display:flex;align-items:center;gap:0.6rem;">
                                            <span style="font-size:1.7rem;color:#d14d72;">❓</span>
                                            <span style="font-size:1.18rem;color:#d14d72;font-weight:700;">Como saber o tipo de projeto?</span>
                                        </div>`,
                  html: `
                                <div style="font-size:1.05rem;text-align:left;max-width:600px;margin:auto;line-height:1.5;">
                                    <b style="color:#d14d72;">Escolha o tipo que melhor representa sua atuação:</b>
                                    <div style="display:flex;gap:1.2rem;justify-content:center;align-items:stretch;margin:1.2em 0 0.8em 0;flex-wrap:wrap;">
                                        <div style="background:#fef2f4;border-radius:8px;padding:0.7em 1.2em;min-width:160px;border:1px solid #ffd6e0;display:flex;flex-direction:column;align-items:center;">
                                            <span style="font-weight:700;color:#d14d72;">ONG</span>
                                            <span style="font-size:0.98rem;color:#d14d72;">Organização formal, registrada com CNPJ, geralmente com equipe e estrutura própria.</span>
                                        </div>
                                        <div style="background:#fef2f4;border-radius:8px;padding:0.7em 1.2em;min-width:160px;border:1px solid #ffd6e0;display:flex;flex-direction:column;align-items:center;">
                                            <span style="font-weight:700;color:#d14d72;">Projeto</span>
                                            <span style="font-size:0.98rem;color:#d14d72;">Iniciativa organizada, pode ser temporária ou permanente, normalmente com CPF do responsável e colaboradores.</span>
                                        </div>
                                        <div style="background:#fef2f4;border-radius:8px;padding:0.7em 1.2em;min-width:160px;border:1px solid #ffd6e0;display:flex;flex-direction:column;align-items:center;">
                                            <span style="font-weight:700;color:#d14d72;">Protetor</span>
                                            <span style="font-size:0.98rem;color:#d14d72;">Pessoa física que resgata e cuida de animais individualmente, sem CNPJ, apenas CPF.</span>
                                        </div>
                                    </div>                                </div>`,
                  icon: undefined,
                  confirmButtonColor: "#d14d72",
                  confirmButtonText: "Entendi",
                  customClass: {
                    popup: "custom-swal-popup project-type-modal-wide",
                  },
                })
              }
            >
              <span
                className="project-type-info-icon"
                aria-label="informação"
                title="Como saber o tipo de projeto?"
              >
                ℹ️
              </span>{" "}
              Como saber o tipo de projeto?
            </button>
          </div>
          {roleOption === "ONG" && (
            <>
              <label>CNPJ: </label>
              <CustomInput
                type="text"
                placeholder="CNPJ"
                value={cnpj || ""}
                onChange={(e) => setCnpj(e.target.value)}
                width="30rem"
                format="cnpj"
                required
              />
            </>
          )}
          {roleOption === "Projeto" && (
            <>
              <label>CPF (do representante do projeto): </label>
              <CustomInput
                type="text"
                placeholder="CPF"
                value={cpf || ""}
                onChange={(e) => setCpf(e.target.value)}
                width="30rem"
                format="cpf"
                required
              />
              <label>Número de colaboradores: </label>
              <CustomInput
                type="number"
                min={1}
                value={collaborators || ""}
                onChange={(e) => {
                  const val = onlyPositive(e.target.value);
                  setCollaborators(val === "0" ? "" : val);
                }}
                width="30rem"
                required
              />
            </>
          )}
          {roleOption === "Protetor" && (
            <>
              <label>CPF: </label>
              <CustomInput
                type="text"
                placeholder="CPF"
                value={cpf || ""}
                onChange={(e) => setCpf(e.target.value)}
                width="30rem"
                format="cpf" // Adicionando esta propriedade para ativar a formatação
                required
              />
            </>
          )}
          <p id="text-login">
            Já tem uma conta?{" "}
            <a href="/login" id="link-enter">
              Entrar
            </a>
          </p>
          <ButtonType type="submit" width="100%">
            Cadastrar
          </ButtonType>
        </form>
      </div>
    </div>
  );
};

export default RegisterOng;
