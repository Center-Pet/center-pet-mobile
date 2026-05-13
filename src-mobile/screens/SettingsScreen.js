import React from "react";
import { Switch, Text, View } from "react-native";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import { useAccessibility } from "../hooks/useAccessibility";

export default function SettingsScreen({ navigation }) {
  const {
    highContrast,
    largeText,
    reducedMotion,
    setHighContrast,
    setLargeText,
    setReducedMotion
  } = useAccessibility();

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <PageIntro title="Configuracoes" subtitle="Acessibilidade e preferencia visual" />
      <PinkCard>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-textMain">Alto contraste</Text>
          <Switch value={highContrast} onValueChange={(value) => setHighContrast(value)} />
        </View>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-textMain">Fonte maior</Text>
          <Switch value={largeText} onValueChange={(value) => setLargeText(value)} />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-textMain">Reducao de animacoes</Text>
          <Switch value={reducedMotion} onValueChange={(value) => setReducedMotion(value)} />
        </View>
      </PinkCard>
      <Text className="mt-3 text-sm text-textMuted">
        No mobile, os recursos de acessibilidade nativos do sistema operacional tambem podem ser usados.
      </Text>
    </AppScreen>
  );
}
