import { API_URL } from "../config/api";

/**
 * Envia email de boas-vindas para novos usuários
 * @param {Object} user - { email: string, fullName: string }
 * @returns {Promise<Object>} Resultado do envio
 */
export async function sendWelcomeEmail(user) {
    try {
        const response = await fetch(`${API_URL}/emails/welcome/adopter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: user.email,
                name: user.fullName
            })
        });

        if (response.ok) {
            console.log("[FRONTEND] Email de boas-vindas requisitado com sucesso");
            return { success: true };
        } else {
            const result = await response.json();
            console.error("[FRONTEND] Falha ao requisitar email:", result);
            return { success: false, error: result.message || "Erro ao enviar email" };
        }
    } catch (error) {
        console.error("[FRONTEND] Erro ao conectar com API de email:", error);
        return { success: false, error: error.message };
    }
}

export async function sendForgotPassword(email) {
    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, ...data };
        } else {
            return { success: false, ...data };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}