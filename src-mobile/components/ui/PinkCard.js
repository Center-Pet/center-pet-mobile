import React from "react";
import { View } from "react-native";

export default function PinkCard({ children, className = "", style }) {
  return (
    <View className={`rounded-3xl border-2 border-[#F1C9D6] bg-[#FFF7FA] p-4 shadow-sm ${className}`} style={style}>
      {children}
    </View>
  );
}
