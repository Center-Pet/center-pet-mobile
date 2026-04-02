import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { getOngById, updateOngProfile } from "../services/ongService";
import { uploadImage } from "../services/uploadService";

export default function EditOrgScreen({ navigation }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    logo: ""
  });

  useEffect(() => {
    async function load() {
      try {
        const profile = await getOngById(user?._id, token);
        setForm({
          name: profile?.name || "",
          email: profile?.email || "",
          description: profile?.description || "",
          logo: profile?.logo || profile?.image || ""
        });
      } finally {
        setLoading(false);
      }
    }
    load().catch(() => setLoading(false));
  }, [token, user?._id]);

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScreenContent>
        <PageIntro title="Editar ONG" subtitle="Atualize os dados da sua organizacao" />
        <PinkCard>
          <AppInput label="Nome" value={form.name} onChangeText={(value) => setForm((p) => ({ ...p, name: value }))} />
          <AppInput label="Email" value={form.email} onChangeText={(value) => setForm((p) => ({ ...p, email: value }))} />
          <AppInput
            label="Descricao"
            value={form.description}
            onChangeText={(value) => setForm((p) => ({ ...p, description: value }))}
            multiline
            numberOfLines={4}
          />
          <AppButton
            title="Trocar logo"
            variant="secondary"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
              });
              if (result.canceled) return;
              const url = await uploadImage(result.assets[0].uri);
              setForm((p) => ({ ...p, logo: url }));
            }}
          />
          <AppButton
            className="mt-2"
            title={saving ? "Salvando..." : "Salvar alteracoes"}
            onPress={async () => {
              try {
                setSaving(true);
                await updateOngProfile(user._id, form, token);
                Alert.alert("Perfil atualizado", "Dados da ONG salvos com sucesso.");
              } catch (error) {
                Alert.alert("Falha", error.message);
              } finally {
                setSaving(false);
              }
            }}
          />
        </PinkCard>
      </ScreenContent>
    </AppScreen>
  );
}
