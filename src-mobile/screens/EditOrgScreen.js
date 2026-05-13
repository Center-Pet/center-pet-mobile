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
import { getOngById, updateOngProfile } from "../services/ongService";
import { lookupCep } from "../services/locationService";
import { uploadImage } from "../services/uploadService";
import { ROUTES } from "../navigation/routeNames";

const FALLBACK_IMG = "https://i.imgur.com/B2BFUeU.png";

function formatSocialMediaUrl(url, platform) {
  let v = String(url || "").trim();
  if (!v) return "";
  if (v.match(/^https?:\/\//)) return v;
  if (v.startsWith("@")) {
    v = v.substring(1).trim();
  }
  if (!v) return "";
  switch (platform) {
    case "instagram":
      if (!v.includes(".")) return `https://instagram.com/${v}`;
      break;
    case "facebook":
      if (!v.includes(".")) return `https://facebook.com/${v}`;
      break;
    default:
      break;
  }
  return `https://${v}`;
}

function slugifyName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function EditOrgScreen({ navigation }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [noNumber, setNoNumber] = useState(false);
  const [pickedImageMeta, setPickedImageMeta] = useState(null);
  const [profileImageFilePending, setProfileImageFilePending] = useState(false);

  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [collaborators, setCollaborators] = useState("");

  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [complement, setComplement] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const ongData = await getOngById(user?._id, token);
        setRole(ongData?.role || "");
        setFullName(ongData?.name || "");
        setDescription(ongData?.description || "");
        setPhone(ongData?.phone || "");
        setEmail(ongData?.email || "");
        setPixKey(ongData?.pixKey || "");
        setProfileImage(ongData?.profileImg || ongData?.image || "");

        const social = ongData?.socialMedia || ongData?.socialMidia;
        if (social && typeof social === "object") {
          let ig = social.instagram || "";
          ig = ig.replace(/^https?:\/\/(www\.)?(instagram\.com\/)?/, "");
          setInstagram(ig.startsWith("@") ? ig : ig ? `@${ig}` : "");
          setFacebook((social.facebook || "").replace(/^https?:\/\/(www\.)?(facebook\.com\/)?/, ""));
          const ws = social.website || social.site || "";
          setWebsite(ws.replace(/^https?:\/\/(www\.)?/, ""));
        }

        const addr = ongData?.address;
        if (addr) {
          setZipCode(addr.cep || "");
          setStreet(addr.street || "");
          setNumber(addr.number || "");
          setNoNumber(addr.number === "S/N");
          setNeighborhood(addr.neighborhood || "");
          setCity(addr.city || "");
          setStateUf(addr.uf || "");
          setComplement(addr.complement || "");
        }
        if (ongData?.role === "Projeto" && ongData.collaborators !== undefined && ongData.collaborators !== null) {
          setCollaborators(String(ongData.collaborators));
        }
        setPickedImageMeta(null);
        setProfileImageFilePending(false);
      } finally {
        setLoading(false);
      }
    }
    load().catch(() => setLoading(false));
  }, [token, user?._id]);

  async function buscarCep(raw) {
    const cepLimpo = String(raw || "").replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setLoadingCep(true);
    try {
      const data = await lookupCep(cepLimpo);
      if (data?.erro) {
        Alert.alert("CEP nao encontrado", "Verifique o CEP e tente novamente.");
        return;
      }
      setStreet(data?.logradouro || "");
      setNeighborhood(data?.bairro || "");
      setCity(data?.localidade || "");
      setStateUf(data?.uf || "");
      setZipCode(cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2"));
      if (!noNumber) setNumber("");
    } catch (e) {
      Alert.alert("Erro", e.message || "Nao foi possivel buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  }

  async function handlePickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso as fotos para alterar a imagem da ONG.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    setProfileImage(asset.uri);
    setPickedImageMeta({
      mimeType: asset.mimeType || "image/jpeg",
      fileName: asset.fileName || `ong-${Date.now()}.jpg`
    });
    setProfileImageFilePending(true);
  }

  async function performSave() {
    if (!user?._id) return;
    try {
      setSaving(true);
      let finalImageUrl = profileImage;
      const isLocal =
        finalImageUrl?.startsWith?.("file:") ||
        finalImageUrl?.startsWith?.("content:") ||
        finalImageUrl?.startsWith?.("ph://");
      if (isLocal && profileImageFilePending) {
        finalImageUrl = await uploadImage(finalImageUrl, pickedImageMeta || {});
      }

      const updateData = {
        name: fullName,
        description,
        email,
        phone,
        pixKey,
        profileImage: finalImageUrl,
        collaborators: role === "Projeto" && collaborators !== "" ? Number(collaborators) : undefined,
        address: {
          cep: zipCode,
          street,
          number: noNumber ? "S/N" : number,
          neighborhood,
          city,
          uf: stateUf,
          complement
        },
        socialMedia: {
          instagram: formatSocialMediaUrl(instagram, "instagram"),
          facebook: formatSocialMediaUrl(facebook, "facebook"),
          website: formatSocialMediaUrl(website, "website")
        }
      };
      if (updateData.collaborators === undefined) delete updateData.collaborators;

      await updateOngProfile(user._id, updateData, token);
      setProfileImage(finalImageUrl);
      setProfileImageFilePending(false);
      setPickedImageMeta(null);
      Alert.alert("Sucesso", "Perfil da ONG atualizado.", [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate(ROUTES.OngProfile, {
              ongId: user._id,
              ongSlug: slugifyName(fullName)
            })
        }
      ]);
    } catch (error) {
      Alert.alert("Erro", error.message || "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScrollView>
        <ScreenContent>
          <PageIntro title="Editar perfil da organizacao" subtitle="Mesmos campos da versao web" />
          <PinkCard>
            <Text className="mb-2 text-base font-bold text-[#4C3A42]">Foto de perfil da ONG</Text>
            <View className="mb-3 items-center">
              <Image
                source={{ uri: profileImage || FALLBACK_IMG }}
                className="h-36 w-36 rounded-full border-4 border-brand bg-white"
              />
            </View>
            <AppButton title="Selecionar foto" variant="secondary" onPress={handlePickImage} />

            <View className="mt-2 rounded-2xl border border-[#F1D3DD] bg-white p-3">
              <Text className="text-xs font-semibold uppercase text-[#8C6B79]">Email (nao editavel)</Text>
              <Text className="mt-1 text-sm text-[#3E3540]">{email || "Nao informado"}</Text>
            </View>

            <AppInput label="Nome da organizacao" value={fullName} onChangeText={setFullName} />
            <AppInput
              label="Telefone"
              value={phone}
              keyboardType="phone-pad"
              placeholder="(XX) XXXXX-XXXX"
              onChangeText={setPhone}
            />

            {role === "Projeto" ? (
              <AppInput
                label="Colaboradores"
                value={collaborators}
                keyboardType="number-pad"
                onChangeText={setCollaborators}
              />
            ) : null}

            <AppInput
              label="Descricao"
              value={description}
              multiline
              numberOfLines={6}
              maxLength={500}
              onChangeText={(v) => {
                if (v.length <= 500) setDescription(v);
              }}
            />
            <Text className="-mt-1 mb-2 text-right text-xs text-[#8C6B79]">
              {(description || "").length}/500 caracteres
            </Text>

            <Text className="mb-2 mt-2 text-base font-bold text-[#4C3A42]">Endereco</Text>
            <AppInput
              label="CEP"
              value={zipCode}
              keyboardType="number-pad"
              maxLength={9}
              onChangeText={(v) => {
                setZipCode(v);
                if (v.replace(/\D/g, "").length === 8) buscarCep(v);
              }}
            />
            <AppButton
              title={loadingCep ? "Buscando..." : "Buscar CEP"}
              variant="secondary"
              disabled={loadingCep}
              onPress={() => buscarCep(zipCode)}
            />
            <AppButton
              className="mt-2"
              title="Nao sei meu CEP"
              variant="secondary"
              onPress={() => Linking.openURL("https://buscacepinter.correios.com.br/app/endereco/index.php")}
            />
            <AppInput label="Rua" value={street} editable={false} />
            <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-borderSoft bg-white px-4 py-3">
              <Text className="flex-1 pr-3 text-sm text-textMain">Sem numero</Text>
              <Switch
                value={noNumber}
                onValueChange={(v) => {
                  setNoNumber(v);
                  setNumber(v ? "S/N" : "");
                }}
              />
            </View>
            <AppInput label="Numero" value={noNumber ? "S/N" : number} editable={!noNumber} onChangeText={setNumber} />
            <AppInput label="Bairro" value={neighborhood} editable={false} />
            <AppInput label="Cidade" value={city} editable={false} />
            <AppInput label="UF" value={stateUf} onChangeText={setStateUf} />
            <AppInput label="Complemento" value={complement} onChangeText={setComplement} />

            <Text className="mb-2 mt-2 text-base font-bold text-[#4C3A42]">Redes e doacoes</Text>
            <AppInput
              label="Instagram"
              value={instagram}
              placeholder="@usuario"
              onChangeText={(v) => {
                if (v === "" || v.startsWith("@")) setInstagram(v);
                else setInstagram(`@${v}`);
              }}
            />
            <AppInput label="Facebook" value={facebook} onChangeText={setFacebook} />
            <AppInput label="Site" value={website} onChangeText={setWebsite} />
            <AppInput label="Chave Pix" value={pixKey} onChangeText={setPixKey} />

            <AppButton
              className="mt-4"
              title={saving ? "Salvando..." : "Salvar alteracoes"}
              disabled={saving}
              onPress={() =>
                Alert.alert("Confirmar", "Salvar alteracoes no perfil da ONG?", [
                  { text: "Revisar", style: "cancel" },
                  { text: "Salvar", onPress: performSave }
                ])
              }
            />
            <AppButton
              className="mt-2"
              title="Cancelar"
              variant="danger"
              onPress={() =>
                Alert.alert("Cancelar", "Descartar alteracoes?", [
                  { text: "Continuar", style: "cancel" },
                  {
                    text: "Sair",
                    style: "destructive",
                    onPress: () =>
                      navigation.navigate(ROUTES.OngProfile, {
                        ongId: user._id,
                        ongSlug: slugifyName(fullName)
                      })
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
