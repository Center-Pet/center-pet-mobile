import React, { useState, useEffect } from "react";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import useAuth from "../../hooks/useAuth";
import PawAnimation from "../../components/Molecules/PawAnimation/PawAnimation";
import ReactDOMServer from "react-dom/server";
import { Check } from "phosphor-react"; // Importando ícones do Phosphor
import CustomInput from "../../components/Atoms/CustomInput/CustomInput";
import { sendWelcomeEmail } from "../../services/emailService";
import { API_URL } from "../../config/api";

import "./Login.css";

// Função para verificar cpf
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
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
  const temCaractereEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha);

  // Retorna objeto com detalhes da validação
  return {
    valido: comprimentoMinimo && temNumero && temMaiuscula && temMinuscula && temCaractereEspecial,
    comprimentoMinimo,
    temNumero,
    temMaiuscula,
    temMinuscula,
    temCaractereEspecial
  };
}

// Função para redirecionar para /register-ong
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const handleRegisterOng = () => {
    navigate("/register-ong");
  };
  const [isLogin, setIsLogin] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Campos do cadastro
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    valido: false,
    comprimentoMinimo: false,
    temNumero: false,
    temMaiuscula: false,
    temMinuscula: false,
    temCaractereEspecial: false
  });

  const images = [
    "https://www.opovo.com.br/_midias/jpg/2023/07/31/818x460/1_cao_e_gato_1_scaled_e1690826292317-22828962.jpg",
    "https://portaledicase.com/wp-content/uploads/2023/07/Cao-e-gato-scaled-e1690826315479-1024x683.jpg",
    "https://i.ibb.co/TRX3Nwn/gatinhos.png"
  ];

  const texts = [
    {
      title: "Bem vindo a Center Pet!",
      description: "Conheça o seu novo melhor amigo.",
    },
    {
      title: "Ajude animais a encontrarem um lar.",
      description: "Milhares de animais esperam por um lar amoroso.",
    },
    {
      title: "Cadastre seu abrigo!",
      description: "Ajude a encontrar lares para seus resgatados.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromReset = params.get("email");
    if (emailFromReset) setEmail(emailFromReset);
  }, [location]);

  const handleFormSwitch = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setPassword(""); // limpa as senhas ao mudar
      setConfirmPassword("");
      setPasswordError("");
      setIsSwitching(false);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      // PRIMEIRO, verificar os termos e condições antes de qualquer outra validação
      if (!agreeToTerms) {
        try {
          await Swal.fire({
            title: 'Termos e Condições',
            text: 'Por favor, aceite os Termos e Condições para continuar.',
            icon: 'warning',
            confirmButtonColor: '#D14D72',
            confirmButtonText: 'Entendi'
          });
          return;
        } catch (error) {
          console.error("Erro ao mostrar SweetAlert:", error);
        }
      }

      // DEPOIS, verificar os outros campos
      if (!fullName || !cpf || !email || !password || !confirmPassword) {
        try {
          await Swal.fire({
            title: 'Campos incompletos!',
            text: 'Por favor, preencha todos os campos obrigatórios.',
            icon: 'warning',
            confirmButtonColor: '#D14D72',
          });
          return;
        } catch (error) {
          console.error("Erro ao mostrar SweetAlert:", error);
        }
      }

      if (!validarCPF(cpf)) {
        Swal.fire({
          title: 'CPF inválido!',
          text: 'Por favor, insira um CPF válido.',
          icon: 'error',
          showConfirmButton: false,
          timer: 3000,
          toast: false,
          position: 'center',
          customClass: 'swal2-toast error'
        });
        return;
      }

      // Modifique a verificação de senha no handleSubmit

      // Substitua a validação de senha existente:
      // if (password.length < 6) {
      //   setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      //   return;
      // }

      // Por esta validação mais robusta:
      if (!passwordValidation.valido) {
        try {
          await Swal.fire({
            title: 'Senha fraca!',
            text: 'Por favor, utilize uma senha forte que atenda a todos os requisitos.',
            icon: 'warning',
            confirmButtonColor: '#D14D72',
          });
          return;
        } catch (error) {
          console.error("Erro ao mostrar SweetAlert:", error);
        }
      }

      if (password !== confirmPassword) {
        setPasswordError("As senhas não coincidem.");
        return;
      }

      setPasswordError("");

      // Mostrar loading com PawAnimation
      const pawAnimationHtml = ReactDOMServer.renderToString(
        <PawAnimation
          width={160}
          height={160}
          text="Cadastrando..."
          vertical={true}
        />
      );

      Swal.fire({
        title: 'Processando',
        html: pawAnimationHtml,
        showConfirmButton: false,
        allowOutsideClick: false
      });

      try {
        // Criar objeto de adotante com campos iniciais obrigatórios
        const adopterData = {
          fullName: fullName,
          email: email,
          password: password,
          cpf: cpf.replace(/[^\d]+/g, ''), // Remove caracteres não numéricos
          // Valores iniciais para outros campos obrigatórios
          safeAdopter: false
        };

        const response = await fetch(
          `${API_URL}/adopters/register`,  // Corrigida aspas de fechamento
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(adopterData)
          }
        );

        // Fechar o loading
        Swal.close();

        // Pegando o resultado para verificar mensagens de erro
        const result = await response.json();

        if (response.status === 201 || response.status === 200) {
          // Enviar email de boas-vindas
          try {
            await sendWelcomeEmail(adopterData);
            console.log("Solicitação de envio de email feita ao backend!");
          } catch (error) {
            console.error("Erro ao solicitar envio de email:", error);
          }

          Swal.fire({
            title: 'Cadastro realizado!',
            text: 'Sua conta foi criada com sucesso. Enviamos um email de boas-vindas para você!',
            icon: 'success',
            showConfirmButton: true,
            confirmButtonColor: '#D14D72',
            position: 'center'
          }).then(() => {
            setIsLogin(true);
            setEmail("");
            setPassword("");
          });
        } else {
          // Verificar o tipo de erro retornado pela API
          let errorMessage = 'Ocorreu um erro durante o cadastro.';

          if (result && result.message) {
            // Verificar mensagens específicas de erro
            if (result.message.includes('email') || result.message.toLowerCase().includes('e-mail')) {
              errorMessage = 'Este email ou CPF já está cadastrado.';
            } else {
              errorMessage = result.message;
            }
          }

          Swal.fire({
            title: 'Não foi possível cadastrar',
            text: errorMessage,
            icon: 'error',
            showConfirmButton: true,
            confirmButtonColor: '#D14D72',
            position: 'center'
          });
        }
      } catch (error) {
        Swal.close();
        let errorMessage = 'Ocorreu um erro durante o cadastro.';

        // Adaptando o tratamento de erros para a API fetch
        console.error('Erro ao cadastrar:', error);

        Swal.fire({
          title: 'Erro!',
          text: errorMessage,
          icon: 'error',
          showConfirmButton: true,
          confirmButtonColor: '#D14D72',
          position: 'center'
        });
      }
    } else {
      // Lógica para login
      if (!email || !password) {
        Swal.fire({
          title: 'Atenção!',
          text: 'Por favor, preencha todos os campos.',
          icon: 'warning',
          showConfirmButton: false,
          timer: 3000,
          position: 'center'
        });
        return;
      }

      // Mostrar loading com PawAnimation
      const pawAnimationHtml = ReactDOMServer.renderToString(
        <PawAnimation
          width={160}
          height={160}
          text="Entrando..."
          vertical={true}
        />
      );

      Swal.fire({
        title: 'Aguarde',
        html: pawAnimationHtml,
        showConfirmButton: false,
        allowOutsideClick: false
      });

      try {
        const loginData = {
          email: email,
          password: password
        };

        const response = await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
          }
        );

        const result = await response.json();

        // Fechar o loading
        Swal.close();

        if (response.ok) {
          // Login bem-sucedido
          // Armazenar token e informações do usuário no localStorage
          login(result.user, result.token, result.userType);

          Swal.fire({
            title: 'Login bem-sucedido!',
            text: 'Redirecionando...',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            position: 'center'
          }).then(() => {
            if (result.userType === 'Ong' || result.userType === 'ONG') {
              navigate('/home-ong');
            } else {
              navigate('/home');
            }
          });
        } else {
          // Login falhou
          let errorMessage = 'Email ou senha incorretos.';

          if (result && result.message) {
            errorMessage = result.message;
          }

          Swal.fire({
            title: 'Erro ao entrar',
            text: errorMessage,
            icon: 'error',
            showConfirmButton: true,
            confirmButtonColor: '#D14D72',
            position: 'center'
          });
        }
      } catch (error) {
        Swal.close();
        console.error('Erro ao fazer login:', error);

        Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.',
          icon: 'error',
          showConfirmButton: true,
          confirmButtonColor: '#D14D72',
          position: 'center'
        });
      }
    }
  };

  const handleForgotPasswordSubmit = async (email) => {
    if (!email) return;

    // Mostrar loading com PawAnimation
    const pawAnimationHtml = ReactDOMServer.renderToString(
      <PawAnimation
        width={160}
        height={160}
        text="Enviando..."
        vertical={true}
      />
    );

    Swal.fire({
      title: 'Enviando',
      html: pawAnimationHtml,
      showConfirmButton: false,
      allowOutsideClick: false
    });

    try {
      // Implemente a chamada à API de recuperação de senha
      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      // Fechar o loading
      Swal.close();

      if (response.ok) {
        Swal.fire({
          title: 'Email enviado!',
          text: 'Verifique sua caixa de entrada para recuperar sua senha.',
          icon: 'success',
          showConfirmButton: true,
          confirmButtonColor: '#D14D72',
          position: 'center'
        });
      } else {
        const result = await response.json();
        Swal.fire({
          title: 'Não foi possível enviar',
          text: result.message || 'Email não encontrado ou erro no servidor.',
          icon: 'error',
          showConfirmButton: true,
          confirmButtonColor: '#D14D72',
          position: 'center'
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      Swal.close();

      Swal.fire({
        title: 'Erro!',
        text: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonColor: '#D14D72',
        position: 'center'
      });
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Recuperar Senha',
      html: `
        <p style="margin-bottom: 15px; color: #555; font-size: 14px; text-align: left;">
          Digite seu e-mail para receber um link de recuperação de senha
        </p>
        <input 
          id="swal-input-email" 
          class="swal2-input" 
          placeholder="Seu email cadastrado"
          value="${email}"
          style="width: 100%; box-sizing: border-box; margin: 10px auto; border-color: #FCC8D1;"
        >
      `,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#FFABAB',
      confirmButtonText: 'Recuperar Senha',
      confirmButtonColor: '#D14D72',
      showLoaderOnConfirm: false,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        const inputEmail = document.getElementById('swal-input-email').value;

        if (!inputEmail || !/\S+@\S+\.\S+/.test(inputEmail)) {
          Swal.showValidationMessage('Por favor, digite um email válido');
          return false;
        }

        return inputEmail;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        await handleForgotPasswordSubmit(result.value);
      }
    });
  };

  // Função para formatar CPF
  function formatarCPF(valor) {
    valor = valor.replace(/\D/g, "");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return valor;
  }

  // Verificar se o Swal foi carregado corretamente
  if (!Swal || !Swal.fire) {
    console.error("SweetAlert2 não foi carregado corretamente!");
  }

  return (
    <div className="login-container">
      <div className="slider-section">
        <div className="slider-text">
          <h1>{texts[currentImage].title}</h1>
          <p>{texts[currentImage].description}</p>
        </div>
        {images.map((img, index) => (
          <div
            key={index}
            className={`slider-image ${currentImage === index ? "active" : ""}`}
          >
            <img src={img} alt={`Slide ${index + 1}`} />
            <div className="overlay" />
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="form-container">
          <div className={`form-header ${isSwitching ? "switching" : ""}`}>
            <img
              className="logo"
              src="../../assets/logo/CenterPet.png"
              alt="Logo"
              style={{ cursor: "pointer" }}
              onClick={() => navigate('/home')}
            />
            <h2>{isLogin ? "Bem vindo de volta!" : "Criar Conta"}</h2>
          </div>

          <form className={`login-form ${isSwitching ? "switching" : ""}`} onSubmit={handleSubmit}>
            {isLogin ? (
              <>
                <CustomInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  name="email"
                  id="email"
                />
                <CustomInput
                  isPassword={true}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showPassword={showPassword}
                  toggleShowPassword={() => setShowPassword(!showPassword)}
                  name="password"
                  id="password"
                />
                <div className="forgot-password-link">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="login-button-wrapper">
                  <ButtonType bgColor="#D14D72" type="submit" width="100%">
                    Entrar
                  </ButtonType>
                </div>
              </>
            ) : (
              <>
                <CustomInput
                  type="text"
                  placeholder="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  name="fullName"
                  id="fullName"
                />
                <CustomInput
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatarCPF(e.target.value));
                    setPasswordError("");
                  }}
                  required
                  name="cpf"
                  id="cpf"
                  maxLength={14}
                />
                <CustomInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  name="email"
                  id="email"
                />
                <div className="password-group">
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
                    name="password"
                    id="password"
                  />

                  <CustomInput
                    isPassword={true}
                    placeholder="Confirme sua Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    showPassword={showConfirmPassword}
                    toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    name="confirmPassword"
                    id="confirmPassword"
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
                {passwordError && <p className="error-text">{passwordError}</p>}
                <div className="terms-agreement">
                  <label className="terms-checkbox">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={() => setAgreeToTerms(prevState => !prevState)}
                    />
                    <span className="checkbox-custom">
                      {agreeToTerms && <Check weight="bold" size={16} />}
                    </span>
                    <span className="checkbox-label">
                      Li e concordo com os <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Termos e Condições</a>
                    </span>
                  </label>
                </div>
                <div className="login-button-wrapper">
                  <ButtonType bgColor="#D14D72" type="submit" width="100%">
                    Cadastrar
                  </ButtonType>
                </div>
              </>
            )}

            <div className="toggle-row">
              <p className="toggle-form">
                {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                <button type="button" onClick={handleFormSwitch} className="toggle-button">
                  {isLogin ? "Cadastre-se" : "Entrar"}
                </button>
              </p>

              <p className="toggle-ong">
                {isLogin ? "Você é um projeto? " : "Já tem uma conta de projeto? "}
                <button type="button" onClick={isLogin ? handleRegisterOng : handleFormSwitch} className="toggle-button">
                  {isLogin ? "Cadastre-se" : "Entrar"}
                </button>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
