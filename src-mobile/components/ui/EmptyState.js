import React from "react";
import { Text, View } from "react-native";

export default function EmptyState({ message }) {
  return (
    <View className="items-center justify-center py-12">
      <Text className="text-center text-textMuted">{message}</Text>
    </View>
  );
}
