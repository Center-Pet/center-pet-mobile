import React from "react";
import { Eye, EyeSlash } from "phosphor-react";
import "./CustomInput.css";

const CustomInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  isPassword = false,
  showPassword,
  toggleShowPassword,
  error = "",
  name,
  id,
  maxLength,
  minLength,
  disabled = false,
  autoComplete = "on",
  format, // Novo parâmetro para indicar formatos especiais (cpf, cnpj)
}) => {
  // Função para aplicar a máscara de telefone
  const handlePhoneInput = (e) => {
    let input = e.target.value;
    input = input.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

    // Limita a 11 dígitos (para telefones brasileiros)
    if (input.length > 11) {
      input = input.substring(0, 11);
    }

    // Aplicar formatação progressiva
    if (input.length === 0) {
      input = "";
    } else if (input.length <= 2) {
      input = `(${input}`;
    } else if (input.length <= 6) {
      input = `(${input.substring(0, 2)}) ${input.substring(2)}`;
    } else if (input.length <= 10) {
      input = `(${input.substring(0, 2)}) ${input.substring(2, 6)}-${input.substring(6)}`;
    } else {
      input = `(${input.substring(0, 2)}) ${input.substring(2, 7)}-${input.substring(7)}`;
    }

    // Criar evento sintético para manter compatibilidade
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: input,
      },
    };

    onChange(syntheticEvent);
  };

  // Função para aplicar a máscara de CPF
  const handleCpfInput = (e) => {
    let input = e.target.value;
    input = input.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

    // Limita a 11 dígitos (para CPF)
    if (input.length > 11) {
      input = input.substring(0, 11);
    }

    // Aplicar formatação: 000.000.000-00
    let formattedInput = input;
    if (input.length === 0) {
      formattedInput = "";
    } else if (input.length <= 3) {
      // Não alterar para manter apenas os dígitos
    } else if (input.length <= 6) {
      formattedInput = `${input.substring(0, 3)}.${input.substring(3)}`;
    } else if (input.length <= 9) {
      formattedInput = `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6)}`;
    } else {
      formattedInput = `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6, 9)}-${input.substring(9)}`;
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedInput,
      },
    };

    onChange(syntheticEvent);
  };

  // Função para aplicar a máscara de CNPJ
  const handleCnpjInput = (e) => {
    let input = e.target.value;
    input = input.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

    // Limita a 14 dígitos (para CNPJ)
    if (input.length > 14) {
      input = input.substring(0, 14);
    }

    // Aplicar formatação: 00.000.000/0000-00
    let formattedInput = input;
    if (input.length === 0) {
      formattedInput = "";
    } else if (input.length <= 2) {
      // Não alterar para manter apenas os dígitos
    } else if (input.length <= 5) {
      formattedInput = `${input.substring(0, 2)}.${input.substring(2)}`;
    } else if (input.length <= 8) {
      formattedInput = `${input.substring(0, 2)}.${input.substring(2, 5)}.${input.substring(5)}`;
    } else if (input.length <= 12) {
      formattedInput = `${input.substring(0, 2)}.${input.substring(2, 5)}.${input.substring(5, 8)}/${input.substring(8)}`;
    } else {
      formattedInput = `${input.substring(0, 2)}.${input.substring(2, 5)}.${input.substring(5, 8)}/${input.substring(8, 12)}-${input.substring(12)}`;
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedInput,
      },
    };

    onChange(syntheticEvent);
  };

  // Função para determinar o handler correto com base no tipo ou formato
  const getInputHandler = () => {
    if (type === "tel") return handlePhoneInput;
    if (format === "cpf") return handleCpfInput;
    if (format === "cnpj") return handleCnpjInput;
    return onChange;
  };

  // Determinar o maxLength com base no tipo ou formato
  const getMaxLength = () => {
    if (type === "tel") return 16; // (99) 99999-9999
    if (format === "cpf") return 14; // 999.999.999-99
    if (format === "cnpj") return 18; // 99.999.999/9999-99
    return maxLength;
  };

  return (
    <div className="custom-input-container">
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={getInputHandler()}
        className={`custom-input ${className} ${error ? "input-error" : ""}`}
        required={required}
        name={name}
        id={id}
        maxLength={getMaxLength()}
        minLength={minLength}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {isPassword && (
        <button
          type="button"
          className="custom-toggle-button"
          onClick={toggleShowPassword}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeSlash size={20} weight="bold" />
          ) : (
            <Eye size={20} weight="bold" />
          )}
        </button>
      )}
    </div>
  );
};

export default CustomInput;