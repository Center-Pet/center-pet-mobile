import React from "react";
import { Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppScreen from "../components/ui/AppScreen";
import PinkCard from "../components/ui/PinkCard";
import { ROUTES } from "../navigation/routeNames";

export default function NotFoundScreen({ navigation }) {
  return (
    <AppScreen navigation={navigation} activeTab="home">
      <View className="flex-1 items-center justify-center">
        <PinkCard className="w-full">
          <Text className="text-center text-4xl font-bold text-brand">404</Text>
          <Text className="mb-4 mt-2 text-center text-textMuted">Essa tela nao foi encontrada.</Text>
          <AppButton title="Voltar para Home" onPress={() => navigation.navigate(ROUTES.Home)} />
        </PinkCard>
      </View>
    </AppScreen>
  );
}
