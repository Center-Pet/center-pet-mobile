import React, { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { updateSafeAdopter } from "../services/adopterService";
import { uploadImage } from "../services/uploadService";

export default function FormSafeAdopterScreen({ navigation }) {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    adopterId: user?._id,
    profession: "",
    monthlyIncome: "",
    residenceType: "",
    hasOtherPets: "",
    reason: "",
    photo: ""
  });
  const [submitting, setSubmitting] = useState(false);

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScreenContent>
        <PageIntro
          title="Formulario adotante seguro"
          subtitle="Preencha para aumentar sua confianca na plataforma"
        />
        <PinkCard>
          <AppInput label="Profissao" value={form.profession} onChangeText={(value) => setForm((p) => ({ ...p, profession: value }))} />
          <AppInput label="Renda mensal" value={form.monthlyIncome} onChangeText={(value) => setForm((p) => ({ ...p, monthlyIncome: value }))} />
          <AppInput label="Tipo de residencia" value={form.residenceType} onChangeText={(value) => setForm((p) => ({ ...p, residenceType: value }))} />
          <AppInput label="Possui outros pets?" value={form.hasOtherPets} onChangeText={(value) => setForm((p) => ({ ...p, hasOtherPets: value }))} />
          <AppInput
            label="Motivacao para adocao"
            value={form.reason}
            onChangeText={(value) => setForm((p) => ({ ...p, reason: value }))}
            multiline
            numberOfLines={4}
          />
          <AppButton
            title={form.photo ? "Foto anexada" : "Anexar foto da residencia"}
            variant="secondary"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
              });
              if (result.canceled) return;
              const url = await uploadImage(result.assets[0].uri);
              setForm((p) => ({ ...p, photo: url }));
            }}
          />
          <AppButton
            className="mt-2"
            title={submitting ? "Enviando..." : "Enviar formulario"}
            onPress={async () => {
              try {
                setSubmitting(true);
                await updateSafeAdopter(form, token);
                Alert.alert("Formulario enviado", "Sua solicitacao foi registrada.");
              } catch (error) {
                Alert.alert("Falha", error.message);
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </PinkCard>
      </ScreenContent>
    </AppScreen>
  );
}
