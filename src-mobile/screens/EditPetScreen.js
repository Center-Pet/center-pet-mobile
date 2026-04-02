import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PetForm from "../components/forms/PetForm";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { getPetById, updatePet } from "../services/petService";
import { uploadImage } from "../services/uploadService";

export default function EditPetScreen({ route, navigation }) {
  const { petId } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "",
    age: "",
    status: "",
    specialCondition: "",
    image: ""
  });

  useEffect(() => {
    async function load() {
      try {
        const pet = await getPetById(petId);
        setForm({
          name: pet.name || "",
          type: pet.type || "",
          age: pet.age || "",
          status: pet.status || "Disponível",
          specialCondition: pet.specialCondition || "",
          image: pet.image || ""
        });
      } finally {
        setLoading(false);
      }
    }

    load().catch(() => setLoading(false));
  }, [petId]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScreenContent>
        <PageIntro title="Editar pet" subtitle="Atualize os dados do pet" />
        <PinkCard>
          <PetForm
            form={form}
            setForm={setForm}
            onPickImage={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
              });
              if (result.canceled) return;
              const url = await uploadImage(result.assets[0].uri);
              setForm((prev) => ({ ...prev, image: url }));
            }}
            submitLabel="Salvar alteracoes"
            onSubmit={async () => {
              try {
                await updatePet(
                  petId,
                  {
                    ...form,
                    image: form.image ? [form.image] : [],
                    health: { specialCondition: form.specialCondition || "Nenhuma" }
                  },
                  token
                );
                Alert.alert("Pet atualizado", "Dados atualizados com sucesso.");
                navigation.goBack();
              } catch (error) {
                Alert.alert("Falha", error.message);
              }
            }}
          />
        </PinkCard>
      </ScreenContent>
    </AppScreen>
  );
}
