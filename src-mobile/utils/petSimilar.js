/**
 * Monta lista de pets similares, priorizando outras ONGs (paridade com o web).
 */
export function buildSimilarPetsList({ similarFromApi, latestPets, currentPet, petIdParam, currentOngId }) {
  if (!currentPet?.type) return [];

  const idSet = new Set(
    [petIdParam, currentPet?._id, currentPet?.id].filter(Boolean).map((x) => String(x))
  );

  const isAvailable = (item) => String(item?.status || "").toLowerCase().includes("dispon");
  const sameType = (item) => (item?.type || "") === (currentPet?.type || "");
  const notSelf = (item) => !idSet.has(String(item?.id || item?._id || ""));

  const uniqKey = (item) => String(item?.id || item?._id || "");
  const mergeUnique = (target, source) => {
    const seen = new Set(target.map(uniqKey));
    for (const item of source || []) {
      const k = uniqKey(item);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      target.push(item);
    }
    return target;
  };

  const pool = [];
  mergeUnique(pool, Array.isArray(similarFromApi) ? similarFromApi : []);

  const otherOngFirst = (list) =>
    list.filter((item) => {
      if (!notSelf(item) || !isAvailable(item) || !sameType(item)) return false;
      const oid = String(item?.ongId || item?.ong?._id || item?.ong || "");
      return oid && oid !== String(currentOngId || "");
    });

  let out = otherOngFirst(pool);
  if (out.length >= 6) return out.slice(0, 6);

  const latest = Array.isArray(latestPets) ? latestPets : [];
  mergeUnique(pool, latest);
  out = otherOngFirst(pool);
  if (out.length >= 6) return out.slice(0, 6);

  const relaxed = [];
  const seen = new Set();
  for (const item of pool) {
    if (!notSelf(item) || !isAvailable(item) || !sameType(item)) continue;
    const k = uniqKey(item);
    if (seen.has(k)) continue;
    seen.add(k);
    relaxed.push(item);
    if (relaxed.length >= 6) break;
  }
  return relaxed.slice(0, 6);
}
