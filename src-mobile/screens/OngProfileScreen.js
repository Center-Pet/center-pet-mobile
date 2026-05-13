import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
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
import { getOngById, getOngBySlug } from "../services/ongService";
import { getPetsByOng } from "../services/petService";

export default function OngProfileScreen({ route, navigation }) {
  const { ongId, ongSlug } = route.params || {};
  const { user, userType, token } = useAuth();
  const { data, loading, reload } = useAsyncTask(async () => {
    const ong = ongId ? await getOngById(ongId, token) : await getOngBySlug(ongSlug, token);
    if (!ong?._id) return { ong: null, pets: [] };
    const pets = await getPetsByOng(ong._id, token);
    return { ong, pets };
  }, [ongId, ongSlug, token]);

  if (loading) return <LoadingView />;
  if (!data?.ong) return <EmptyState message="ONG nao encontrada." />;

  const ong = data.ong;
  const pets = Array.isArray(data.pets) ? data.pets : [];
  const isOwner = (userType === "Ong" || userType === "ONG") && user?._id === ong._id;
  const addr = ong?.address || {};
  const cityDisplay = addr.city || ong?.city || "Cidade nao informada";
  const stateDisplay = addr.uf || ong?.state || "Nao informado";
  const cepDisplay = addr.cep || ong?.cep || "Nao informado";
  const streetLine = [addr.street, addr.number, addr.neighborhood].filter(Boolean).join(", ") || "Endereco nao informado";

  return (
    <AppScreen navigation={navigation} activeTab="catalog">
      <ScrollView
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <PageIntro title="Perfil da ONG" subtitle="Informacoes da organizacao e pets cadastrados" />

        <PinkCard className="items-center">
          {ong?.image || ong?.profileImg || ong?.avatar ? (
            <Image
              source={{ uri: ong.image || ong.profileImg || ong.avatar }}
              className="mb-3 h-24 w-24 rounded-full border-4 border-brand"
            />
          ) : (
            <View className="mb-3 h-24 w-24 items-center justify-center rounded-full border-4 border-brand bg-[#FBE6ED]">
              <Text className="text-2xl font-bold text-brand">ONG</Text>
            </View>
          )}

          <Text className="text-center text-2xl font-bold text-brand">{ong?.name || "ONG"}</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-[#3E3540]">
            {ong?.description || "Esta ONG ainda nao cadastrou uma descricao."}
          </Text>

          <View className="mt-4 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Endereco</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{streetLine}</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">
              {cityDisplay} / {stateDisplay} — CEP {cepDisplay}
            </Text>
          </View>
          {ong?.role ? (
            <View className="mt-2 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
              <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Tipo de organizacao</Text>
              <Text className="mt-1 text-sm text-[#3E3540]">{ong.role}</Text>
            </View>
          ) : null}
          {ong?.role === "Projeto" && ong.collaborators != null ? (
            <View className="mt-2 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
              <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Colaboradores</Text>
              <Text className="mt-1 text-sm text-[#3E3540]">{String(ong.collaborators)}</Text>
            </View>
          ) : null}
        </PinkCard>

        {isOwner ? (
          <View className="mt-3 gap-2">
            <AppButton title="Editar perfil da ONG" onPress={() => navigation.navigate(ROUTES.EditOrg)} />
            <AppButton title="Dashboard da ONG" variant="secondary" onPress={() => navigation.navigate(ROUTES.Dashboard)} />
            <AppButton title="Atualizar lista de pets" variant="secondary" onPress={reload} />
          </View>
        ) : (
          <View className="mt-3">
            <AppButton title="Atualizar lista de pets" variant="secondary" onPress={reload} />
          </View>
        )}

        <View className="mt-4">
          <Text className="mb-2 text-2xl font-bold text-[#1E1720]">Pets da ONG</Text>
          {pets.length ? (
            pets.map((item) => (
              <PetCard
                key={item.id || item._id}
                pet={item}
                onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id || item._id })}
              />
            ))
          ) : (
            <EmptyState message="Nenhum pet cadastrado para esta ONG." />
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
