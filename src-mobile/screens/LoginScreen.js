import React, { useState } from "react";
import { Alert, Image, Pressable, Switch, Text, TextInput, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PinkCard from "../components/ui/PinkCard";
import PageIntro from "../components/ui/PageIntro";
import { FieldError, PasswordStrengthHint } from "../components/ui/RegisterFormBits";
import ScreenContent from "../components/ui/ScreenContent";
import { ROUTES } from "../navigation/routeNames";
import { useAuth } from "../hooks/useAuth";
import { buildAdopterRegisterPayload, validateAdopterRegister, validarSenhaForte } from "../utils/registerAdopterUtils";
import { formatCpf } from "../utils/registerOngUtils";

const BRAND = "#D14D72";

export default function LoginScreen({ navigation }) {
  const { login, registerAdopter } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState(() => validarSenhaForte(""));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function toggleRegisterMode() {
    setIsRegister((prev) => {
      const next = !prev;
      setPassword("");
      setPasswordValidation(validarSenhaForte(""));
      setConfirmPassword("");
      setErrors({});
      if (!next) {
        setFullName("");
        setCpf("");
        setAgreeToTerms(false);
      }
      return next;
    });
  }

  const clearError = (key) => {
    setErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
  };

  async function handleSubmit() {
    if (isRegister) {
      const form = {
        fullName,
        cpf,
        email,
        password,
        passwordConfirm: confirmPassword,
        agreeToTerms
      };
      const { ok, errors: v } = validateAdopterRegister(form);
      setErrors(v);
      if (!ok) {
        const first = v.terms || v.fullName || v.email || v.cpf || v.password || v.passwordConfirm;
        if (first) Alert.alert("Revise o cadastro", first);
        return;
      }

      setSubmitting(true);
      try {
        const payload = buildAdopterRegisterPayload(form);
        await registerAdopter(payload);
        Alert.alert("Cadastro realizado", "Sua conta foi criada. Você já pode entrar.", [
          {
            text: "OK",
            onPress: () => {
              setIsRegister(false);
              setFullName("");
              setCpf("");
              setConfirmPassword("");
              setAgreeToTerms(false);
              setErrors({});
              setPassword("");
              setPasswordValidation(validarSenhaForte(""));
            }
          }
        ]);
      } catch (error) {
        const m = (error?.message || "").toLowerCase();
        if (m.includes("email") || m.includes("e-mail") || m.includes("cpf") || m.includes("cadastrado")) {
          Alert.alert("Não foi possível cadastrar", "Este e-mail ou CPF já está cadastrado.");
        } else {
          Alert.alert("Não foi possível cadastrar", error?.message || "Tente novamente.");
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!email || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert("Falha no login", error?.message || "Verifique seus dados.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen showTopNav={false} navigation={navigation}>
      <ScreenContent keyboardShouldPersistTaps="handled">
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
              <Text className="text-xs text-[#4A3A40]">Adoção responsável, simples e segura.</Text>
            </View>
          </View>
        </View>
        <PageIntro
          title={isRegister ? "Criar conta de adotante" : "Bem-vindo de volta"}
          subtitle={isRegister ? "Mesmos requisitos do site: senha forte, CPF válido e aceite dos termos." : "Center Pet Mobile"}
        />
        <PinkCard>
          {isRegister ? (
            <>
              <AppInput
                label="Nome completo"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  clearError("fullName");
                }}
                placeholder="Nome Completo"
              />
              <FieldError message={errors.fullName} />

              <AppInput
                label="CPF"
                value={cpf}
                onChangeText={(v) => {
                  setCpf(formatCpf(v));
                  clearError("cpf");
                }}
                placeholder="CPF"
                keyboardType="number-pad"
                maxLength={14}
              />
              <FieldError message={errors.cpf} />
            </>
          ) : null}

          <AppInput
            label="E-mail"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearError("email");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email"
          />
          <FieldError message={errors.email} />

          <Text className="mb-1 text-sm text-textMain">Senha</Text>
          <View className="relative mb-1">
            <TextInput
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (isRegister) setPasswordValidation(validarSenhaForte(v));
                setErrors((e) => {
                  const n = { ...e };
                  delete n.password;
                  delete n.passwordConfirm;
                  return n;
                });
              }}
              placeholder="Senha"
              secureTextEntry={!showPassword}
              className={`rounded-2xl border bg-white px-4 py-3 pr-14 text-sm text-textMain ${
                isRegister && password.length > 0 && !passwordValidation.valido
                  ? "border-[#F06292]"
                  : "border-borderSoft"
              }`}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} className="absolute right-2 top-2.5 px-2">
              <Text className="text-xs font-semibold" style={{ color: BRAND }}>
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </Pressable>
          </View>
          <FieldError message={errors.password} />

          {isRegister ? (
            <>
              <Text className="mb-1 text-sm text-textMain">Confirmar senha</Text>
              <View className="relative mb-1">
                <TextInput
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    clearError("passwordConfirm");
                  }}
                  placeholder="Confirme sua Senha"
                  secureTextEntry={!showConfirm}
                  className="rounded-2xl border border-borderSoft bg-white px-4 py-3 pr-14 text-sm text-textMain"
                />
                <Pressable onPress={() => setShowConfirm((s) => !s)} className="absolute right-2 top-2.5 px-2">
                  <Text className="text-xs font-semibold" style={{ color: BRAND }}>
                    {showConfirm ? "Ocultar" : "Ver"}
                  </Text>
                </Pressable>
              </View>

              {password.length > 0 ? <PasswordStrengthHint validation={passwordValidation} /> : null}
              <FieldError message={errors.passwordConfirm} />

              <View className="mb-4 flex-row items-start rounded-xl border border-[#F1C9D6] bg-[#FFF8FA] p-3">
                <Switch
                  value={agreeToTerms}
                  onValueChange={(v) => {
                    setAgreeToTerms(v);
                    clearError("terms");
                  }}
                  className="mr-2"
                />
                <View className="flex-1">
                  <Text className="text-sm leading-5 text-textMain">
                    Li e concordo com os{" "}
                    <Text
                      onPress={() => navigation.navigate(ROUTES.Terms)}
                      className="font-semibold"
                      style={{ color: BRAND }}
                    >
                      Termos e Condições
                    </Text>
                  </Text>
                </View>
              </View>
              <FieldError message={errors.terms} />
            </>
          ) : null}

          <AppButton
            title={
              submitting ? (isRegister ? "Cadastrando..." : "Entrando...") : isRegister ? "Cadastrar" : "Entrar"
            }
            onPress={handleSubmit}
            disabled={submitting}
          />
          <AppButton
            className="mt-2"
            title={isRegister ? "Já tenho conta" : "Criar nova conta (adotante)"}
            variant="secondary"
            onPress={toggleRegisterMode}
            disabled={submitting}
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
          <AppButton className="mt-2" title="Termos e condições" variant="secondary" onPress={() => navigation.navigate(ROUTES.Terms)} />
        </View>
        <View className="h-6" />
      </ScreenContent>
    </AppScreen>
  );
}
