import React, { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import PetForm from "../components/forms/PetForm";
import AppScreen from "../components/ui/AppScreen";
import AppButton from "../components/ui/AppButton";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { initialPetFormState } from "../constants/petFormConstants";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../navigation/routeNames";
import { createPet } from "../services/petService";
import { uploadImage } from "../services/uploadService";
import { buildRegisterPetBody, validateRegisterPetForm } from "../utils/petRegisterPayload";

export default function RegisterPetScreen({ navigation }) {
  const { user, token } = useAuth();
  const [form, setForm] = useState(initialPetFormState);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const runSubmit = useCallback(async () => {
    if (!user?._id || !token) {
      Alert.alert("Sessão", "Faça login novamente.");
      return;
    }
    setSubmitting(true);
    try {
      const urls = [];
      for (const img of images) {
        if (/^https?:\/\//i.test(img.uri)) urls.push(img.uri);
        else {
          const u = await uploadImage(img.uri, { mimeType: img.mimeType, fileName: img.fileName });
          urls.push(u);
        }
      }
      const body = buildRegisterPetBody(form, urls, user._id);
      await createPet(body, token);
      Alert.alert("Sucesso", "Pet registrado com sucesso.", [
        {
          text: "OK",
          onPress: () => navigation.navigate(ROUTES.OngProfile, { ongId: user._id })
        }
      ]);
    } catch (err) {
      Alert.alert("Erro", err?.message || "Não foi possível registrar o pet.");
    } finally {
      setSubmitting(false);
    }
  }, [form, images, user, token, navigation]);

  const onSubmit = useCallback(() => {
    const e = validateRegisterPetForm(form, images.length);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    Alert.alert("Confirmar registro", "Tem certeza que todos os dados estão corretos?", [
      { text: "Revisar", style: "cancel" },
      { text: "Registrar pet", onPress: () => runSubmit() }
    ]);
  }, [form, images.length, runSubmit]);

  const onCancel = useCallback(() => {
    Alert.alert("Cancelar?", "Todos os dados preenchidos serão perdidos.", [
      { text: "Continuar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.goBack() }
    ]);
  }, [navigation]);

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScreenContent>
        <PageIntro title="Registrar novo pet" subtitle="Preencha os dados como no site — fotos e campos obrigatórios." />
        <PinkCard>
          <PetForm form={form} setForm={setForm} images={images} setImages={setImages} errors={errors} />
          <View className="mt-2">
            <AppButton title={submitting ? "Enviando..." : "Registrar pet"} onPress={onSubmit} disabled={submitting} />
            <AppButton className="mt-2" title="Cancelar" variant="secondary" onPress={onCancel} disabled={submitting} />
          </View>
        </PinkCard>
      </ScreenContent>
    </AppScreen>
  );
}
