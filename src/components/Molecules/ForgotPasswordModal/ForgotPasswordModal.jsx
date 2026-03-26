import React, { useState, useEffect } from "react";
import InputField from "../../Atoms/InputField/InputField";
import ButtonType from "../../Atoms/ButtonType/ButtonType";
import PawAnimation from "../PawAnimation/PawAnimation";
import { sendForgotPassword } from "../../services/emailService";
import "./ForgotPasswordModal.css";

/**
 * Modal para recuperação de senha
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onClose - Função para fechar o modal
 * @param {string} props.email - Email pré-preenchido (opcional)
 * @param {Function} props.onSubmit - Função chamada ao enviar o formulário
 */
const ForgotPasswordModal = ({ onClose, email = "", onSubmit }) => {
  const [forgotEmail, setForgotEmail] = useState(email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Atualiza o email no estado quando a prop email muda
  useEffect(() => {
    setForgotEmail(email);
  }, [email]);

  // Fecha o modal quando ESC é pressionado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Valida o email e envia o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação de email básica
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrorMessage("Por favor, digite um email válido");
      return;
    }
    
    setErrorMessage("");
    setIsSubmitting(true);
    
    try {
      // Chama a função onSubmit passada como prop
      await onSubmit(forgotEmail);
      onClose();
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setErrorMessage("Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (email) => {
    const result = await sendForgotPassword(email);
    if (result.success) {
      // Sucesso
    } else {
      // Erro
    }
  };

  return (
    <div className="forgot-password-overlay" onClick={onClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Recuperar senha</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>Digite seu e-mail para receber um link de recuperação de senha</p>
            <InputField
              type="email"
              placeholder="Seu email cadastrado"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          
          <div className="modal-footer">
            <ButtonType 
              bgColor="#FFABAB" 
              type="button" 
              width="100%"
              onClick={onClose}
            >
              Cancelar
            </ButtonType>
            <ButtonType 
              bgColor="#D14D72" 
              type="submit" 
              width="100%" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <PawAnimation width={160} height={160} text="Enviando..." vertical={false} />
              ) : (
                "Recuperar senha"
              )}
            </ButtonType>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;