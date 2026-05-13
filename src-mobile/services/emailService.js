import { postJson } from "./apiClient";

export function sendWelcomeEmail(user) {
  return postJson("/emails/welcome/adopter", {
    email: user.email,
    name: user.fullName
  });
}

export function sendAdoptionRequestEmail(payload) {
  return postJson("/emails/adoption-request", payload);
}
