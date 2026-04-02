import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppButton from "../components/ui/AppButton";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import { useAuth } from "../hooks/useAuth";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { deleteAdopter, getAdopterById } from "../services/adopterService";
import { ROUTES } from "../navigation/routeNames";

export default function AdopterProfileScreen({ route, navigation }) {
  const { adopterId } = route.params || {};
  const { user, token, logout } = useAuth();
  const [removing, setRemoving] = useState(false);
  const id = adopterId || user?._id;
  const { data: adopter, loading } = useAsyncTask(() => getAdopterById(id, token), [id, token]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <PageIntro title="Perfil do adotante" subtitle="Seus dados de conta e adocao" />

        <PinkCard className="items-center">
          {adopter?.profileImg || adopter?.avatar || adopter?.photo ? (
            <Image
              source={{ uri: adopter.profileImg || adopter.avatar || adopter.photo }}
              className="mb-3 h-24 w-24 rounded-full border-4 border-brand"
            />
          ) : (
            <View className="mb-3 h-24 w-24 items-center justify-center rounded-full border-4 border-brand bg-[#FBE6ED]">
              <Ionicons name="person" size={42} color="#D14D72" />
            </View>
          )}

          <Text className="text-center text-2xl font-bold text-brand">{adopter?.fullName || "Perfil do adotante"}</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-[#3E3540]">
            {adopter?.description || "Descricao nao disponivel."}
          </Text>

          <View className="mt-4 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Cidade</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{adopter?.city || "Cidade nao informada"}</Text>
          </View>
          <View className="mt-2 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Bairro</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{adopter?.neighborhood || adopter?.district || "Nao informado"}</Text>
          </View>
          <View className="mt-2 w-full rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Adotante seguro</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{adopter?.safeAdopter ? "Sim" : "Nao"}</Text>
          </View>
        </PinkCard>

        <PinkCard className="mt-3">
          <Text className="mb-2 text-base font-bold text-[#4C3A42]">Dados da conta</Text>
          <View className="mb-2 rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Email</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{adopter?.email || "Nao informado"}</Text>
          </View>
          <View className="mb-2 rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">CPF</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{adopter?.cpf || "Nao informado"}</Text>
          </View>
          <View className="rounded-2xl border border-[#F1D3DD] bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Telefone</Text>
            <Text className="mt-1 text-sm text-[#3E3540]">{adopter?.phone || "Nao informado"}</Text>
          </View>
        </PinkCard>

        <View className="mt-3 gap-2">
          <AppButton title="Editar perfil completo" onPress={() => navigation.navigate(ROUTES.EditUser)} />
          <AppButton
            title="Formulario de adotante seguro"
            variant="secondary"
            onPress={() => navigation.navigate(ROUTES.FormSafeAdopter)}
          />
          <AppButton
            title={removing ? "..." : "Deletar conta"}
            variant="danger"
            disabled={removing}
            onPress={async () => {
              try {
                setRemoving(true);
                await deleteAdopter(id, token);
                await logout();
                Alert.alert("Conta removida", "Sua conta foi excluida.");
              } catch (error) {
                Alert.alert("Falha", error.message);
              } finally {
                setRemoving(false);
              }
            }}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
