import React from "react";
import { Eye, EyeSlash } from "phosphor-react";
import "./InputField.css";

const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  width,
  margin,
  padding,
  readOnly,
  disabled,
  className = "",
  isPassword = false,
  showPassword,
  toggleShowPassword,
  error = "",
  name,
  id,
  maxLength,
  minLength,
  autoComplete = "on",
}) => {
  return (
    <div className="input-field">
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-input ${className} ${error ? "input-error" : ""}`}
        style={{ width, margin, padding }}
        readOnly={readOnly}
        disabled={disabled}
        name={name}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
      />
      {isPassword && (
        <button
          type="button"
          className="form-toggle-button"
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

export default InputField;