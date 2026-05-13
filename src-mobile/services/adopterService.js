import { deleteJson, getJson, patchJson } from "./apiClient";

export async function getAdopterById(id, token) {
  const result = await getJson(`/adopters/${id}`, token);
  return result?.data || result;
}

export async function updateAdopterProfile(id, payload, token) {
  return patchJson(`/adopters/editProfile/${id}`, payload, token);
}

export async function deleteAdopter(id, token) {
  return deleteJson(`/adopters/delete/${id}`, token);
}

export async function updateSafeAdopter(payload, token) {
  return patchJson("/adopters/updateSafeAdopter", payload, token);
}
