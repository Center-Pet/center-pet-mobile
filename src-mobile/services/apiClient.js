import { API_URL } from "../config/api";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      (typeof data === "object" && data?.message) ||
      `Erro HTTP ${response.status} em ${path}`;
    throw new Error(message);
  }

  return data;
}

export function getJson(path, token) {
  return apiRequest(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
}

export function postJson(path, body, token) {
  return apiRequest(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

export function putJson(path, body, token) {
  return apiRequest(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

export function patchJson(path, body, token) {
  return apiRequest(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

export function deleteJson(path, token) {
  return apiRequest(path, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
}
