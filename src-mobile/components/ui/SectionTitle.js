import React from "react";
import { Text, View } from "react-native";

export default function SectionTitle({ title, subtitle }) {
  return (
    <View className="mb-3">
      <Text className="text-2xl font-bold text-textMain">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-textMuted">{subtitle}</Text> : null}
    </View>
  );
}
