import React, { useMemo } from "react";
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { getOngById } from "../services/ongService";
import { getPetsByOng } from "../services/petService";
import { computeOngDashboardStats } from "../utils/ongDashboardStats";

function StatMini({ icon, label, value }) {
  return (
    <View className="mb-2 min-w-[108px] flex-1 rounded-2xl border border-[#F0D0DB] bg-white p-3">
      <Ionicons name={icon} size={18} color="#D14D72" />
      <Text className="mt-1 text-2xl font-bold text-brand">{value}</Text>
      <Text className="text-[10px] font-semibold uppercase leading-3 text-[#8C6B79]">{label}</Text>
    </View>
  );
}

export default function HomeOngScreen({ navigation }) {
  const { user, token } = useAuth();
  const { data, loading, reload } = useAsyncTask(async () => {
    const ongId = user?._id;
    if (!ongId || !token) {
      return { ong: null, pets: [], adoptions: [] };
    }
    const [ong, pets, adoptions] = await Promise.all([
      getOngById(ongId, token),
      getPetsByOng(ongId, token),
      getAdoptionsByOng(ongId, token)
    ]);
    return { ong, pets, adoptions };
  }, [user?._id, token]);

  const stats = useMemo(
    () => computeOngDashboardStats(data?.pets, data?.adoptions),
    [data?.pets, data?.adoptions]
  );

  const ong = data?.ong;
  const pets = Array.isArray(data?.pets) ? data.pets : [];
  const adoptions = Array.isArray(data?.adoptions) ? data.adoptions : [];
  const petsRecent = useMemo(() => [...pets].reverse().slice(0, 8), [pets]);

  const addr = ong?.address || {};
  const cityLine =
    addr.city || ong?.city
      ? `${addr.city || ong?.city || ""}${addr.uf || ong?.state ? ` / ${addr.uf || ong?.state}` : ""}`
      : null;

  const ongImageUri = ong?.image || ong?.profileImg || ong?.avatar;

  if (loading && data == null) return <LoadingView />;

  if (!user?._id) {
    return (
      <AppScreen navigation={navigation} activeTab="home">
        <PinkCard>
          <Text className="text-center text-textMain">Nao foi possivel identificar a ONG logada.</Text>
        </PinkCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen navigation={navigation} activeTab="home">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={Boolean(loading && data)} onRefresh={() => reload().catch(() => {})} />
        }
      >
        <PageIntro title="Area da ONG" subtitle="Gerencie pets, solicitacoes e acompanhe seus numeros" />

        <PinkCard className="mb-3">
          <View className="flex-row items-start gap-3">
            {ongImageUri ? (
              <Image source={{ uri: ongImageUri }} className="h-20 w-20 rounded-2xl border border-[#EAC3D0] bg-gray-100" />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-2xl border border-brand bg-[#FBE6ED]">
                <Text className="text-lg font-bold text-brand">ONG</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xl font-bold text-brand">Bem-vinda, {ong?.name || "ONG"}!</Text>
              {cityLine ? (
                <Text className="mt-1 text-sm text-[#6B5A64]">
                  <Text className="font-semibold text-[#4C3A42]">Cidade: </Text>
                  {cityLine}
                </Text>
              ) : (
                <Text className="mt-1 text-sm text-[#6B5A64]">Complete o endereco no perfil para exibir a cidade aqui.</Text>
              )}
              {ong?.description ? (
                <Text className="mt-2 text-sm leading-5 text-[#3E3540]" numberOfLines={4}>
                  {ong.description}
                </Text>
              ) : (
                <Text className="mt-2 text-sm text-textMuted">Cadastre uma descricao no perfil da ONG.</Text>
              )}
            </View>
          </View>
        </PinkCard>

        <Text className="mb-2 text-lg font-bold text-textMain">Resumo</Text>
        <View className="mb-3 flex-row flex-wrap gap-2">
          <StatMini icon="paw-outline" label="Pets cadastrados" value={String(stats.totalPets)} />
          <StatMini icon="heart-outline" label="Pets adotados" value={String(stats.adoptedPets)} />
          <StatMini icon="search-outline" label="Disponiveis" value={String(stats.availablePets)} />
          <StatMini icon="time-outline" label="Adocoes pendentes" value={String(stats.pendingAdoptions)} />
          <StatMini icon="hourglass-outline" label="Tempo medio espera" value={stats.avgWaitingLabel} />
        </View>

        <Text className="mb-2 text-lg font-bold text-textMain">Acoes rapidas</Text>
        <View className="mb-3 gap-2">
          <AppButton title="Cadastrar novo pet" onPress={() => navigation.navigate(ROUTES.RegisterPet)} />
          <AppButton
            title="Ver meu perfil publico"
            variant="secondary"
            onPress={() =>
              navigation.navigate(ROUTES.OngProfile, { ongId: user._id, ongSlug: ong?.slug })
            }
          />
          <AppButton
            title="Editar dados da ONG"
            variant="secondary"
            onPress={() => navigation.navigate(ROUTES.EditOrg)}
          />
          <AppButton
            title="Painel completo (graficos)"
            variant="secondary"
            onPress={() => navigation.navigate(ROUTES.Dashboard)}
          />
          <AppButton title="Explorar catalogo publico" variant="secondary" onPress={() => navigation.navigate(ROUTES.Catalog)} />
        </View>

        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-textMain">Meus pets</Text>
          <Text className="text-xs text-textMuted">{pets.length} total</Text>
        </View>
        <PinkCard className="mb-3">
          {petsRecent.length ? (
            petsRecent.map((item) => (
              <PetCard
                key={String(item.id || item._id)}
                pet={item}
                onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id || item._id, initialPet: item })}
              />
            ))
          ) : (
            <EmptyState message="Voce ainda nao cadastrou pets." />
          )}
        </PinkCard>

        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-textMain">Solicitacoes de adocao</Text>
          <Text className="text-xs text-textMuted">{adoptions.length} total</Text>
        </View>
        <PinkCard className="mb-6">
          {adoptions.length ? (
            adoptions.map((ad) => {
              const id = ad._id || ad.id;
              const petName = ad.pet?.name || ad.petName || "Pet";
              const adopterName = ad.user?.fullName || ad.adopter?.fullName || "Adotante";
              return (
                <Pressable
                  key={String(id)}
                  onPress={() => id && navigation.navigate(ROUTES.Adoption, { adoptionId: id })}
                  className="mb-2 rounded-2xl border border-[#F1D3DD] bg-white px-3 py-3 active:opacity-80"
                >
                  <Text className="text-sm font-semibold text-textMain">{petName}</Text>
                  <Text className="mt-1 text-xs text-textMuted">{adopterName}</Text>
                  <Text className="mt-1 text-xs font-medium text-brand">Status: {ad.status || "—"}</Text>
                  <Text className="mt-2 text-xs text-brand underline">Abrir detalhes</Text>
                </Pressable>
              );
            })
          ) : (
            <EmptyState message="Nenhuma solicitacao de adocao no momento." />
          )}
        </PinkCard>
      </ScrollView>
    </AppScreen>
  );
}
