import React from "react";
import { ScrollView } from "react-native";

export default function ScreenContent({ children, ...rest }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} {...rest}>
      {children}
    </ScrollView>
  );
}
