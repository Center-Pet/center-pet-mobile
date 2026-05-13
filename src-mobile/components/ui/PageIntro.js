import React from "react";
import { Text, View } from "react-native";
import { useAccessibility } from "../../hooks/useAccessibility";

export default function PageIntro({ title, subtitle }) {
  const { largeText } = useAccessibility();
  return (
    <View className="mb-3 items-center">
      <Text className={`text-center font-extrabold text-[#1E1720] ${largeText ? "text-3xl" : "text-2xl"}`}>
        {title}
      </Text>
      {subtitle ? <Text className="mt-1 text-center text-sm text-[#4F4850]">{subtitle}</Text> : null}
    </View>
  );
}
