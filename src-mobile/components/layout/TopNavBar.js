import React, { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../navigation/routeNames";

const centerPetLogo = require("../../../public/assets/logo/CenterPet.png");

function MenuItem({ label, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center rounded-2xl border border-[#EABCCB] bg-white px-3 py-2"
    >
      <Ionicons name={icon} size={16} color="#D14D72" />
      <Text className="ml-2 text-sm font-semibold text-[#4C3A42]">{label}</Text>
    </Pressable>
  );
}

export default function TopNavBar({ navigation, activeTab: _activeTab }) {
  const { userType, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isOng = userType === "Ong" || userType === "ONG";
  const profileRoute = isAuthenticated
    ? userType === "Ong" || userType === "ONG"
      ? ROUTES.HomeOng
      : ROUTES.AdopterProfile
    : ROUTES.Login;
  const formRoute = isAuthenticated ? (isOng ? ROUTES.RegisterPet : ROUTES.FormSafeAdopter) : ROUTES.Login;

  const go = (routeName) => {
    setOpen(false);
    navigation.navigate(routeName);
  };

  const confirmLogout = () => {
    Alert.alert("Confirmar saida", "Deseja realmente sair da sua conta?", [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setOpen(false);
          await logout();
          navigation.navigate(ROUTES.Home);
        }
      }
    ]);
  };

  return (
    <View className="relative mb-3 h-16">
      <View
        style={{ transform: [{ rotate: "10deg" }] }}
        className="absolute -left-24 -top-28 h-52 w-52 rounded-[38px] bg-brand"
      />

      <Pressable onPress={() => go(ROUTES.Home)} className="absolute left-2 top-0 h-14 w-20">
        {!logoError ? (
          <Image
            source={centerPetLogo}
            resizeMode="contain"
            className="h-14 w-20"
            onError={() => setLogoError(true)}
          />
        ) : (
          <View className="h-14 w-20 items-center justify-center rounded-xl bg-brand">
            <Text className="text-base font-black text-white">CP</Text>
            <Text className="-mt-1 text-[8px] text-white">center pet</Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate(profileRoute)}
        className="absolute right-11 top-1 h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-[#FEF2F4]"
      >
        <Ionicons name="person-circle-outline" size={22} color="#D14D72" />
      </Pressable>

      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="absolute right-0 top-1 h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-[#FEF2F4]"
      >
        <Ionicons name={open ? "close" : "menu"} size={20} color="#D14D72" />
      </Pressable>

      {open ? (
        <View className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-[#EFC9D6] bg-[#FFF6F9] p-3 shadow-lg">
          <MenuItem label="Home" icon="home-outline" onPress={() => go(ROUTES.Home)} />
          <MenuItem label="Catalogo" icon="paw-outline" onPress={() => go(ROUTES.Catalog)} />
          <MenuItem label="Formulario" icon="document-text-outline" onPress={() => go(formRoute)} />
          <MenuItem label="Perfil" icon="person-outline" onPress={() => go(profileRoute)} />
          <MenuItem label="Configuracoes" icon="settings-outline" onPress={() => go(ROUTES.Settings)} />
          <MenuItem label="Termos" icon="document-outline" onPress={() => go(ROUTES.Terms)} />
          {!isAuthenticated ? (
            <MenuItem label="Entrar" icon="log-in-outline" onPress={() => go(ROUTES.Login)} />
          ) : (
            <Pressable
              onPress={confirmLogout}
              className="mt-1 flex-row items-center rounded-2xl border border-[#F6AABF] bg-[#FFF0F5] px-3 py-2"
            >
              <Ionicons name="log-out-outline" size={16} color="#D14D72" />
              <Text className="ml-2 text-sm font-semibold text-[#D14D72]">Sair</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}
