import React, { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PetForm from "../components/forms/PetForm";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { createPet } from "../services/petService";
import { uploadImage } from "../services/uploadService";

export default function RegisterPetScreen({ navigation }) {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    type: "",
    age: "",
    status: "Disponível",
    specialCondition: "",
    image: ""
  });

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScreenContent>
        <PageIntro title="Cadastrar pet" subtitle="Adicione um novo pet para adocao" />
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
            submitLabel="Salvar pet"
            onSubmit={async () => {
              try {
                const payload = {
                  ...form,
                  ongId: user?._id,
                  image: form.image ? [form.image] : [],
                  health: { specialCondition: form.specialCondition || "Nenhuma" }
                };
                await createPet(payload, token);
                Alert.alert("Pet cadastrado", "Cadastro realizado com sucesso.");
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
