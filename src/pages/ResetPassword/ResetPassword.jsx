import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Eye, EyeSlash } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

function getEmailFromToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("email") || "";
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  const token = getTokenFromUrl();
  const email = getEmailFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setExpired(true), 30 * 60 * 1000); // 30 minutos
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
      setError("A senha deve ter no mínimo 8 caracteres, 1 número, 1 minúscula, 1 maiúscula e 1 caractere especial.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await Swal.fire({
          title: "Sucesso!",
          text: "Senha redefinida com sucesso! Você já pode fazer login.",
          icon: "success",
          confirmButtonColor: "#D14D72",
        });
        // Redireciona para login com email preenchido (se possível)
        navigate(`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      } else {
        Swal.fire({
          title: "Erro",
          text: data.message || "Erro ao redefinir senha.",
          icon: "error",
          confirmButtonColor: "#D14D72",
        });
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      Swal.fire({
        title: "Erro",
        text: "Erro ao conectar ao servidor.",
        icon: "error",
        confirmButtonColor: "#D14D72",
      });
    }
    setLoading(false);
  };

  if (!token) {
    return <div style={{ padding: 32, color: "#d14d72" }}>Token inválido ou ausente.</div>;
  }

  if (expired) {
    return <div style={{ padding: 32, color: "#d14d72" }}>O link de redefinição expirou. Solicite um novo email.</div>;
  }

  return (
    <div className="reset-password-container" style={{
      maxWidth: 400,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 24px #d14d7215",
      padding: 32
    }}>
      <h2 style={{ color: "#d14d72", marginBottom: 20, textAlign: "center" }}>Redefinir Senha</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Nova senha:
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 36px 8px 8px",
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #eee"
              }}
              minLength={8}
              required
            />
            <span
              onClick={() => setShowPass(v => !v)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#d14d72"
              }}
              title={showPass ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPass ? <EyeSlash size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          Confirmar nova senha:
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 36px 8px 8px",
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #eee"
              }}
              minLength={8}
              required
            />
            <span
              onClick={() => setShowConfirm(v => !v)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#d14d72"
              }}
              title={showConfirm ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirm ? <EyeSlash size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </label>
        {error && <div style={{ color: "#d14d72", marginBottom: 12 }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#d14d72",
            color: "#fff",
            padding: "10px 0",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
          }}
        >
          {loading ? "Redefinindo..." : "Redefinir Senha"}
        </button>
      </form>
    </div>
  );
}