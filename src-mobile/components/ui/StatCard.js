import React from "react";
import { Text, View } from "react-native";

export default function StatCard({ label, value }) {
  return (
    <View className="mr-2 flex-1 rounded-2xl bg-brandSoft p-3">
      <Text className="text-xs uppercase tracking-wide text-brand">{label}</Text>
      <Text className="mt-1 text-2xl font-bold text-textMain">{value}</Text>
    </View>
  );
}
