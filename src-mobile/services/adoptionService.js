import { getJson, postJson, putJson } from "./apiClient";

export async function createAdoptionRequest(payload, token) {
  return postJson("/adoptions/create", payload, token);
}

export async function getAdoptionById(adoptionId, token) {
  const result = await getJson(`/adoptions/${adoptionId}`, token);
  return result?.data || result;
}

export async function getAdoptionsByOng(ongId, token) {
  const result = await getJson(`/adoptions/by-ong/${ongId}`, token);
  return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
}

export async function acceptAdoption(adoptionId, token) {
  return postJson(`/adoptions/accept/${adoptionId}`, {}, token);
}

export async function rejectAdoption(adoptionId, token) {
  return postJson(`/adoptions/reject/${adoptionId}`, {}, token);
}

export async function updateAdoption(adoptionId, payload, token) {
  return putJson(`/adoptions/update/${adoptionId}`, payload, token);
}
