import { postJson } from "./apiClient";

export async function loginWithEmail(email, password) {
  return postJson("/auth/login", { email, password });
}

export async function registerAdopter(payload) {
  return postJson("/adopters/register", payload);
}

export async function forgotPassword(email) {
  return postJson("/auth/forgot-password", { email });
}

export async function resetPassword(token, password, email) {
  return postJson("/auth/reset-password", { token, password, email });
}

export async function registerOng(payload) {
  return postJson("/ongs/register", payload);
}
