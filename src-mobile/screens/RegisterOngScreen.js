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
import { uploadImage } from "../services/uploadService";

export default function RegisterOngScreen({ navigation }) {
  const { registerOng } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cnpj: "",
    description: "",
    logo: ""
  });
  const [submitting, setSubmitting] = useState(false);

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });
    if (result.canceled) return;
    const url = await uploadImage(result.assets[0].uri);
    setForm((prev) => ({ ...prev, logo: url }));
  }

  return (
    <AppScreen navigation={navigation} showTopNav={false}>
      <ScreenContent>
        <PageIntro title="Cadastro de ONG" subtitle="Crie sua conta de organizacao" />
        <PinkCard>
          <AppInput label="Nome da ONG" value={form.name} onChangeText={(value) => setForm((p) => ({ ...p, name: value }))} />
          <AppInput label="Email" value={form.email} onChangeText={(value) => setForm((p) => ({ ...p, email: value }))} />
          <AppInput label="Senha" value={form.password} secureTextEntry onChangeText={(value) => setForm((p) => ({ ...p, password: value }))} />
          <AppInput label="CNPJ" value={form.cnpj} onChangeText={(value) => setForm((p) => ({ ...p, cnpj: value }))} />
          <AppInput
            label="Descricao"
            value={form.description}
            onChangeText={(value) => setForm((p) => ({ ...p, description: value }))}
            multiline
            numberOfLines={4}
          />
          <AppButton title={form.logo ? "Logo selecionada" : "Selecionar logo"} variant="secondary" onPress={pickLogo} />
          <AppButton
            className="mt-2"
            title={submitting ? "Cadastrando..." : "Cadastrar ONG"}
            onPress={async () => {
              if (!form.name || !form.email || !form.password) {
                Alert.alert("Campos obrigatorios", "Preencha nome, email e senha.");
                return;
              }
              try {
                setSubmitting(true);
                await registerOng(form);
                Alert.alert("ONG cadastrada", "Agora realize o login.");
                navigation.goBack();
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
