import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "centerpet-catalog-filters-v1";

export async function loadCatalogFilterState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      query: typeof parsed.query === "string" ? parsed.query : "",
      typeFilter: parsed.typeFilter || "todos",
      ageFilter: parsed.ageFilter || "todos",
      statusFilter: parsed.statusFilter || "todos",
      showFilters: Boolean(parsed.showFilters)
    };
  } catch {
    return null;
  }
}

export async function saveCatalogFilterState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
