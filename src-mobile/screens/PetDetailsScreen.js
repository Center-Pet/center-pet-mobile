import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppButton from "../components/ui/AppButton";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import SectionTitle from "../components/ui/SectionTitle";
import PetCard from "../components/ui/PetCard";
import { ROUTES } from "../navigation/routeNames";
import { useAuth } from "../hooks/useAuth";
import { createAdoptionRequest } from "../services/adoptionService";
import { getPetById, deletePet, getLatestPets, getSimilarPets } from "../services/petService";
import { getOngById } from "../services/ongService";

function getWaitingTime(waitingTime) {
  if (!waitingTime) return "Nao informado";
  const months = parseInt(waitingTime, 10);
  if (Number.isNaN(months)) return "Nao informado";
  return months === 1 ? "1 mes" : `${months} meses`;
}

function normalizeSpecialCondition(value) {
  if (Array.isArray(value)) {
    const items = value.filter(Boolean);
    return items.length ? items.join(", ") : "Nenhuma";
  }
  if (typeof value === "string" && value.trim()) return value;
  return "Nenhuma";
}

function getPetImages(pet) {
  if (Array.isArray(pet?.images) && pet.images.length) return pet.images;
  if (Array.isArray(pet?.image) && pet.image.length) return pet.image;
  if (Array.isArray(pet?.photos) && pet.photos.length) return pet.photos;
  if (Array.isArray(pet?.imagens) && pet.imagens.length) return pet.imagens;
  if (typeof pet?.image === "string" && pet.image) return [pet.image];
  if (typeof pet?.photo === "string" && pet.photo) return [pet.photo];
  return ["https://i.imgur.com/B2BFUeU.png"];
}

function InfoRow({ label, value }) {
  return (
    <View className="mb-2 w-full rounded-xl border border-[#F1D3DD] bg-white px-3 py-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-[#8C6B79]">{label}</Text>
      <Text className="mt-1 text-sm leading-5 text-[#3E3540]">{value || "Nao informado"}</Text>
    </View>
  );
}

