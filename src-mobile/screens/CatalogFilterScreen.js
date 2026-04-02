import React from "react";
import { FlatList, Text } from "react-native";
import AppScreen from "../components/ui/AppScreen";
import EmptyState from "../components/ui/EmptyState";
import LoadingView from "../components/ui/LoadingView";
import OngCard from "../components/ui/OngCard";
import PageIntro from "../components/ui/PageIntro";
import PetCard from "../components/ui/PetCard";
import PinkCard from "../components/ui/PinkCard";
import { ROUTES } from "../navigation/routeNames";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getAllOngs } from "../services/ongService";
import { getLatestPets, getPetsByOng } from "../services/petService";

export default function CatalogFilterScreen({ route, navigation }) {
  const { filterType = "pets", ongId, title } = route.params || {};

  const { data: list = [], loading } = useAsyncTask(async () => {
    if (filterType === "ongs") return getAllOngs();
    if (ongId) return getPetsByOng(ongId);
    return getLatestPets(60);
  }, [filterType, ongId]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="catalog">
      <PageIntro title={title || "Resultados filtrados"} subtitle={`Tipo: ${filterType}`} />
      <PinkCard>
        <Text className="mb-3 text-sm text-textMuted">{list.length} itens</Text>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id || item._id || item.name}
          renderItem={({ item }) =>
            filterType === "ongs" ? (
              <OngCard
                ong={item}
                onPress={() => navigation.navigate(ROUTES.OngProfile, { ongId: item._id, ongSlug: item.slug })}
              />
            ) : (
              <PetCard
                pet={item}
                onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id || item._id })}
              />
            )
          }
          ListEmptyComponent={<EmptyState message="Nenhum registro encontrado." />}
        />
      </PinkCard>
    </AppScreen>
  );
}
