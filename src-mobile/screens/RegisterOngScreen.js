import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import { FieldError, PasswordStrengthHint } from "../components/ui/RegisterFormBits";
import ScreenContent from "../components/ui/ScreenContent";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../navigation/routeNames";
import { uploadImage } from "../services/uploadService";
import {
  buildOngRegisterPayload,
  digitsOnly,
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhoneBr,
  onlyPositiveDigits,
  validarSenhaForte,
  validateRegisterOngSubmit
} from "../utils/registerOngUtils";

const BRAND = "#D14D72";

const initialForm = () => ({
  roleOption: "ONG",
  fullName: "",
  description: "",
  email: "",
  password: "",
  passwordConfirm: "",
  phone: "",
  instagram: "",
  facebook: "",
  website: "",
  pixKey: "",
  cpf: "",
  cnpj: "",
  collaborators: "",
  zipCode: "",
  street: "",
  number: "",
  noNumber: false,
  neighborhood: "",
  city: "",
  stateUf: "",
  profileAsset: null
});

export default function RegisterOngScreen({ navigation }) {
  const { registerOng } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState(() => validarSenhaForte(""));
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setPasswordValidation(validarSenhaForte(form.password));
  }, [form.password]);

  const profilePreviewUri = useMemo(() => {
    if (form.profileAsset?.uri) return form.profileAsset.uri;
    return null;
  }, [form.profileAsset]);

  function patchForm(partial) {
    setForm((p) => ({ ...p, ...partial }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(partial).forEach((k) => {
        delete next[k];
      });
      if ("instagram" in partial || "facebook" in partial || "website" in partial) delete next.social;
      return next;
    });
  }

  function resetOrgFields() {
    patchForm({ cpf: "", cnpj: "", collaborators: "" });
  }

  function setRole(role) {
    resetOrgFields();
    patchForm({ roleOption: role });
  }

  async function fetchCep(cepRaw) {
    const limpo = digitsOnly(cepRaw);
    if (limpo.length !== 8) return;
    setIsFetchingZip(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        Alert.alert("CEP não encontrado", "Verifique o CEP digitado.");
        patchForm({ street: "", neighborhood: "", city: "", stateUf: "" });
      } else {
        patchForm({
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          stateUf: data.uf || ""
        });
      }
    } catch {
      Alert.alert("Erro", "Não foi possível buscar o endereço.");
    } finally {
      setIsFetchingZip(false);
    }
  }

  async function pickProfile() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissão", "Precisamos de acesso à galeria para a foto de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });
    if (result.canceled) return;
    const a = result.assets[0];
    patchForm({
      profileAsset: { uri: a.uri, mimeType: a.mimeType, fileName: a.fileName }
    });
  }

  async function onSubmit() {
    const { ok, errors: v } = validateRegisterOngSubmit(form);
    setErrors(v);
    if (!ok) {
      const first = Object.values(v)[0];
      if (first) Alert.alert("Revise o formulário", first);
      return;
    }

    setSubmitting(true);
    try {
      let profileUrl = "";
      if (form.profileAsset?.uri) {
        profileUrl = await uploadImage(form.profileAsset.uri, {
          mimeType: form.profileAsset.mimeType,
          fileName: form.profileAsset.fileName
        });
      }
      const payload = buildOngRegisterPayload(form, profileUrl);
      await registerOng(payload);
      Alert.alert("Sucesso", "Organização cadastrada com sucesso! Faça login para continuar.", [
        { text: "OK", onPress: () => navigation.navigate(ROUTES.Login) }
      ]);
    } catch (error) {
      const m = error?.message || "";
      if (m.includes("Email already") || m.toLowerCase().includes("email")) {
        Alert.alert("E-mail em uso", "Este e-mail já está cadastrado. Use outro e-mail.");
      } else if (m.includes("Document already") || m.toLowerCase().includes("cnpj") || m.toLowerCase().includes("cpf")) {
        Alert.alert("Documento", "Este CNPJ/CPF já está cadastrado no sistema.");
      } else {
        Alert.alert("Erro", m || "Não foi possível concluir o cadastro.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const role = form.roleOption;

  return (
    <AppScreen navigation={navigation} showTopNav={false}>
      <ScreenContent keyboardShouldPersistTaps="handled">
        <PageIntro
          title="Cadastre sua organização"
          subtitle="Protetores e projetos devem informar pelo menos uma rede social."
        />
        <PinkCard>
          <Text className="mb-3 text-xs leading-5 text-[#6B5A64]">
            Obs: o endereço não é exibido no site; usamos apenas para segurança e referência regional.
          </Text>

          <AppInput
            label="Nome da organização"
            value={form.fullName}
            onChangeText={(v) => patchForm({ fullName: v })}
            placeholder="Nome da organização"
          />
          <FieldError message={errors.fullName} />

          <AppInput
            label="Telefone"
            value={form.phone}
            onChangeText={(v) => patchForm({ phone: formatPhoneBr(v) })}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />
          <FieldError message={errors.phone} />

          <AppInput
            label="E-mail"
            value={form.email}
            onChangeText={(v) => patchForm({ email: v })}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FieldError message={errors.email} />

          <Text className="mb-1 text-sm text-textMain">Descrição (opcional)</Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => {
              if (v.length <= 500) patchForm({ description: v });
            }}
            placeholder="Descreva sua organização..."
            multiline
            numberOfLines={6}
            className="mb-1 min-h-[120px] rounded-2xl border border-borderSoft bg-white px-4 py-3 text-sm text-textMain"
            textAlignVertical="top"
          />
          <Text className="mb-3 text-right text-xs text-gray-500">{(form.description || "").length}/500</Text>

          <View className="mb-2 flex-row flex-wrap items-center">
            <Text className="text-sm font-semibold text-textMain">CEP</Text>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Por que pedimos seu endereço?",
                  "Seu endereço não será exibido no site. Usamos apenas para verificar a localização da organização, proteger protetores e ONGs e melhorar buscas por pets próximos."
                )
              }
            >
              <Text className="text-xs font-semibold" style={{ color: BRAND }}>
                ℹ️ Por quê?
              </Text>
            </Pressable>
          </View>
          <View className="mb-2 flex-row flex-wrap items-center">
            <View className="min-w-[140px] flex-1 pr-2">
              <AppInput
                label="CEP"
                value={form.zipCode}
                onChangeText={(v) => {
                  const f = formatCep(v);
                  patchForm({ zipCode: f });
                  if (digitsOnly(f).length === 8) fetchCep(f);
                }}
                placeholder="00000-000"
                keyboardType="number-pad"
              />
            </View>
            {isFetchingZip ? <ActivityIndicator color={BRAND} /> : null}
            <Pressable
              onPress={() =>
                Linking.openURL("https://buscacepinter.correios.com.br/app/endereco/index.php").catch(() => {})
              }
            >
              <Text className="text-xs font-semibold" style={{ color: BRAND }}>
                Não sei meu CEP
              </Text>
            </Pressable>
          </View>
          <FieldError message={errors.zipCode} />

          <AppInput label="Rua" value={form.street} onChangeText={() => {}} editable={false} placeholder="Preenchido pelo CEP" />
          <FieldError message={errors.street} />

          <View className="mb-3 flex-row items-center">
            <View className="min-w-[120px] flex-1">
              <AppInput
                label="Número"
                value={form.noNumber ? "S/N" : form.number}
                onChangeText={(v) => patchForm({ number: onlyPositiveDigits(v) })}
                placeholder="Número"
                editable={!form.noNumber}
                keyboardType="number-pad"
              />
            </View>
            <View className="ml-3 flex-row items-center">
              <Switch value={form.noNumber} onValueChange={(v) => patchForm({ noNumber: v, number: v ? "" : form.number })} />
              <Text className="ml-2 text-xs text-textMain">Sem número</Text>
            </View>
          </View>
          <FieldError message={errors.number} />

          <AppInput label="Bairro" value={form.neighborhood} editable={false} onChangeText={() => {}} />
          <FieldError message={errors.neighborhood} />

          <View className="mb-3 flex-row">
            <View className="min-w-[120px] flex-[2] pr-2">
              <AppInput label="Cidade" value={form.city} editable={false} onChangeText={() => {}} />
            </View>
            <View className="min-w-[72px] flex-1">
              <AppInput label="UF" value={form.stateUf} editable={false} onChangeText={() => {}} />
            </View>
          </View>
          <FieldError message={errors.city} />
          <FieldError message={errors.stateUf} />

          <AppInput
            label="Instagram"
            value={form.instagram}
            onChangeText={(v) => {
              if (v === "" || v.startsWith("@")) patchForm({ instagram: v });
              else patchForm({ instagram: `@${v}` });
            }}
            placeholder="@usuario"
            autoCapitalize="none"
          />
          <AppInput
            label="Facebook"
            value={form.facebook}
            onChangeText={(v) => patchForm({ facebook: v })}
            placeholder="facebook.com/sua_pagina"
            autoCapitalize="none"
          />
          <AppInput
            label="Site"
            value={form.website}
            onChangeText={(v) => patchForm({ website: v })}
            placeholder="seusite.com.br"
            autoCapitalize="none"
          />
          <FieldError message={errors.social} />

          <AppInput label="Chave Pix (opcional)" value={form.pixKey} onChangeText={(v) => patchForm({ pixKey: v })} />

          <Text className="mb-1 text-sm text-textMain">Senha</Text>
          <View className="relative mb-1">
            <TextInput
              value={form.password}
              onChangeText={(v) => patchForm({ password: v })}
              placeholder="Senha forte"
              secureTextEntry={!showPassword}
              className="rounded-2xl border border-borderSoft bg-white px-4 py-3 pr-12 text-sm text-textMain"
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} className="absolute right-2 top-2.5 px-2">
              <Text className="text-xs font-semibold" style={{ color: BRAND }}>
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </Pressable>
          </View>
          <FieldError message={errors.password} />
          {form.password.length > 0 ? <PasswordStrengthHint validation={passwordValidation} /> : null}

          <Text className="mb-1 text-sm text-textMain">Confirmar senha</Text>
          <View className="relative mb-3">
            <TextInput
              value={form.passwordConfirm}
              onChangeText={(v) => patchForm({ passwordConfirm: v })}
              placeholder="Repita a senha"
              secureTextEntry={!showConfirm}
              className="rounded-2xl border border-borderSoft bg-white px-4 py-3 pr-12 text-sm text-textMain"
            />
            <Pressable onPress={() => setShowConfirm((s) => !s)} className="absolute right-2 top-2.5 px-2">
              <Text className="text-xs font-semibold" style={{ color: BRAND }}>
                {showConfirm ? "Ocultar" : "Ver"}
              </Text>
            </Pressable>
          </View>
          <FieldError message={errors.passwordConfirm} />

          <Text className="mb-2 text-sm font-semibold text-textMain">Foto de perfil (opcional)</Text>
          <Pressable
            onPress={pickProfile}
            className="mb-3 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#EAC3D0] bg-[#FFF8FA] py-6"
          >
            {profilePreviewUri ? (
              <Image source={{ uri: profilePreviewUri }} className="h-32 w-32 rounded-xl" resizeMode="cover" />
            ) : (
              <Text className="text-sm text-[#6B5A64]">Toque para escolher imagem</Text>
            )}
          </Pressable>

          <Text className="mb-2 text-sm font-semibold text-textMain">Tipo de cadastro</Text>
          <View className="mb-2 flex-row flex-wrap">
            {["ONG", "Projeto", "Protetor"].map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                className={`mb-2 mr-2 rounded-full border-2 px-4 py-2 ${form.roleOption === r ? "border-brand bg-[#FEF2F4]" : "border-[#EAC3D0] bg-white"}`}
              >
                <Text className={`text-sm font-semibold ${form.roleOption === r ? "text-brand" : "text-textMain"}`}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Como escolher o tipo?",
                "ONG: organização formal com CNPJ.\n\nProjeto: iniciativa com CPF do responsável e número de colaboradores.\n\nProtetor: pessoa física que resgata animais, com CPF."
              )
            }
            className="mb-3"
          >
            <Text className="text-xs font-semibold" style={{ color: BRAND }}>
              ℹ️ Como saber o tipo de projeto?
            </Text>
          </Pressable>

          {role === "ONG" ? (
            <>
              <AppInput
                label="CNPJ"
                value={form.cnpj}
                onChangeText={(v) => patchForm({ cnpj: formatCnpj(v) })}
                placeholder="00.000.000/0000-00"
                keyboardType="number-pad"
              />
              <FieldError message={errors.cnpj} />
            </>
          ) : null}

          {role === "Projeto" ? (
            <>
              <AppInput
                label="CPF do representante"
                value={form.cpf}
                onChangeText={(v) => patchForm({ cpf: formatCpf(v) })}
                placeholder="000.000.000-00"
                keyboardType="number-pad"
              />
              <FieldError message={errors.cpf} />
              <AppInput
                label="Número de colaboradores"
                value={form.collaborators}
                onChangeText={(v) => {
                  const val = onlyPositiveDigits(v);
                  patchForm({ collaborators: val === "0" ? "" : val });
                }}
                placeholder="Mínimo 1"
                keyboardType="number-pad"
              />
              <FieldError message={errors.collaborators} />
            </>
          ) : null}

          {role === "Protetor" ? (
            <>
              <AppInput
                label="CPF"
                value={form.cpf}
                onChangeText={(v) => patchForm({ cpf: formatCpf(v) })}
                placeholder="000.000.000-00"
                keyboardType="number-pad"
              />
              <FieldError message={errors.cpf} />
            </>
          ) : null}

          <Text className="mb-3 text-center text-sm text-textMain">
            Já tem conta?{" "}
            <Text onPress={() => navigation.navigate(ROUTES.Login)} className="font-semibold" style={{ color: BRAND }}>
              Entrar
            </Text>
          </Text>

          <AppButton title={submitting ? "Enviando..." : "Cadastrar"} onPress={onSubmit} disabled={submitting} />
        </PinkCard>
        <View className="h-8" />
      </ScreenContent>
    </AppScreen>
  );
}
