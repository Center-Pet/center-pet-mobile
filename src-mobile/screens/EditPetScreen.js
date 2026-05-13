import React, { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import PetForm from "../components/forms/PetForm";
import AppScreen from "../components/ui/AppScreen";
import AppButton from "../components/ui/AppButton";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { collectPetImageList, MAX_PET_IMAGES, petToFormState } from "../constants/petFormConstants";
import { useAuth } from "../hooks/useAuth";
import { getPetById, updatePet } from "../services/petService";
import { uploadImage } from "../services/uploadService";
import { buildUpdatePetBody, validateUpdatePetForm } from "../utils/petRegisterPayload";

function newImageId() {
  return `pet-img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function EditPetScreen({ route, navigation }) {
  const { petId } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => petToFormState(null));
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const pet = await getPetById(petId);
        if (cancelled) return;
        setForm(petToFormState(pet));
        const urls = collectPetImageList(pet).slice(0, MAX_PET_IMAGES);
        setImages(urls.map((uri) => ({ id: newImageId(), uri })));
      } catch {
        if (!cancelled) Alert.alert("Erro", "Não foi possível carregar o pet.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [petId]);

  const runSave = useCallback(async () => {
    if (!token) {
      Alert.alert("Sessão", "Faça login novamente.");
      return;
    }
    if (images.length === 0) {
      Alert.alert("Fotos", "Mantenha pelo menos uma foto do pet.");
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
      const body = buildUpdatePetBody(form, urls);
      await updatePet(petId, body, token);
      Alert.alert("Pet atualizado", "Dados atualizados com sucesso.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert("Falha", err?.message || "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  }, [form, images, petId, token, navigation]);

  const onSubmit = useCallback(() => {
    const e = validateUpdatePetForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    Alert.alert("Confirmar alterações", "Salvar os dados do pet?", [
      { text: "Revisar", style: "cancel" },
      { text: "Salvar", onPress: () => runSave() }
    ]);
  }, [form, runSave]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScreenContent>
        <PageIntro title="Editar pet" subtitle="Mesmos campos e fotos que no cadastro web." />
        <PinkCard>
          <PetForm form={form} setForm={setForm} images={images} setImages={setImages} errors={errors} />
          <View className="mt-2">
            <AppButton title={submitting ? "Salvando..." : "Salvar alterações"} onPress={onSubmit} disabled={submitting} />
          </View>
        </PinkCard>
      </ScreenContent>
    </AppScreen>
  );
}
