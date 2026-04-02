import React from "react";
import { ScrollView, Text, View } from "react-native";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../hooks/useAuth";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getAdoptionsByOng } from "../services/adoptionService";
import { getPetsByOng } from "../services/petService";

function Bar({ label, value, max }) {
  const width = max > 0 ? `${Math.round((value / max) * 100)}%` : "0%";
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm text-textMain">{label}</Text>
      <View className="h-3 overflow-hidden rounded-full bg-gray-200">
        <View className="h-3 rounded-full bg-brand" style={{ width }} />
      </View>
      <Text className="mt-1 text-xs text-textMuted">{value}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, token } = useAuth();
  const { data, loading } = useAsyncTask(async () => {
    const [pets, adoptions] = await Promise.all([
      getPetsByOng(user?._id, token),
      getAdoptionsByOng(user?._id, token)
    ]);

    const safePets = Array.isArray(pets) ? pets : [];
    const safeAdoptions = Array.isArray(adoptions) ? adoptions : [];

    const adopted = safePets.filter((pet) => pet.status?.toLowerCase().includes("adot")).length;
    const available = safePets.filter((pet) => pet.status?.toLowerCase().includes("dispon")).length;
    const pending = safeAdoptions.filter((item) => item.status?.toLowerCase().includes("pend")).length;
    const approved = safeAdoptions.filter((item) => item.status?.toLowerCase().includes("apro")).length;

    return { pets: safePets, adoptions: safeAdoptions, adopted, available, pending, approved };
  }, [token, user?._id]);

  if (loading) return <LoadingView />;

  const maxBar = Math.max(data.adopted, data.available, data.pending, data.approved, 1);

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScrollView>
        <PageIntro title="Dashboard da ONG" subtitle="Indicadores principais da sua operacao" />
        <View className="mb-3 flex-row">
          <StatCard label="Pets" value={data.pets.length} />
          <StatCard label="Adocoes" value={data.adoptions.length} />
        </View>
        <View className="mb-3 flex-row">
          <StatCard label="Disponiveis" value={data.available} />
          <StatCard label="Adotados" value={data.adopted} />
        </View>
        <PinkCard>
          <Text className="mb-3 text-lg font-bold text-textMain">Distribuicao</Text>
          <Bar label="Pets disponiveis" value={data.available} max={maxBar} />
          <Bar label="Pets adotados" value={data.adopted} max={maxBar} />
          <Bar label="Solicitacoes pendentes" value={data.pending} max={maxBar} />
          <Bar label="Solicitacoes aprovadas" value={data.approved} max={maxBar} />
        </PinkCard>
      </ScrollView>
    </AppScreen>
  );
}
