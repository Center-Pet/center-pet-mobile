export const MAX_PET_IMAGES = 6;

export const dogBreeds = [
  "Sem Raça Definida (SRD)",
  "Akita",
  "Basset Hound",
  "Beagle",
  "Bernese Mountain Dog",
  "Bichon Frisé",
  "Border Collie",
  "Boxer",
  "Bulldog Francês",
  "Bulldog Inglês",
  "Bull Terrier",
  "Cane Corso",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Cocker Spaniel",
  "Dachshund",
  "Dálmata",
  "Doberman",
  "Golden Retriever",
  "Husky Siberiano",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Lhasa Apso",
  "Maltês",
  "Pastor Alemão",
  "Pastor Australiano",
  "Pequinês",
  "Pinscher",
  "Pit Bull",
  "Poodle",
  "Pug",
  "Rottweiler",
  "São Bernardo",
  "Schnauzer",
  "Shar Pei",
  "Shih Tzu",
  "Spitz Alemão",
  "Weimaraner",
  "Yorkshire Terrier"
];

export const catBreeds = [
  "Sem Raça Definida (SRD)",
  "Abissínio",
  "American Shorthair",
  "Angorá",
  "Balinês",
  "Bengal",
  "Birmanês",
  "Bombaim",
  "British Shorthair",
  "Burmês",
  "Chartreux",
  "Cornish Rex",
  "Devon Rex",
  "Exótico",
  "Himalaio",
  "Maine Coon",
  "Mau Egípcio",
  "Munchkin",
  "Norueguês da Floresta",
  "Oriental",
  "Persa",
  "Ragdoll",
  "Sagrado da Birmânia",
  "Savannah",
  "Scottish Fold",
  "Siamês",
  "Siberiano",
  "Singapura",
  "Somali",
  "Sphynx",
  "Turkish Van"
];

export const specialConditions = [
  "Nenhuma",
  "Cego",
  "Surdo",
  "Amputado",
  "Deficiência Motora",
  "Doença Renal",
  "Doença Cardíaca",
  "Diabetes",
  "Epilepsia",
  "Alergia Alimentar",
  "Alergia de Pele",
  "Leishmaniose",
  "Cinomose",
  "Parvovirose",
  "FIV (Imunodeficiência Felina)",
  "FeLV (Leucemia Felina)",
  "Obesidade",
  "Idoso",
  "Outro"
];

export function initialPetFormState() {
  return {
    name: "",
    type: "",
    coat: "",
    state: "",
    city: "",
    bio: "",
    gender: "",
    age: "",
    breed: "",
    size: "",
    vaccinated: "",
    castrated: "",
    dewormed: "",
    specialConditions: ["Nenhuma"],
    waitingTime: "",
    status: ""
  };
}

export function simNaoFromHealth(value) {
  if (value === true || value === "Sim") return "Sim";
  if (value === false || value === "Não" || value === "Nao") return "Não";
  return "";
}

export function specialConditionsFromPet(pet) {
  const raw = pet?.health?.specialCondition ?? pet?.specialCondition;
  if (Array.isArray(raw)) {
    const items = raw.filter(Boolean);
    return items.length ? items : ["Nenhuma"];
  }
  if (typeof raw === "string" && raw.trim()) {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : ["Nenhuma"];
  }
  return ["Nenhuma"];
}

/** Monta estado do formulario a partir do pet retornado pela API (apos mapPet). */
export function petToFormState(pet) {
  const base = initialPetFormState();
  if (!pet) return base;
  return {
    ...base,
    name: pet.name || "",
    type: pet.type || "",
    coat: pet.coat || "",
    state: pet.state || "",
    city: pet.city || "",
    bio: pet.bio || pet.description || "",
    gender: pet.gender || "",
    age: pet.age || "",
    breed: pet.breed || "",
    size: pet.size || "",
    vaccinated: simNaoFromHealth(pet.vaccinated ?? pet.health?.vaccinated),
    castrated: simNaoFromHealth(pet.castrated ?? pet.health?.castrated),
    dewormed: simNaoFromHealth(pet.dewormed ?? pet.health?.dewormed),
    specialConditions: specialConditionsFromPet(pet),
    waitingTime: pet.waitingTime != null && pet.waitingTime !== "" ? String(pet.waitingTime) : "",
    status: pet.status || "Disponível"
  };
}

export function conditionsToSend(specialConditions) {
  const arr = Array.isArray(specialConditions) ? specialConditions : ["Nenhuma"];
  return arr.filter((c) => c !== "Nenhuma" || arr.length === 1);
}

/** URLs de fotos do pet (paridade com PetDetailsScreen). */
export function collectPetImageList(pet) {
  if (!pet) return [];
  if (Array.isArray(pet.images) && pet.images.length) return pet.images.filter(Boolean);
  if (Array.isArray(pet.image) && pet.image.length) return pet.image.filter(Boolean);
  if (Array.isArray(pet.photos) && pet.photos.length) return pet.photos.filter(Boolean);
  if (Array.isArray(pet.imagens) && pet.imagens.length) return pet.imagens.filter(Boolean);
  if (typeof pet.image === "string" && pet.image) return [pet.image];
  if (typeof pet.photo === "string" && pet.photo) return [pet.photo];
  return [];
}
