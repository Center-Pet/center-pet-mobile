import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { getAdopterById, updateSafeAdopter } from "../services/adopterService";
import { uploadImage } from "../services/uploadService";

const MAX_ENV_PHOTOS = 6;
const MIN_ENV_PHOTOS = 2;

function stripProfileForPatch(profile) {
  if (!profile || typeof profile !== "object") return {};
  const skip = new Set(["password", "__v"]);
  return Object.fromEntries(Object.entries(profile).filter(([k]) => !skip.has(k)));
}

export default function FormSafeAdopterScreen({ navigation }) {
  const { user, token, mergeSessionUser } = useAuth();
  const [profileBase, setProfileBase] = useState({});
  const [form, setForm] = useState({
    profession: "",
    monthlyIncome: "",
    residenceType: "",
    hasOtherPets: "",
    reason: ""
  });
  const [environmentAssets, setEnvironmentAssets] = useState([]);
  const [declaration, setDeclaration] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?._id || !token) {
        setLoadingProfile(false);
        return;
      }
      try {
        const profile = await getAdopterById(user._id, token);
        if (cancelled) return;
        setProfileBase(stripProfileForPatch(profile));
        setForm({
          profession: profile?.profession || "",
          monthlyIncome: profile?.monthlyIncome || "",
          residenceType: profile?.housingType || profile?.residenceType || "",
          hasOtherPets: profile?.hasOrHadPets || profile?.hasOtherPets || "",
          reason: profile?.reasonToAdopt || profile?.reason || ""
        });
        const existing = Array.isArray(profile?.environmentImages) ? profile.environmentImages.filter(Boolean) : [];
        setEnvironmentAssets(
          existing.slice(0, MAX_ENV_PHOTOS).map((uri, i) => ({
            uri: String(uri).replace(/^http:/, "https:"),
            mimeType: "image/jpeg",
            fileName: `existente-${i}.jpg`,
            isRemote: true
          }))
        );
      } catch {
        if (!cancelled) setProfileBase(stripProfileForPatch(user));
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?._id, token]);

  async function addEnvironmentPhoto() {
    if (environmentAssets.length >= MAX_ENV_PHOTOS) {
      Alert.alert("Limite", `Voce pode enviar ate ${MAX_ENV_PHOTOS} fotos do ambiente.`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso as fotos para anexar imagens da residencia.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85
    });
    if (result.canceled || !result.assets?.[0]) return;
    const a = result.assets[0];
    setEnvironmentAssets((prev) => [
      ...prev,
      {
        uri: a.uri,
        mimeType: a.mimeType || "image/jpeg",
        fileName: a.fileName || `residence-${Date.now()}.jpg`,
        isRemote: false
      }
    ]);
  }

  function removeEnvironmentPhoto(index) {
    setEnvironmentAssets((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenContent>
          <PageIntro
            title="Formulario adotante seguro"
            subtitle="Preencha os dados e anexe pelo menos duas fotos do ambiente onde o pet vivera"
          />
          <PinkCard>
            <AppInput
              label="Profissao"
              value={form.profession}
              onChangeText={(value) => setForm((p) => ({ ...p, profession: value }))}
            />
            <AppInput
              label="Renda mensal"
              value={form.monthlyIncome}
              onChangeText={(value) => setForm((p) => ({ ...p, monthlyIncome: value }))}
            />
            <AppInput
              label="Tipo de residencia"
              value={form.residenceType}
              onChangeText={(value) => setForm((p) => ({ ...p, residenceType: value }))}
            />
            <AppInput
              label="Possui outros pets?"
              value={form.hasOtherPets}
              onChangeText={(value) => setForm((p) => ({ ...p, hasOtherPets: value }))}
            />
            <AppInput
              label="Motivacao para adocao"
              value={form.reason}
              onChangeText={(value) => setForm((p) => ({ ...p, reason: value }))}
              multiline
              numberOfLines={4}
            />

            <Text className="mb-1 mt-2 text-xs font-semibold uppercase text-[#8C6B79]">
              Fotos do ambiente (minimo {MIN_ENV_PHOTOS})
            </Text>
            <Text className="mb-2 text-xs leading-5 text-[#6B5A64]">
              O envio usa o mesmo fluxo do site (campo environmentImages no servidor), com upload ao confirmar o formulario.
            </Text>
            <AppButton title="Adicionar foto da residencia" variant="secondary" onPress={addEnvironmentPhoto} disabled={loadingProfile} />
            <Text className="mt-2 text-sm text-[#3E3540]">
              {environmentAssets.length} foto(s) selecionada(s)
              {environmentAssets.length < MIN_ENV_PHOTOS ? ` — faltam ${MIN_ENV_PHOTOS - environmentAssets.length}.` : ""}
            </Text>
            {environmentAssets.map((asset, index) => (
              <View
                key={`${asset.uri}-${index}`}
                className="mt-2 flex-row items-center justify-between rounded-xl border border-[#F1D3DD] bg-white px-3 py-2"
              >
                <Text className="flex-1 pr-2 text-xs text-[#3E3540]" numberOfLines={1}>
                  {asset.isRemote ? "Foto ja salva na conta" : asset.fileName}
                </Text>
                <Pressable onPress={() => removeEnvironmentPhoto(index)} className="rounded-lg bg-red-50 px-2 py-1">
                  <Text className="text-xs font-semibold text-red-700">Remover</Text>
                </Pressable>
              </View>
            ))}

            <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-[#F1D3DD] bg-white px-3 py-3">
              <Text className="max-w-[80%] pr-2 text-sm text-[#3E3540]">
                Confirmo que as informacoes sao verdadeiras e aceito as declaracoes do programa adotante seguro.
              </Text>
              <Switch value={declaration} onValueChange={setDeclaration} />
            </View>

            <AppButton
              className="mt-4"
              title={submitting ? "Enviando..." : "Enviar formulario"}
              disabled={submitting || loadingProfile}
              onPress={async () => {
                if (!user?._id) {
                  Alert.alert("Sessao", "Faca login novamente.");
                  return;
                }
                if (environmentAssets.length < MIN_ENV_PHOTOS) {
                  Alert.alert("Fotos insuficientes", `Adicione pelo menos ${MIN_ENV_PHOTOS} fotos do ambiente.`);
                  return;
                }
                if (!declaration) {
                  Alert.alert("Confirmacao necessaria", "Ative a confirmacao das declaracoes para enviar.");
                  return;
                }
                try {
                  setSubmitting(true);
                  const urls = [];
                  for (const asset of environmentAssets) {
                    if (asset.isRemote || /^https?:\/\//i.test(asset.uri)) {
                      urls.push(String(asset.uri).replace(/^http:/, "https:"));
                    } else {
                      urls.push(await uploadImage(asset.uri, { mimeType: asset.mimeType, fileName: asset.fileName }));
                    }
                  }

                  const dataToSend = {
                    ...profileBase,
                    profession: form.profession,
                    monthlyIncome: form.monthlyIncome,
                    housingType: form.residenceType,
                    hasOrHadPets: form.hasOtherPets,
                    reasonToAdopt: form.reason,
                    environmentImages: urls,
                    email: user.email,
                    _id: user._id,
                    petsAllowed: true,
                    homeSafety: true,
                    allergy: false,
                    familyAgreement: true,
                    willingToTrain: true,
                    keepVaccinesUpToDate: true,
                    regularVetVisits: true,
                    financialConditions: true,
                    awareOfLaw: true,
                    commitToNeverAbandon: true,
                    returnToOng: true,
                    awareOfResponsibilities: true,
                    finalDeclarationAgreement: true,
                    safeAdopter: true
                  };

                  await updateSafeAdopter(dataToSend, token);
                  await mergeSessionUser({ safeAdopter: true });
                  Alert.alert("Formulario enviado", "Sua solicitacao foi registrada.", [{ text: "OK", onPress: () => navigation.goBack() }]);
                } catch (error) {
                  Alert.alert("Falha", error.message);
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </PinkCard>
        </ScreenContent>
      </ScrollView>
    </AppScreen>
  );
}
