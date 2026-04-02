import React from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function PetCard({ pet, onPress, compact = false }) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 overflow-hidden rounded-2xl border border-[#F0E3E8] bg-white p-2 shadow-sm ${
        compact ? "w-[160px]" : "w-full"
      }`}
    >
      <Image source={{ uri: pet.image }} className={`${compact ? "h-32" : "h-40"} w-full rounded-xl bg-gray-100`} />
      <View className="mt-2 flex-row flex-wrap">
        <Text className="mr-1 rounded-full bg-[#FCECF1] px-2 py-0.5 text-[10px] text-brand">
          {pet.type || "Pet"}
        </Text>
        <Text className="mr-1 rounded-full bg-[#FCECF1] px-2 py-0.5 text-[10px] text-brand">
          {pet.gender || "Genero"}
        </Text>
        <Text className="rounded-full bg-[#FCECF1] px-2 py-0.5 text-[10px] text-brand">
          {pet.age || "Idade"}
        </Text>
      </View>
      <Text className="mt-2 text-base font-bold text-[#111]">{pet.name || "Pet sem nome"}</Text>
    </Pressable>
  );
}
