import React from "react";
import { View } from "react-native";

export default function PinkCard({ children, className = "" }) {
  return (
    <View className={`rounded-3xl border-2 border-[#F1C9D6] bg-[#FFF7FA] p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}
