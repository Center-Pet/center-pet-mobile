import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import AppScreen from "../components/ui/AppScreen";
import AppButton from "../components/ui/AppButton";
import EmptyState from "../components/ui/EmptyState";
import LoadingView from "../components/ui/LoadingView";
import OngCard from "../components/ui/OngCard";
import PetCard from "../components/ui/PetCard";
import { ROUTES } from "../navigation/routeNames";
import { getLatestPets } from "../services/petService";
import { getAllOngs } from "../services/ongService";
import { useAuth } from "../hooks/useAuth";

export default function HomeScreen({ navigation }) {
  const { user, userType, token } = useAuth();
  const [pets, setPets] = useState([]);
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const { width } = useWindowDimensions();
  const heroListRef = useRef(null);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
      title: "Adote com Amor",
      subtitle:
        "Mais do que um animal de estimacao, um pet e um companheiro fiel que transforma sua casa em um lar cheio de felicidade."
    },
    {
      image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80",
      title: "Conecte-se com ONGs",
      subtitle: "Conheca projetos serios e encontre seu novo melhor amigo com seguranca."
    },
    {
      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80",
      title: "Sua adocao muda vidas",
      subtitle: "Cada adocao abre espaco para outro resgate."
    }
  ];

  const loadPets = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [petsData, ongsData] = await Promise.all([getLatestPets(), getAllOngs(token)]);
      setPets(petsData);
      setOngs(ongsData);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const heroWidth = useMemo(() => Math.max(width - 32, 280), [width]);

  if (loading) return <LoadingView />;

  const isLogged = Boolean(user?._id);

  return (
    <AppScreen navigation={navigation} activeTab="home">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPets(true)} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 overflow-hidden rounded-3xl bg-[#F6BFCB] p-3">
          <FlatList
            ref={heroListRef}
            data={heroSlides}
            horizontal
            pagingEnabled
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const current = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
              setHeroIndex(current);
            }}
            renderItem={({ item }) => (
              <View style={{ width: heroWidth }} className="flex-row items-center pr-2">
                <Image source={{ uri: item.image }} className="h-28 w-28 rounded-2xl bg-gray-200" />
                <View className="ml-3 flex-1">
                  <Text className="text-2xl font-extrabold text-[#2B1F24]">{item.title}</Text>
                  <Text className="mt-1 text-xs leading-4 text-[#4A3A40]">{item.subtitle}</Text>
                  <AppButton
                    className="mt-2 self-start px-4"
                    title="Adote Agora!"
                    onPress={() => navigation.navigate(ROUTES.Catalog)}
                  />
                </View>
              </View>
            )}
          />
          <View className="mt-3 flex-row justify-center">
            {heroSlides.map((_, index) => (
              <View
                key={index}
                className={`mx-1 h-2 w-2 rounded-full ${index === heroIndex ? "bg-[#4C9BFF]" : "bg-[#D4A2B0]"}`}
              />
            ))}
          </View>
        </View>

        <View className="mb-2 items-center">
          <Text className="text-center text-2xl font-extrabold text-[#1E1720]">
            Conheca nossos pets disponiveis para adocao
          </Text>
          <Text className="mt-1 text-center text-sm text-[#4F4850]">
            Eles estao esperando por um lar cheio de amor e cuidado. Veja abaixo os pets disponiveis.
          </Text>
        </View>

        <View className="mt-2 rounded-3xl bg-white p-4 shadow-sm">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-extrabold text-brand">Pets Disponiveis</Text>
              <View className="mt-1 h-1 w-14 rounded-full bg-brand" />
            </View>
            <Pressable
              onPress={() => navigation.navigate(ROUTES.Catalog)}
              className="rounded-full border border-brand px-4 py-2"
            >
              <Text className="text-sm font-semibold text-brand">Ver Todos</Text>
            </Pressable>
          </View>

          <FlatList
            horizontal
            data={pets.slice(0, 8)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mr-3">
                <PetCard
                  pet={item}
                  compact
                  onPress={() => navigation.navigate(ROUTES.PetInfo, { petId: item.id, initialPet: item })}
                />
              </View>
            )}
            ListEmptyComponent={<EmptyState message="Nenhum pet encontrado." />}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <Text className="mb-2 mt-4 text-2xl font-bold text-textMain">ONGs em destaque</Text>
        {ongs.slice(0, 3).map((ong) => (
          <OngCard
            key={ong._id || ong.id || ong.name}
            ong={ong}
            onPress={() => navigation.navigate(ROUTES.OngProfile, { ongId: ong._id, ongSlug: ong.slug })}
          />
        ))}

        {userType === "Ong" || userType === "ONG" ? (
          <View className="mb-2 mt-2 flex-row gap-2">
            <AppButton title="Area ONG" className="flex-1" onPress={() => navigation.navigate(ROUTES.HomeOng)} />
            <AppButton
              title="Dashboard"
              variant="secondary"
              className="flex-1"
              onPress={() => navigation.navigate(ROUTES.Dashboard)}
            />
          </View>
        ) : null}

        <View className="mb-8 mt-2 gap-2">
          {!isLogged ? (
            <AppButton title="Entrar ou cadastrar" onPress={() => navigation.navigate(ROUTES.Login)} />
          ) : null}
        </View>

      </ScrollView>
    </AppScreen>
  );
}
