import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from "react-native";
import OngDashboardContent from "../components/ong/OngDashboardContent";
import AppScreen from "../components/ui/AppScreen";
import AppButton from "../components/ui/AppButton";
import EmptyState from "../components/ui/EmptyState";
import LoadingView from "../components/ui/LoadingView";
import OngCard from "../components/ui/OngCard";
import PetCard from "../components/ui/PetCard";
import { ROUTES } from "../navigation/routeNames";
import { getAdoptionsByOng } from "../services/adoptionService";
import { getAllOngs, getOngById } from "../services/ongService";
import { getLatestPets, getPetsByOng } from "../services/petService";
import { useAuth } from "../hooks/useAuth";

export default function HomeScreen({ navigation }) {
  const { user, userType, token } = useAuth();
  const [pets, setPets] = useState([]);
  const [ongs, setOngs] = useState([]);
  const [ongHome, setOngHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isOngUser = (userType === "Ong" || userType === "ONG") && Boolean(user?._id) && Boolean(token);

  const [heroIndex, setHeroIndex] = useState(0);
  const { width } = useWindowDimensions();
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

      if (isOngUser) {
        let ong = null;
        try {
          ong = await getOngById(user._id, token);
        } catch {
          ong = null;
        }
        try {
          const [myPets, myAdoptions] = await Promise.all([
            getPetsByOng(user._id, token),
            getAdoptionsByOng(user._id, token)
          ]);
          setOngHome({ ong, pets: myPets, adoptions: myAdoptions });
        } catch {
          setOngHome({ ong, pets: [], adoptions: [] });
        }
      } else {
        setOngHome(null);
      }
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOngUser, token, user?._id]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const heroWidth = useMemo(() => Math.max(width - 32, 280), [width]);

  if (loading) return <LoadingView />;

  const isLogged = Boolean(user?._id);

  if (isOngUser) {
    return (
      <AppScreen navigation={navigation} activeTab="home" showTopNav={false}>
        <OngDashboardContent
          navigation={navigation}
          activeTab="home"
          ong={ongHome?.ong}
          pets={ongHome?.pets || []}
          adoptions={ongHome?.adoptions || []}
          user={user}
          refreshing={refreshing}
          onRefresh={() => loadPets(true)}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen navigation={navigation} activeTab="home">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPets(true)} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 overflow-hidden rounded-3xl bg-[#F6BFCB] p-3">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const current = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
              setHeroIndex(current);
            }}
          >
            {heroSlides.map((item, index) => (
              <View key={String(index)} style={{ width: heroWidth }} className="flex-row items-center pr-2">
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
            ))}
          </ScrollView>
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

          {pets.slice(0, 8).length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {pets.slice(0, 8).map((item) => (
                  <View key={String(item.id || item._id)} className="mr-3">
                    <PetCard
                      pet={item}
                      compact
                      onPress={() =>
                        navigation.navigate(ROUTES.PetInfo, { petId: item.id || item._id, initialPet: item })
                      }
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <EmptyState message="Nenhum pet encontrado." />
          )}
        </View>

        <Text className="mb-2 mt-4 text-2xl font-bold text-textMain">ONGs em destaque</Text>
        {ongs.slice(0, 3).map((ong) => (
          <OngCard
            key={ong._id || ong.id || ong.name}
            ong={ong}
            onPress={() => navigation.navigate(ROUTES.OngProfile, { ongId: ong._id, ongSlug: ong.slug })}
          />
        ))}

        <View className="mb-8 mt-2 gap-2">
          {!isLogged ? (
            <AppButton title="Entrar ou cadastrar" onPress={() => navigation.navigate(ROUTES.Login)} />
          ) : null}
        </View>

      </ScrollView>
    </AppScreen>
  );
}