export default function PetDetailsScreen({ route, navigation }) {
  const { petId, initialPet } = route.params || {};
  const { user, token, userType } = useAuth();
  const [pet, setPet] = useState(initialPet || null);
  const [ong, setOng] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(!initialPet);

  useEffect(() => {
    if (!petId) return;

    async function loadPet() {
      try {
        setLoading(true);
        const data = await getPetById(petId);
        setPet(data);
        if (data?.ongId) {
          const ongData = await getOngById(data.ongId).catch(() => null);
          setOng(ongData);
        }

        // Mantem paridade com o web: busca por tipo e exclui o pet atual.
        const similarByType = await getSimilarPets({
          type: data?.type,
          excludeId: petId,
          limit: 12
        }).catch(() => []);

        const normalizedByType = (Array.isArray(similarByType) ? similarByType : []).filter((item) => {
          const normalizedStatus = String(item?.status || "").toLowerCase();
          return normalizedStatus.includes("dispon");
        });

        if (normalizedByType.length) {
          setSimilar(normalizedByType.slice(0, 6));
        } else {
          // Fallback para nao deixar vazio quando a API nao aplicar filtro.
          const list = await getLatestPets(40).catch(() => []);
          const safeList = Array.isArray(list) ? list : [];
          setSimilar(
            safeList
              .filter((item) => {
                const normalizedStatus = String(item?.status || "").toLowerCase();
                const isAvailable = normalizedStatus.includes("dispon");
                return item.id !== petId && item.type === data?.type && isAvailable;
              })
              .slice(0, 6)
          );
        }
      } catch (error) {
        Alert.alert("Erro", error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPet();
  }, [petId]);

  const isLogged = Boolean(user?._id);
  const petImages = useMemo(() => getPetImages(pet), [pet]);
  const safeCurrentImage = petImages[currentImage] || petImages[0];
  const normalizedPetId = pet?._id || pet?.id;
  const normalizedOngId = pet?.ongId || pet?.ong?._id || pet?.ong;
  const isOng = userType === "Ong" || userType === "ONG";
  const isOngOwner = Boolean(isLogged && isOng && normalizedOngId && user?._id && normalizedOngId === user._id);
  const canRequest = (!isLogged || (isLogged && !isOng)) && pet?.status !== "Adotado";
  const similarPets = useMemo(() => (Array.isArray(similar) ? similar : []), [similar]);
  const specialCondition = normalizeSpecialCondition(pet?.health?.specialCondition || pet?.specialCondition);
  const description = pet?.bio || pet?.description || "Sem descricao disponivel.";
  const location = pet?.city && pet?.state ? `${pet.city}, ${pet.state}` : "Localizacao nao informada";

  if (loading && !pet) return <LoadingView />;
  if (!pet) return <LoadingView />;

  return (
    <AppScreen padded={false} navigation={navigation} activeTab="catalog">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-3 rounded-3xl border border-[#EAC3D0] bg-white p-2">
          <View className="relative">
            <Image source={{ uri: safeCurrentImage }} className="h-72 w-full rounded-2xl bg-gray-100" />
            {petImages.length > 1 ? (
              <>
                <Pressable
                  onPress={() => setCurrentImage((prev) => (prev === 0 ? petImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 h-9 w-9 -translate-y-4 items-center justify-center rounded-full bg-black/40"
                >
                  <Ionicons name="chevron-back" size={18} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={() => setCurrentImage((prev) => (prev + 1) % petImages.length)}
                  className="absolute right-2 top-1/2 h-9 w-9 -translate-y-4 items-center justify-center rounded-full bg-black/40"
                >
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </Pressable>
              </>
            ) : null}
          </View>
          {petImages.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
            >
              {petImages.map((image, index) => (
                <Pressable
                  key={`${image}-${index}`}
                  onPress={() => setCurrentImage(index)}
                  className={`rounded-xl border p-1 ${currentImage === index ? "border-brand" : "border-transparent"}`}
                >
                  <Image source={{ uri: image }} className="h-14 w-14 rounded-lg bg-gray-100" />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <SectionTitle title={`Conheca ${pet?.name || "o pet"}`} subtitle={`De ${ong?.name || "ONG nao informada"}`} />
        <Text className="mb-2 text-sm text-[#6B5A64]">{location}</Text>
        <Text className="mb-4 text-sm leading-6 text-[#3E3540]">{description}</Text>

        <View className="rounded-2xl border border-borderSoft bg-[#FFF8FA] p-4">
          <InfoRow label="Especie" value={pet?.type} />
          <InfoRow label="Pelagem" value={pet?.coat} />
          <InfoRow label="Idade" value={pet?.age} />
          <InfoRow label="Genero" value={pet?.gender} />
          <InfoRow label="Raca" value={pet?.breed} />
          <InfoRow label="Porte" value={pet?.size} />
          <InfoRow label="Vacinado" value={pet?.health?.vaccinated ? "Sim" : "Nao"} />
          <InfoRow label="Castrado" value={pet?.health?.castrated ? "Sim" : "Nao"} />
          <InfoRow label="Vermifugado" value={pet?.health?.dewormed ? "Sim" : "Nao"} />
          <InfoRow label="Esperando um amigo ha" value={getWaitingTime(pet?.waitingTime)} />
          <InfoRow label="Condicao especial" value={specialCondition} />
          <InfoRow label="Status" value={pet?.status || "Nao informado"} />
        </View>

        <View className="mt-4 gap-2">
          {!isLogged ? (
            <AppButton
              title="Entrar para solicitar adocao"
              onPress={() => navigation.navigate(ROUTES.Login)}
            />
          ) : null}
          {canRequest && isLogged ? (
            <AppButton
              title={requesting ? "Enviando..." : "Solicitar adocao"}
              disabled={requesting}
              onPress={async () => {
                if (!user?._id) {
                  Alert.alert("Entre na conta", "Voce precisa estar logado como adotante.");
                  return;
                }
                try {
                  setRequesting(true);
                  await createAdoptionRequest(
                    {
                      petId: normalizedPetId,
                      userId: user._id,
                      ongId: normalizedOngId
                    },
                    token
                  );
                  Alert.alert("Solicitacao enviada", "A ONG foi notificada.");
                } catch (error) {
                  Alert.alert("Falha", error.message);
                } finally {
                  setRequesting(false);
                }
              }}
            />
          ) : null}
          {isOngOwner ? (
            <>
              <AppButton title="Editar pet" variant="secondary" onPress={() => navigation.navigate(ROUTES.EditPet, { petId: normalizedPetId })} />
              <AppButton
                title="Excluir pet"
                variant="danger"
                onPress={async () => {
                  try {
                    await deletePet(normalizedPetId, token);
                    Alert.alert("Pet removido", "O pet foi excluido.");
                    navigation.goBack();
                  } catch (error) {
                    Alert.alert("Falha", error.message);
                  }
                }}
              />
            </>
          ) : null}
        </View>
        {ong ? (
          <View className="mt-4 rounded-2xl border border-[#F0D0DB] bg-[#FFF8FA] p-4">
            <Text className="text-xl font-bold text-brand">ONG responsavel</Text>
            <Text className="mt-1 text-textMain">{ong.name}</Text>
            <Text className="text-sm text-textMuted">{ong.email || "Contato nao informado"}</Text>
            <AppButton
              className="mt-2"
              variant="secondary"
              title="Ver perfil da ONG"
              onPress={() => navigation.navigate(ROUTES.OngProfile, { ongId: ong._id, ongSlug: ong.slug })}
            />
          </View>
        ) : null}

        <View className="mt-4">
          <Text className="mb-2 text-2xl font-bold text-[#1E1720]">Pets similares</Text>
          <FlatList
            horizontal
            data={similarPets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mr-3">
                <PetCard
                  compact
                  pet={item}
                  onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id })}
                />
              </View>
            )}
            ListEmptyComponent={<Text className="text-sm text-textMuted">Sem recomendações no momento.</Text>}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
