import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PinkCard from "../components/ui/PinkCard";
import PageIntro from "../components/ui/PageIntro";
import ScreenContent from "../components/ui/ScreenContent";
import { ROUTES } from "../navigation/routeNames";
import { useAuth } from "../hooks/useAuth";
import { isStrongPassword, validateCPF } from "../utils/validators";

export default function LoginScreen({ navigation }) {
  const { login, registerAdopter } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Campos obrigatorios", "Preencha email e senha.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        if (!name || !cpf || !email || !password || !confirmPassword) {
          throw new Error("Preencha todos os campos.");
        }
        if (!validateCPF(cpf)) throw new Error("CPF invalido.");
        if (!isStrongPassword(password)) throw new Error("Use uma senha forte.");
        if (password !== confirmPassword) throw new Error("As senhas nao coincidem.");

        await registerAdopter({
          fullName: name.trim(),
          email: email.trim(),
          password,
          cpf: cpf.replace(/\D/g, ""),
          safeAdopter: false
        });
        Alert.alert("Cadastro realizado", "Agora voce ja pode entrar.");
        setIsRegister(false);
        setPassword("");
        setConfirmPassword("");
        return;
      }

      await login(email.trim(), password);
    } catch (error) {
      Alert.alert("Falha", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen showTopNav={false} navigation={navigation}>
      <ScreenContent>
        <View className="mb-4 overflow-hidden rounded-3xl bg-[#F6BFCB] p-4">
          <View className="flex-row items-center">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
              }}
              className="h-24 w-24 rounded-2xl"
            />
            <View className="ml-3 flex-1">
              <Text className="text-xl font-extrabold text-[#2B1F24]">Center Pet</Text>
              <Text className="text-xs text-[#4A3A40]">
                Adocao responsavel, simples e segura.
              </Text>
            </View>
          </View>
        </View>
        <PageIntro
          title={isRegister ? "Criar conta" : "Bem-vindo de volta"}
          subtitle="Center Pet Mobile"
        />
        <PinkCard>
          {isRegister ? <AppInput label="Nome completo" value={name} onChangeText={setName} /> : null}
          {isRegister ? <AppInput label="CPF" value={cpf} onChangeText={setCpf} keyboardType="number-pad" /> : null}
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <AppInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
          {isRegister ? (
            <AppInput
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          ) : null}

          <AppButton
            title={
              submitting
                ? isRegister
                  ? "Cadastrando..."
                  : "Entrando..."
                : isRegister
                  ? "Cadastrar"
                  : "Entrar"
            }
            onPress={handleLogin}
            disabled={submitting}
          />
          <AppButton
            className="mt-2"
            title={isRegister ? "Ja tenho conta" : "Criar nova conta"}
            variant="secondary"
            onPress={() => setIsRegister((prev) => !prev)}
          />
          {!isRegister ? (
            <AppButton
              className="mt-2"
              title="Esqueci minha senha"
              variant="secondary"
              onPress={() => navigation.navigate(ROUTES.ForgotPassword, { emailPrefill: email })}
            />
          ) : null}
        </PinkCard>
        <View className="mt-4">
          <Text className="mb-2 text-center text-textMuted">Fluxos adicionais</Text>
          <AppButton title="Cadastro ONG" variant="secondary" onPress={() => navigation.navigate(ROUTES.RegisterOng)} />
          <AppButton className="mt-2" title="Termos e condicoes" variant="secondary" onPress={() => navigation.navigate(ROUTES.Terms)} />
        </View>
      </ScreenContent>
    </AppScreen>
  );
}
