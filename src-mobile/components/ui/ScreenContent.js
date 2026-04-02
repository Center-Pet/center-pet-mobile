import React from "react";
import { ScrollView } from "react-native";

export default function ScreenContent({ children }) {
  return <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}
