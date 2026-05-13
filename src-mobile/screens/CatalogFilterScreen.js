import React from "react";
import { ScrollView, Text } from "react-native";
import AppScreen from "../components/ui/AppScreen";
import EmptyState from "../components/ui/EmptyState";
import LoadingView from "../components/ui/LoadingView";
import OngCard from "../components/ui/OngCard";
import PageIntro from "../components/ui/PageIntro";
import PetCard from "../components/ui/PetCard";
import PinkCard from "../components/ui/PinkCard";
import { ROUTES } from "../navigation/routeNames";
import { useAuth } from "../hooks/useAuth";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getAllOngs } from "../services/ongService";
import { getLatestPets, getPetsByOng } from "../services/petService";

export default function CatalogFilterScreen({ route, navigation }) {
  const { filterType = "pets", ongId, title } = route.params || {};
  const { token } = useAuth();

  const { data: list = [], loading } = useAsyncTask(async () => {
    if (filterType === "ongs") return getAllOngs(token);
    if (ongId) return getPetsByOng(ongId, token);
    return getLatestPets(60);
  }, [filterType, ongId, token]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="catalog">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageIntro title={title || "Resultados filtrados"} subtitle={`Tipo: ${filterType}`} />
        <PinkCard>
          <Text className="mb-3 text-sm text-textMuted">{list.length} itens</Text>
          {list.length ? (
            list.map((item) =>
              filterType === "ongs" ? (
                <OngCard
                  key={String(item._id || item.id || item.name)}
                  ong={item}
                  onPress={() => navigation.navigate(ROUTES.OngProfile, { ongId: item._id, ongSlug: item.slug })}
                />
              ) : (
                <PetCard
                  key={String(item.id || item._id)}
                  pet={item}
                  onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id || item._id })}
                />
              )
            )
          ) : (
            <EmptyState message="Nenhum registro encontrado." />
          )}
        </PinkCard>
      </ScrollView>
    </AppScreen>
  );
}
