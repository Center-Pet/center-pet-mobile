import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { API_URL } from "../../config/api";

function resolveOngImage(ong) {
  const candidate =
    ong?.profileImg ||
    ong?.logo ||
    ong?.image?.[0] ||
    ong?.image ||
    ong?.photo ||
    ong?.photos?.[0] ||
    null;

  if (!candidate || typeof candidate !== "string") {
    return "https://i.imgur.com/B2BFUeU.png";
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }

  if (candidate.startsWith("/")) {
    const base = API_URL.replace(/\/api\/?$/, "");
    return `${base}${candidate}`;
  }

  return candidate;
}

export default function OngCard({ ong, onPress }) {
  const cover = resolveOngImage(ong);
  return (
    <Pressable onPress={onPress} className="mb-3 overflow-hidden rounded-2xl border border-borderSoft">
      <Image source={{ uri: cover }} className="h-40 w-full bg-gray-100" />
      <View className="p-3">
        <Text className="text-base font-bold text-textMain">{ong.name}</Text>
        <Text className="mt-1 text-sm text-textMuted">{ong.city || ong.address?.city || "Localizacao nao informada"}</Text>
      </View>
    </Pressable>
  );
}
