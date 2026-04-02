import React from "react";
import { FlatList, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppScreen from "../components/ui/AppScreen";
import EmptyState from "../components/ui/EmptyState";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PetCard from "../components/ui/PetCard";
import PinkCard from "../components/ui/PinkCard";
import { ROUTES } from "../navigation/routeNames";
import { useAuth } from "../hooks/useAuth";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getAdoptionsByOng } from "../services/adoptionService";
import { getPetsByOng } from "../services/petService";

export default function HomeOngScreen({ navigation }) {
  const { user, token } = useAuth();
  const { data, loading, reload } = useAsyncTask(async () => {
    const [pets, adoptions] = await Promise.all([
      getPetsByOng(user?._id, token),
      getAdoptionsByOng(user?._id, token)
    ]);
    return { pets, adoptions };
  }, [user?._id, token]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="home">
      <PageIntro title="Area da ONG" subtitle="Gerencie seus pets e adocoes" />
      <View className="mb-3 flex-row gap-2">
        <AppButton className="flex-1" title="Cadastrar pet" onPress={() => navigation.navigate(ROUTES.RegisterPet)} />
        <AppButton className="flex-1" title="Dashboard" variant="secondary" onPress={() => navigation.navigate(ROUTES.Dashboard)} />
      </View>
      <PinkCard>
        <FlatList
          data={data?.pets || []}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id || item._id })}
            />
          )}
          refreshing={false}
          onRefresh={reload}
          ListEmptyComponent={<EmptyState message="Voce ainda nao cadastrou pets." />}
          ListFooterComponent={
            <View className="mt-2">
              <AppButton
                title={`Solicitacoes de adocao: ${data?.adoptions?.length || 0}`}
                variant="secondary"
                onPress={() => {
                  const first = data?.adoptions?.[0];
                  if (first?._id) navigation.navigate(ROUTES.Adoption, { adoptionId: first._id });
                }}
              />
            </View>
          }
        />
      </PinkCard>
    </AppScreen>
  );
}
