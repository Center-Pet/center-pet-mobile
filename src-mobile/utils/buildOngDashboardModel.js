function adoptionSeriesKey(status) {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s.includes("aprov")) return "approved";
  if (s === "rejected" || s.includes("rejeit")) return "rejected";
  if (s === "completed" || s.includes("conclu")) return "completed";
  return null;
}

function specialPetsCount(pet) {
  const conditions = pet?.health?.specialCondition ?? pet?.specialCondition;
  if (Array.isArray(conditions)) {
    return conditions.some((c) => String(c || "").toLowerCase() !== "nenhuma") ? 1 : 0;
  }
  if (conditions && String(conditions).trim()) {
    return String(conditions).toLowerCase() !== "nenhuma" ? 1 : 0;
  }
  return 0;
}

function extremeSituationCount(pet) {
  const conditions = pet?.health?.specialCondition ?? pet?.specialCondition;
  if (Array.isArray(conditions)) {
    return conditions.some((c) => String(c || "").toLowerCase().includes("extrema")) ? 1 : 0;
  }
  if (conditions && String(conditions).toLowerCase().includes("extrema")) return 1;
  return 0;
}

/**
 * Agrega pets e adocoes como no Dashboard.jsx do web (Chart.js / estatisticas).
 */
export function buildOngDashboardModel(pets, adoptions, selectedYear) {
  const safePets = Array.isArray(pets) ? pets : [];
  const safeAdoptions = Array.isArray(adoptions) ? adoptions : [];

  const yearsSet = new Set();
  safePets.forEach((pet) => {
    if (pet?.registerDate) yearsSet.add(new Date(pet.registerDate).getFullYear());
  });
  safeAdoptions.forEach((ad) => {
    if (ad?.requestDate) yearsSet.add(new Date(ad.requestDate).getFullYear());
  });
  const availableYears = yearsSet.size ? Array.from(yearsSet).sort((a, b) => b - a) : [selectedYear];

  const monthlyAdoptions = {
    approved: Array(12).fill(0),
    rejected: Array(12).fill(0),
    completed: Array(12).fill(0)
  };
  const monthlyRescues = Array(12).fill(0);

  const petsByType = {};
  const petsByAge = {};
  const petsByStatus = {};

  safePets.forEach((pet) => {
    const type = pet?.type || "Outros";
    petsByType[type] = (petsByType[type] || 0) + 1;
    const age = pet?.age || "Nao informado";
    petsByAge[age] = (petsByAge[age] || 0) + 1;
    const st = pet?.status || "Sem status";
    petsByStatus[st] = (petsByStatus[st] || 0) + 1;

    if (pet?.registerDate && new Date(pet.registerDate).getFullYear() === selectedYear) {
      const m = new Date(pet.registerDate).getMonth();
      if (m >= 0 && m < 12) monthlyRescues[m] += 1;
    }
  });

  safeAdoptions.forEach((ad) => {
    if (!ad?.requestDate) return;
    const d = new Date(ad.requestDate);
    if (d.getFullYear() !== selectedYear) return;
    const month = d.getMonth();
    const key = adoptionSeriesKey(ad.status);
    if (key && month >= 0 && month < 12) monthlyAdoptions[key][month] += 1;
  });

  return {
    availableYears,
    totalPets: safePets.length,
    specialPets: safePets.reduce((n, p) => n + specialPetsCount(p), 0),
    extremeSituation: safePets.reduce((n, p) => n + extremeSituationCount(p), 0),
    castratedPets: safePets.filter((p) => p?.health?.castrated).length,
    dewormedPets: safePets.filter((p) => p?.health?.dewormed).length,
    vaccinatedPets: safePets.filter((p) => p?.health?.vaccinated).length,
    adoptedPets: safePets.filter((p) => String(p?.status || "").includes("Adotado")).length,
    petsByType,
    petsByAge,
    petsByStatus,
    monthlyAdoptions,
    monthlyRescues
  };
}
