import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/ui/AppButton";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";

export default function TestDraftScreen({ navigation }) {
  const [image, setImage] = useState(null);

  return (
    <AppScreen navigation={navigation} activeTab="form">
      <PageIntro title="Sandbox de imagem" subtitle="Tela de testes para fluxo de foto" />
      <PinkCard>
        <AppButton
          title="Selecionar imagem"
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          }}
        />
        {image ? (
          <Image source={{ uri: image }} className="mt-3 h-72 w-full rounded-2xl" />
        ) : (
          <View className="mt-3 rounded-2xl border border-dashed border-borderSoft p-8">
            <Text className="text-center text-textMuted">Nenhuma imagem selecionada.</Text>
          </View>
        )}
      </PinkCard>
    </AppScreen>
  );
}
