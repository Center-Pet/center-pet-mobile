import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../navigation/routeNames";

export default function ForgotPasswordScreen({ navigation, route }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState(route?.params?.emailPrefill || "");
  const [submitting, setSubmitting] = useState(false);

  return (
    <AppScreen showTopNav={false} navigation={navigation}>
      <PageIntro title="Recuperar senha" subtitle="Enviaremos um email com instruções" />
      <PinkCard>
        <AppInput
          label="Email cadastrado"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <AppButton
          title={submitting ? "Enviando..." : "Enviar email de recuperação"}
          onPress={async () => {
            if (!email) {
              Alert.alert("Informe o email", "Digite seu email cadastrado.");
              return;
            }
            try {
              setSubmitting(true);
              await requestPasswordReset(email);
              Alert.alert(
                "Email enviado",
                "Confira sua caixa de entrada. Depois, use token e nova senha na tela de redefinição."
              );
              navigation.navigate(ROUTES.ResetPassword, { email });
            } catch (error) {
              Alert.alert("Falha", error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </PinkCard>
      <View className="mt-3">
        <Text className="text-center text-xs text-textMuted">
          Se nao receber em alguns minutos, verifique spam/lixeira.
        </Text>
      </View>
    </AppScreen>
  );
}
