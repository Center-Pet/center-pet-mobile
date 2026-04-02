import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import AppScreen from "../components/ui/AppScreen";
import AppInput from "../components/ui/AppInput";
import EmptyState from "../components/ui/EmptyState";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PetCard from "../components/ui/PetCard";
import PinkCard from "../components/ui/PinkCard";
import { ROUTES } from "../navigation/routeNames";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getLatestPets } from "../services/petService";

export default function CatalogScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [ageFilter, setAgeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showFilters, setShowFilters] = useState(false);
  const { data: petsData, loading } = useAsyncTask(() => getLatestPets(60), []);
  const pets = Array.isArray(petsData) ? petsData : [];

  const filteredPets = useMemo(
    () =>
      pets.filter((pet) => {
        if (!pet) return false;
        const text = `${pet.name || ""} ${pet.type || ""}`.toLowerCase();
        const matchesSearch = text.includes(query.toLowerCase());
        const matchesType =
          typeFilter === "todos" || (pet.type || "").toLowerCase() === typeFilter.toLowerCase();
        const matchesAge =
          ageFilter === "todos" || (pet.age || "").toLowerCase().includes(ageFilter.toLowerCase());
        const matchesStatus =
          statusFilter === "todos" ||
          (pet.status || "").toLowerCase().includes(statusFilter.toLowerCase());
        return matchesSearch && matchesType && matchesAge && matchesStatus;
      }),
    [pets, query, typeFilter, ageFilter, statusFilter]
  );

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="catalog">
      <PageIntro title="Catalogo" subtitle="Encontre por nome, especie ou perfil" />
      <PinkCard>
        <AppInput placeholder="Buscar pet" value={query} onChangeText={setQuery} />
        <Pressable
          onPress={() => setShowFilters((prev) => !prev)}
          className="mb-2 rounded-full border border-brand px-4 py-2 self-start"
        >
          <Text className="text-sm font-semibold text-brand">
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
        </Pressable>
        {showFilters ? (
          <View className="mb-2">
          <Text className="mb-1 text-sm font-semibold text-textMain">Filtros</Text>
          <View className="flex-row flex-wrap">
            {["todos", "gato", "cachorro"].map((item) => (
              <Pressable
                key={`type-${item}`}
                onPress={() => setTypeFilter(item)}
                className={`mb-1 mr-1 rounded-full border px-3 py-1 ${
                  typeFilter === item ? "border-brand bg-brand" : "border-[#E2CAD4] bg-white"
                }`}
              >
                <Text className={`text-xs ${typeFilter === item ? "text-white" : "text-[#7C5E69]"}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-1 flex-row flex-wrap">
            {["todos", "filhote", "jovem", "adulto"].map((item) => (
              <Pressable
                key={`age-${item}`}
                onPress={() => setAgeFilter(item)}
                className={`mb-1 mr-1 rounded-full border px-3 py-1 ${
                  ageFilter === item ? "border-brand bg-brand" : "border-[#E2CAD4] bg-white"
                }`}
              >
                <Text className={`text-xs ${ageFilter === item ? "text-white" : "text-[#7C5E69]"}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-1 flex-row flex-wrap">
            {["todos", "disponível", "adotado"].map((item) => (
              <Pressable
                key={`status-${item}`}
                onPress={() => setStatusFilter(item)}
                className={`mb-1 mr-1 rounded-full border px-3 py-1 ${
                  statusFilter === item ? "border-brand bg-brand" : "border-[#E2CAD4] bg-white"
                }`}
              >
                <Text
                  className={`text-xs ${statusFilter === item ? "text-white" : "text-[#7C5E69]"}`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        ) : null}
        <View className="mb-2">
          <Text className="text-sm text-textMuted">{filteredPets.length} resultados</Text>
        </View>
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PetCard pet={item} onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id })} />
          )}
          ListEmptyComponent={<EmptyState message="Nenhum pet encontrado para esse filtro." />}
        />
      </PinkCard>
    </AppScreen>
  );
}
