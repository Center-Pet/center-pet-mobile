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
  const { user, userType } = useAuth();
  const { data, loading, reload } = useAsyncTask(async () => {
    const ong = ongId ? await getOngById(ongId) : await getOngBySlug(ongSlug);
    if (!ong?._id) return { ong: null, pets: [] };
    const pets = await getPetsByOng(ong._id);
    return { ong, pets };
  }, [ongId, ongSlug]);

  if (loading) return <LoadingView />;
  if (!data?.ong) return <EmptyState message="ONG nao encontrada." />;

  const ong = data.ong;
  const pets = Array.isArray(data.pets) ? data.pets : [];
  const isOwner = (userType === "Ong" || userType === "ONG") && user?._id === ong._id;

  return (
    <AppScreen navigation={navigation} activeTab="catalog">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Cidade</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{ong?.city || "Cidade nao informada"}</Text>
          </View>
          <View className="mt-2 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Estado</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{ong?.state || "Nao informado"}</Text>
          </View>
          <View className="mt-2 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Telefone</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{ong?.phone || "Nao informado"}</Text>
          </View>
        </PinkCard>

        <PinkCard className="mt-3">
          <Text className="mb-2 text-base font-bold text-[#4C3A42]">Dados da ONG</Text>
          <View className="mb-2 rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Email</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{ong?.email || "Nao informado"}</Text>
          </View>
          <View className="mb-2 rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">CNPJ</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{ong?.cnpj || "Nao informado"}</Text>
          </View>
          <View className="rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Site / Rede social</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{ong?.website || ong?.instagram || "Nao informado"}</Text>
          </View>
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
