import React, { useState } from "react";
import { Alert } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";

export default function ResetPasswordScreen({ route, navigation }) {
  const params = route.params || {};
  const { confirmPasswordReset } = useAuth();
  const [email, setEmail] = useState(params.email || "");
  const [token, setToken] = useState(params.token || "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <AppScreen navigation={navigation} showTopNav={false}>
      <ScreenContent>
        <PageIntro title="Redefinir senha" subtitle="Informe token e nova senha" />
        <PinkCard>
          <AppInput label="Email" value={email} onChangeText={setEmail} />
          <AppInput label="Token" value={token} onChangeText={setToken} />
          <AppInput label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry />
          <AppButton
            title={submitting ? "Enviando..." : "Redefinir senha"}
            onPress={async () => {
              if (!token || !email || !password) {
                Alert.alert("Dados incompletos", "Abra o link de recuperacao com token e email.");
                return;
              }
              try {
                setSubmitting(true);
                await confirmPasswordReset({ token, email, password });
                Alert.alert("Senha atualizada", "Sua senha foi redefinida com sucesso.");
              } catch (error) {
                Alert.alert("Falha", error.message);
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </PinkCard>
      </ScreenContent>
    </AppScreen>
  );
}
