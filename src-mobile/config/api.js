/**
 * URL base da API consumida pelo app.
 * Origem: EXPO_PUBLIC_* em .env.development / .env.production (ou EAS env no build).
 * Fallback: deploy público atual (Render); sobrescreva em .env para API local/staging.
 */
const fallbackUrl = "https://centerpet-api.onrender.com/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;
