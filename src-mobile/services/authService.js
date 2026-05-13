import { postJson } from "./apiClient";
import { API_URL } from "../config/api";

export async function loginWithEmail(email, password) {
  return postJson("/auth/login", { email, password });
}

export async function registerAdopter(payload) {
  return postJson("/adopters/register", payload);
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** Igual ao web (Login / emailService): POST /auth/forgot-password com { email } */
export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const msg =
      data.message ||
      data.error ||
      (typeof data === "string" ? data : null) ||
      "Email nao encontrado ou erro no servidor.";
    throw new Error(msg);
  }
  return data;
}

/** Igual ao web (ResetPassword): POST /auth/reset-password com { token, password } */
export async function resetPassword(token, password) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const msg = data.message || data.error || "Erro ao redefinir senha.";
    throw new Error(msg);
  }
  return data;
}

export async function registerOng(payload) {
  return postJson("/ongs/register", payload);
}
