import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../navigation/routeNames";
import { isStrongPassword } from "../utils/validators";

export default function ResetPasswordScreen({ route, navigation }) {
  const params = route.params || {};
  const { confirmPasswordReset } = useAuth();
  const [email, setEmail] = useState(params.email || "");
  const [token, setToken] = useState(params.token || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <AppScreen navigation={navigation} showTopNav={false}>
      <ScreenContent>
        <PageIntro
          title="Redefinir senha"
          subtitle="Use o token enviado por email (mesmo fluxo do site)"
        />
        <PinkCard>
          <AppInput label="Email (opcional, para seu registro)" value={email} onChangeText={setEmail} />
          <AppInput label="Token" value={token} onChangeText={setToken} />
          <AppInput label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry />
          <AppInput label="Confirmar nova senha" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <Text className="mb-3 text-xs leading-5 text-textMuted">
            Minimo 8 caracteres, com 1 numero, 1 minuscula, 1 maiuscula e 1 caractere especial.
          </Text>
          <AppButton
            title={submitting ? "Enviando..." : "Redefinir senha"}
            disabled={submitting}
            onPress={async () => {
              if (!token) {
                Alert.alert("Token obrigatorio", "Cole o token recebido no email.");
                return;
              }
              if (!password || !confirm) {
                Alert.alert("Preencha os campos", "Informe senha e confirmacao.");
                return;
              }
              if (password !== confirm) {
                Alert.alert("Senhas diferentes", "As senhas nao coincidem.");
                return;
              }
              if (!isStrongPassword(password)) {
                Alert.alert(
                  "Senha fraca",
                  "A senha deve ter no minimo 8 caracteres, 1 numero, 1 minuscula, 1 maiuscula e 1 caractere especial."
                );
                return;
              }
              try {
                setSubmitting(true);
                await confirmPasswordReset({ token, password });
                Alert.alert("Senha atualizada", "Voce ja pode fazer login.", [
                  {
                    text: "OK",
                    onPress: () => navigation.navigate(ROUTES.Login)
                  }
                ]);
              } catch (error) {
                Alert.alert("Falha", error.message || "Erro ao redefinir senha.");
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
