import { MAX_PET_IMAGES, conditionsToSend } from "../constants/petFormConstants";

/** Validacao alinhada ao RegisterPet.jsx (web). */
export function validateRegisterPetForm(form, imageCount) {
  const errors = {};

  if (!imageCount || imageCount < 1) {
    errors.images = "Adicione pelo menos uma foto do pet";
  }

  const keys = [
    "name",
    "type",
    "coat",
    "state",
    "city",
    "bio",
    "gender",
    "age",
    "breed",
    "size",
    "vaccinated",
    "castrated",
    "dewormed",
    "waitingTime",
    "status"
  ];
  keys.forEach((key) => {
    const v = form[key];
    if (v == null || String(v).trim() === "") {
      errors[key] = "Este campo é obrigatório";
    }
  });

  const conditions = form.specialConditions || [];
  const real = conditions.filter((c) => c !== "Nenhuma");
  if (real.length === 0 && !conditions.includes("Nenhuma")) {
    errors.specialConditions = "Selecione pelo menos uma condição";
  }

  if (form.dewormed === "") errors.dewormed = "Selecione uma opção";
  if (form.vaccinated === "") errors.vaccinated = "Selecione uma opção";
  if (form.castrated === "") errors.castrated = "Selecione uma opção";

  return errors;
}

/** Corpo POST /pets/register — mesmo formato do web (RegisterPet.jsx). */
export function buildRegisterPetBody(form, imagensUrls, ongId) {
  const sc = conditionsToSend(form.specialConditions);
  return {
    name: form.name.trim(),
    type: form.type,
    coat: form.coat,
    state: form.state,
    city: form.city,
    bio: form.bio.trim(),
    gender: form.gender,
    age: form.age,
    breed: form.breed,
    size: form.size,
    vaccinated: form.vaccinated,
    castrated: form.castrated,
    dewormed: form.dewormed,
    specialConditions: form.specialConditions,
    waitingTime: form.waitingTime,
    status: form.status || "Disponível",
    ongId,
    imagens: imagensUrls.slice(0, MAX_PET_IMAGES),
    specialCondition: sc
  };
}

/** Corpo PATCH /pets/update/:id — alinhado ao EditPet.jsx (web). */
export function buildUpdatePetBody(form, imageUrls) {
  const sc = conditionsToSend(form.specialConditions);
  return {
    name: form.name.trim(),
    type: form.type,
    coat: form.coat,
    city: form.city,
    state: form.state,
    bio: form.bio.trim(),
    gender: form.gender,
    age: form.age,
    breed: form.breed,
    size: form.size,
    health: {
      vaccinated: form.vaccinated === "Sim",
      castrated: form.castrated === "Sim",
      dewormed: form.dewormed === "Sim",
      specialCondition: sc
    },
    waitingTime: form.waitingTime,
    status: form.status,
    image: imageUrls
  };
}

export function validateUpdatePetForm(form) {
  const errors = {};
  ["name", "type", "age", "gender", "size", "coat", "bio", "status"].forEach((key) => {
    const v = form[key];
    if (v == null || String(v).trim() === "") {
      errors[key] = "Este campo é obrigatório";
    }
  });
  const conditions = form.specialConditions || [];
  const real = conditions.filter((c) => c !== "Nenhuma");
  if (real.length === 0 && !conditions.includes("Nenhuma")) {
    errors.specialConditions = "Selecione pelo menos uma condição";
  }
  if (!form.state || !form.city) {
    errors.state = "Localização é obrigatória";
    errors.city = "Localização é obrigatória";
  }
  ["vaccinated", "castrated", "dewormed"].forEach((key) => {
    if (form[key] === "") errors[key] = "Selecione uma opção";
  });
  return errors;
}
