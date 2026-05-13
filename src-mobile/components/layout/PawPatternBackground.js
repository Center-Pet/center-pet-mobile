import React from "react";
import { Text, View } from "react-native";

const PAWS = [
  { top: "8%", left: "8%" },
  { top: "14%", left: "72%" },
  { top: "24%", left: "40%" },
  { top: "35%", left: "84%" },
  { top: "44%", left: "12%" },
  { top: "56%", left: "66%" },
  { top: "68%", left: "26%" },
  { top: "76%", left: "86%" },
  { top: "88%", left: "54%" }
];

export default function PawPatternBackground() {
  return (
    <View className="absolute inset-0 bg-[#FDF3F6]">
      {PAWS.map((item, index) => (
        <Text
          key={index}
          style={{ position: "absolute", top: item.top, left: item.left, fontSize: 24 }}
          className="text-[#E7B5C6]/40"
        >
          🐾
        </Text>
      ))}
    </View>
  );
}
