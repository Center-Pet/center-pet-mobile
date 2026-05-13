import { getJson, postJson, patchJson, deleteJson } from "./apiClient";

function mapPet(pet) {
  const images = Array.isArray(pet?.image)
    ? pet.image
    : Array.isArray(pet?.photos)
      ? pet.photos
      : Array.isArray(pet?.imagens)
        ? pet.imagens
        : [];
  const fallbackImage = "https://i.imgur.com/B2BFUeU.png";
  const firstImage = images[0] || pet?.image || pet?.photo || fallbackImage;

  return {
    ...pet,
    id: pet?._id || pet?.id,
    image: firstImage,
    images: images.length ? images : [firstImage],
    status: pet?.status || "Disponivel"
  };
}

export async function getLatestPets(limit = 20) {
  const result = await getJson(`/pets?sort=createdAt&order=desc&status=Disponível&limit=${limit}`);
  const pets = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  return pets.map(mapPet);
}

export async function getSimilarPets({ type, excludeId, limit = 12 }) {
  const params = new URLSearchParams();
  if (type) params.append("type", String(type));
  if (limit) params.append("limit", String(limit));
  if (excludeId) params.append("exclude", String(excludeId));

  const result = await getJson(`/pets?${params.toString()}`);
  const pets = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  return pets.map(mapPet);
}

export async function getPetById(id) {
  const result = await getJson(`/pets/${id}`);
  return mapPet(result?.data || result);
}

export async function getPetsByOng(ongId, token) {
  const result = await getJson(`/pets/by-ong/${ongId}`, token);
  const pets = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  return pets.map(mapPet);
}

export async function createPet(payload, token) {
  return postJson("/pets/register", payload, token);
}

export async function updatePet(petId, payload, token) {
  return patchJson(`/pets/update/${petId}`, payload, token);
}

export async function deletePet(petId, token) {
  return deleteJson(`/pets/delete/${petId}`, token);
}
