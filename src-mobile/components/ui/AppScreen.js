import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PawPatternBackground from "../layout/PawPatternBackground";
import TopNavBar from "../layout/TopNavBar";
import { useAccessibility } from "../../hooks/useAccessibility";

export default function AppScreen({
  children,
  padded = true,
  navigation,
  activeTab,
  showTopNav = true
}) {
  const { highContrast } = useAccessibility();
  return (
    <SafeAreaView className={`flex-1 ${highContrast ? "bg-white" : ""}`}>
      <StatusBar barStyle="dark-content" />
      {!highContrast ? <PawPatternBackground /> : null}
      <View className={padded ? "flex-1 px-4 pb-4" : "flex-1"}>
        {showTopNav && navigation ? <TopNavBar navigation={navigation} activeTab={activeTab} /> : null}
        {children}
      </View>
    </SafeAreaView>
  );
}
