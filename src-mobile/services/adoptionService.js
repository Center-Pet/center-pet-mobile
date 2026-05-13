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
  if (Array.isArray(result?.adoptions)) return result.adoptions;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result)) return result;
  return [];
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
