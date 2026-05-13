function monthWaitingForPet(pet) {
  if (pet?.waitingTime != null && String(pet.waitingTime).trim() !== "") {
    const n = parseInt(String(pet.waitingTime), 10);
    return Number.isNaN(n) ? 0 : n;
  }
  if (pet?.registerDate) {
    const registerDate = new Date(pet.registerDate);
    if (Number.isNaN(registerDate.getTime())) return 0;
    const diff = Math.abs(Date.now() - registerDate.getTime());
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
  }
  return 0;
}

function isAdoptedStatus(status) {
  return String(status || "").toLowerCase().includes("adot");
}

function isAvailableStatus(status) {
  return String(status || "").toLowerCase().includes("dispon");
}

/**
 * Indicadores alinhados ao HomeOng do web (total, adotados, disponiveis, pendentes, tempo medio).
 */
export function computeOngDashboardStats(pets, adoptions) {
  const safePets = Array.isArray(pets) ? pets : [];
  const safeAdoptions = Array.isArray(adoptions) ? adoptions : [];

  const totalPets = safePets.length;
  const adoptedPets = safePets.filter((p) => isAdoptedStatus(p?.status)).length;
  const availablePets = safePets.filter((p) => isAvailableStatus(p?.status)).length;
  const pendingAdoptions = safeAdoptions.filter((a) => a?.status === "requestReceived").length;

  const availableList = safePets.filter((p) => isAvailableStatus(p?.status));
  const waits = availableList.map(monthWaitingForPet).filter((w) => w > 0);
  const avgWaiting = waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0;
  const avgWaitingLabel = avgWaiting > 0 ? `${avgWaiting} ${avgWaiting === 1 ? "mes" : "meses"}` : "N/A";

  return { totalPets, adoptedPets, availablePets, pendingAdoptions, avgWaitingLabel };
}
