import { deleteJson, getJson, postJson, putJson } from "./apiClient";

export async function getAllOngs(token) {
  const result = await getJson("/ongs", token);
  return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
}

export async function getOngById(ongId, token) {
  const result = await getJson(`/ongs/${ongId}`, token);
  return result?.data || result;
}

export async function getOngBySlug(ongSlug, token) {
  const ongs = await getAllOngs(token);
  return (
    ongs.find((ong) => ong.slug === ongSlug || ong.name?.toLowerCase().replaceAll(" ", "-") === ongSlug) ||
    null
  );
}

export function updateOngProfile(ongId, payload, token) {
  return putJson(`/ongs/editProfile/${ongId}`, payload, token);
}

export function deleteOng(ongId, token) {
  return deleteJson(`/ongs/delete/${ongId}`, token);
}

export function registerOng(payload, token) {
  return postJson("/ongs/register", payload, token);
}
