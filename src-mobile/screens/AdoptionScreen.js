import React from "react";
import { Alert, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import { useAuth } from "../hooks/useAuth";
import {
  acceptAdoption,
  getAdoptionById,
  rejectAdoption,
  updateAdoption
} from "../services/adoptionService";
import { updatePet } from "../services/petService";

export default function AdoptionScreen({ route, navigation }) {
  const { adoptionId } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [adoption, setAdoption] = React.useState(null);

  React.useEffect(() => {
    getAdoptionById(adoptionId, token)
      .then(setAdoption)
      .finally(() => setLoading(false));
  }, [adoptionId, token]);

  if (loading) return <LoadingView />;
  if (!adoption)
    return (
      <AppScreen navigation={navigation} activeTab="form">
        <Text className="text-textMuted">Adocao nao encontrada.</Text>
      </AppScreen>
    );

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <PageIntro title="Detalhes da adocao" subtitle={`Status: ${adoption.status || "Pendente"}`} />
      <PinkCard className="mb-3">
        <Text className="text-textMain">Pet: {adoption.pet?.name || adoption.petName || adoption.petId}</Text>
        <Text className="mt-1 text-textMain">
          Adotante: {adoption.user?.fullName || adoption.adopter?.fullName || adoption.userId}
        </Text>
      </PinkCard>
      <AppButton
        title="Aceitar adocao"
        onPress={async () => {
          try {
            await acceptAdoption(adoptionId, token);
            if (adoption.pet?._id || adoption.petId) {
              await updatePet(adoption.pet?._id || adoption.petId, { status: "Adotado" }, token);
            }
            Alert.alert("Aprovada", "A adocao foi aprovada.");
          } catch (error) {
            Alert.alert("Falha", error.message);
          }
        }}
      />
      <AppButton
        className="mt-2"
        title="Rejeitar adocao"
        variant="danger"
        onPress={async () => {
          try {
            await rejectAdoption(adoptionId, token);
            Alert.alert("Rejeitada", "A adocao foi rejeitada.");
          } catch (error) {
            Alert.alert("Falha", error.message);
          }
        }}
      />
      <AppButton
        className="mt-2"
        title="Marcar em acompanhamento"
        variant="secondary"
        onPress={async () => {
          try {
            await updateAdoption(adoptionId, { status: "Em acompanhamento" }, token);
            Alert.alert("Atualizada", "Status da adocao atualizado.");
          } catch (error) {
            Alert.alert("Falha", error.message);
          }
        }}
      />
    </AppScreen>
  );
}
