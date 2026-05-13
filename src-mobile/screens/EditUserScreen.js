import React, { useEffect, useState } from "react";
import { Alert, Image, Linking, ScrollView, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { getAdopterById, updateAdopterProfile } from "../services/adopterService";
import { lookupCep } from "../services/locationService";
import { uploadImage } from "../services/uploadService";
import { ROUTES } from "../navigation/routeNames";

const FALLBACK_AVATAR = "https://i.imgur.com/B2BFUeU.png";

export default function EditUserScreen({ navigation }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [noNumber, setNoNumber] = useState(false);
  const [pickedImageMeta, setPickedImageMeta] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    description: "",
    phone: "",
    profession: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    profileImg: "",
    email: ""
  });

  useEffect(() => {
    async function load() {
      try {
        const profile = await getAdopterById(user?._id, token);
        setForm({
          fullName: profile?.fullName || "",
          description: profile?.description || "",
          phone: profile?.phone || "",
          profession: profile?.profession || "",
          cep: profile?.cep || "",
          street: profile?.street || "",
          number: profile?.number || "",
          neighborhood: profile?.neighborhood || profile?.district || "",
          complement: profile?.complement || "",
          city: profile?.city || "",
          state: profile?.state || "",
          profileImg: profile?.profileImg || profile?.avatar || profile?.photo || "",
          email: profile?.email || "",
        });
        setNoNumber(String(profile?.number || "").toUpperCase() === "S/N");
        setPickedImageMeta(null);
      } finally {
        setLoading(false);
      }
    }
    load().catch(() => setLoading(false));
  }, [token, user?._id]);

  async function handlePickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso as fotos para alterar a imagem de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    setForm((prev) => ({ ...prev, profileImg: asset.uri }));
    setPickedImageMeta({
      mimeType: asset.mimeType || "image/jpeg",
      fileName: asset.fileName || `profile-${Date.now()}.jpg`
    });
  }

  async function handleLookupCep(value) {
    const sanitized = String(value || "").replace(/\D/g, "");
    if (sanitized.length !== 8) return;

    setLoadingCep(true);
    try {
      const data = await lookupCep(sanitized);
      if (data?.erro) {
        Alert.alert("CEP invalido", "Nao foi possivel localizar este CEP.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        cep: sanitized.replace(/(\d{5})(\d{3})/, "$1-$2"),
        street: data?.logradouro || "",
        neighborhood: data?.bairro || "",
        city: data?.localidade || "",
        state: data?.uf || ""
      }));
    } catch (error) {
      Alert.alert("Erro", error.message || "Nao foi possivel buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  }

  async function performSave() {
    if (!user?._id) {
      Alert.alert("Sessao invalida", "Faca login novamente.");
      return;
    }

    try {
      setSaving(true);
      let profileImgUrl = form.profileImg;
      const isLocalImage =
        profileImgUrl?.startsWith?.("file:") ||
        profileImgUrl?.startsWith?.("content:") ||
        profileImgUrl?.startsWith?.("ph://");

      if (isLocalImage) {
        profileImgUrl = await uploadImage(profileImgUrl, pickedImageMeta || {});
      }

      const payload = {
        fullName: form.fullName,
        description: form.description,
        phone: form.phone,
        profession: form.profession,
        cep: form.cep,
        street: form.street,
        number: noNumber ? "S/N" : form.number,
        neighborhood: form.neighborhood,
        complement: form.complement,
        city: form.city,
        state: form.state,
        profileImg: profileImgUrl
      };

      await updateAdopterProfile(user._id, payload, token);
      setPickedImageMeta(null);
      Alert.alert("Perfil atualizado", "Seus dados foram salvos com sucesso.", [
        {
          text: "OK",
          onPress: () => navigation.navigate(ROUTES.AdopterProfile, { adopterId: user._id })
        }
      ]);
    } catch (error) {
      Alert.alert("Falha", error.message || "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScrollView>
        <ScreenContent>
          <PageIntro title="Editar perfil" subtitle="Atualize suas informacoes de adotante" />
          <PinkCard>
            <Text className="mb-2 text-base font-bold text-[#4C3A42]">Sua foto de perfil</Text>
            <View className="mb-3 items-center">
              <Image
                source={{ uri: form.profileImg || FALLBACK_AVATAR }}
                className="h-36 w-36 rounded-full border-4 border-brand bg-white"
              />
            </View>
            <AppButton title="Selecionar foto" variant="secondary" onPress={handlePickImage} />

            <View className="mt-4">
              <AppInput
                label="Nome completo"
                value={form.fullName}
                onChangeText={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
              />
              <AppInput
                label="Telefone"
                value={form.phone}
                keyboardType="phone-pad"
                placeholder="(XX) XXXXX-XXXX"
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              />
              <AppInput
                label="Profissao"
                value={form.profession}
                placeholder="Digite sua profissao"
                onChangeText={(value) => setForm((prev) => ({ ...prev, profession: value }))}
              />
              <AppInput
                label="Descricao"
                value={form.description}
                placeholder="Descreva-se brevemente..."
                multiline
                numberOfLines={5}
                maxLength={500}
                onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
              />
              <Text className="-mt-1 mb-3 text-right text-xs text-[#8C6B79]">
                {(form.description || "").length}/500 caracteres
              </Text>
            </View>

            <Text className="mb-2 mt-1 text-base font-bold text-[#4C3A42]">Endereco</Text>
            <AppInput
              label="CEP"
              value={form.cep}
              keyboardType="number-pad"
              placeholder="00000-000"
              maxLength={9}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, cep: value }));
                if (value.replace(/\D/g, "").length === 8) {
                  handleLookupCep(value);
                }
              }}
            />
            <AppButton
              title={loadingCep ? "Buscando CEP..." : "Buscar CEP"}
              variant="secondary"
              disabled={loadingCep}
              onPress={() => handleLookupCep(form.cep)}
            />
            <AppButton
              className="mt-2"
              title="Nao sei meu CEP"
              variant="secondary"
              onPress={() => Linking.openURL("https://buscacepinter.correios.com.br/app/endereco/index.php")}
            />

            <View className="mt-3">
              <AppInput label="Rua" value={form.street} editable={false} />
              <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-borderSoft bg-white px-4 py-3">
                <View className="flex-1 pr-3">
                  <Text className="mb-1 text-sm text-textMain">Sem numero</Text>
                  <Text className="text-xs text-[#8C6B79]">Marque se o endereco nao possui numero.</Text>
                </View>
                <Switch
                  value={noNumber}
                  onValueChange={(value) => {
                    setNoNumber(value);
                    setForm((prev) => ({ ...prev, number: value ? "S/N" : "" }));
                  }}
                />
              </View>
              <AppInput
                label="Numero"
                value={noNumber ? "S/N" : form.number}
                editable={!noNumber}
                onChangeText={(value) => setForm((prev) => ({ ...prev, number: value }))}
              />
              <AppInput label="Bairro" value={form.neighborhood} editable={false} />
              <AppInput label="Cidade" value={form.city} editable={false} />
              <AppInput label="Estado" value={form.state} editable={false} />
              <AppInput
                label="Complemento"
                value={form.complement}
                onChangeText={(value) => setForm((prev) => ({ ...prev, complement: value }))}
              />
            </View>

            <View className="mt-2 rounded-2xl border border-[#F1D3DD] bg-white p-3">
              <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Email da conta</Text>
              <Text className="mt-1 text-sm text-[#3E3540]">{form.email || "Nao informado"}</Text>
            </View>

            <AppButton
              className="mt-4"
              title={saving ? "Salvando..." : "Salvar alteracoes"}
              disabled={saving}
              onPress={() =>
                Alert.alert(
                  "Confirmar alteracoes",
                  "Tem certeza que deseja salvar as alteracoes no perfil?",
                  [
                    { text: "Revisar", style: "cancel" },
                    { text: "Salvar", onPress: performSave }
                  ]
                )
              }
            />
            <AppButton
              className="mt-2"
              title="Cancelar"
              variant="danger"
              onPress={() =>
                Alert.alert("Cancelar edicao", "Todas as alteracoes nao salvas serao perdidas.", [
                  { text: "Continuar editando", style: "cancel" },
                  {
                    text: "Sair",
                    style: "destructive",
                    onPress: () => navigation.navigate(ROUTES.AdopterProfile, { adopterId: user?._id })
                  }
                ])
              }
            />
          </PinkCard>
        </ScreenContent>
      </ScrollView>
    </AppScreen>
  );
}
