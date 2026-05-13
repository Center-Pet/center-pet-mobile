import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MAX_PET_IMAGES, catBreeds, dogBreeds, specialConditions } from "../../constants/petFormConstants";
import AppButton from "../ui/AppButton";
import AppInput from "../ui/AppInput";

function SelectField({ label, value, placeholder, error, onPress }) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm text-textMain">{label}</Text>
      <Pressable
        onPress={onPress}
        className={`rounded-2xl border bg-white px-4 py-3 ${error ? "border-red-400" : "border-borderSoft"}`}
      >
        <Text className={value ? "text-sm text-textMain" : "text-sm text-gray-400"}>
          {value || placeholder}
        </Text>
      </Pressable>
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}

function PickerModal({ visible, title, options, selectedValue, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="max-h-[75%] rounded-t-3xl border-t border-[#F1C9D6] bg-white px-2 pb-6 pt-4">
          <Text className="mb-2 px-3 text-lg font-semibold text-textMain">{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.value === selectedValue;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className="border-b border-gray-100 px-3 py-3.5 active:bg-[#FEF2F4]"
                >
                  <Text className={`text-sm ${selected ? "font-semibold text-[#D14D72]" : "text-textMain"}`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

function ConditionsModal({ visible, selected, onApply, onClose }) {
  const [local, setLocal] = useState(selected);

  useEffect(() => {
    if (visible) setLocal(selected);
  }, [visible, selected]);

  const toggle = (condition) => {
    if (condition === "Nenhuma") {
      setLocal(["Nenhuma"]);
      return;
    }
    setLocal((prev) => {
      let next = prev.filter((c) => c !== "Nenhuma");
      if (next.includes(condition)) next = next.filter((c) => c !== condition);
      else next = [...next, condition];
      return next.length ? next : ["Nenhuma"];
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="max-h-[80%] rounded-t-3xl border-t border-[#F1C9D6] bg-white px-3 pb-6 pt-4">
          <Text className="mb-2 text-lg font-semibold text-textMain">Condições especiais</Text>
          <ScrollView className="max-h-96" keyboardShouldPersistTaps="handled">
            {specialConditions.map((c) => {
              const on = local.includes(c);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggle(c)}
                  className="mb-2 flex-row items-center rounded-xl border border-borderSoft bg-white px-3 py-3"
                >
                  <View
                    className={`mr-3 h-5 w-5 items-center justify-center rounded border ${
                      on ? "border-[#D14D72] bg-[#D14D72]" : "border-gray-300 bg-white"
                    }`}
                  >
                    {on ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                  </View>
                  <Text className="flex-1 text-sm text-textMain">{c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <AppButton
            title="Aplicar"
            onPress={() => {
              onApply(local);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

function nextAssetId() {
  return `pet-img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @typedef {{ id: string; uri: string; mimeType?: string; fileName?: string }} PetImageAsset
 * @param {{
 *   form: Record<string, any>;
 *   setForm: import("react").Dispatch<import("react").SetStateAction<any>>;
 *   images: PetImageAsset[];
 *   setImages: import("react").Dispatch<import("react").SetStateAction<PetImageAsset[]>>;
 *   errors: Record<string, string | undefined>;
 * }} props
 */
export default function PetForm({ form, setForm, images, setImages, errors = {} }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [picker, setPicker] = useState(null);
  const [conditionsOpen, setConditionsOpen] = useState(false);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((r) => r.json())
      .then(setStates)
      .catch(() => setStates([]));
  }, []);

  useEffect(() => {
    const uf = form.state;
    if (!uf) {
      setCities([]);
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((r) => r.json())
      .then((data) => setCities(Array.isArray(data) ? data.map((m) => m.nome) : []))
      .catch(() => setCities([]));
  }, [form.state]);

  const breedOptions = useMemo(() => {
    const list = form.type === "Cachorro" ? dogBreeds : form.type === "Gato" ? catBreeds : [];
    return list.map((b) => ({ value: b, label: b }));
  }, [form.type]);

  const stateOptions = useMemo(
    () =>
      (Array.isArray(states) ? states : []).map((s) => ({
        value: s.sigla,
        label: `${s.nome} (${s.sigla})`
      })),
    [states]
  );

  const cityOptions = useMemo(() => cities.map((c) => ({ value: c, label: c })), [cities]);

  const openPicker = useCallback((key, title, options) => {
    setPicker({ key, title, options });
  }, []);

  const closePicker = useCallback(() => setPicker(null), []);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissão", "Precisamos de acesso à galeria para escolher fotos.");
      return;
    }
    const remain = MAX_PET_IMAGES - images.length;
    if (remain <= 0) {
      Alert.alert("Limite", `No máximo ${MAX_PET_IMAGES} fotos.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remain,
      quality: 0.85
    });
    if (result.canceled) return;
    const assets = result.assets || [];
    setImages((prev) => {
      const next = [...prev];
      for (const a of assets) {
        if (next.length >= MAX_PET_IMAGES) break;
        next.push({
          id: nextAssetId(),
          uri: a.uri,
          mimeType: a.mimeType,
          fileName: a.fileName
        });
      }
      return next;
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((x) => x.id !== id));
  };

  const conditionsSummary =
    form.specialConditions.length === 0
      ? "Selecione as condições"
      : form.specialConditions.length === 1
        ? form.specialConditions[0]
        : `${form.specialConditions.length} condições selecionadas`;

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-textMain">Fotos do pet (até {MAX_PET_IMAGES})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row pb-1">
          {images.map((img) => (
            <View key={img.id} className="relative mr-2 h-24 w-24 overflow-hidden rounded-xl border border-borderSoft">
              <Image source={{ uri: img.uri }} className="h-full w-full bg-gray-100" />
              <Pressable
                onPress={() => removeImage(img.id)}
                className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-black/55"
              >
                <Text className="text-sm font-bold text-white">×</Text>
              </Pressable>
            </View>
          ))}
          {images.length < MAX_PET_IMAGES ? (
            <Pressable
              onPress={pickImages}
              className="mr-2 h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-[#D14D72] bg-[#FEF2F4]"
            >
              <Text className="text-center text-xs font-semibold text-[#D14D72]">+ Adicionar</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      {errors.images ? <Text className="mb-3 text-xs text-red-600">{errors.images}</Text> : null}

      <AppInput
        label="Nome do pet"
        value={form.name}
        onChangeText={(value) => setForm((p) => ({ ...p, name: value }))}
        placeholder="Nome do pet"
      />
      {errors.name ? <Text className="-mt-2 mb-2 text-xs text-red-600">{errors.name}</Text> : null}

      <AppInput
        label="Biografia"
        value={form.bio}
        onChangeText={(value) => {
          if (value.length > 500) return;
          setForm((p) => ({ ...p, bio: value }));
        }}
        placeholder="Personalidade, rotina, preferências, histórico..."
        multiline
        numberOfLines={5}
      />
      <Text className="-mt-2 mb-2 text-right text-xs text-gray-500">
        {(form.bio || "").length}/500 caracteres
      </Text>
      {errors.bio ? <Text className="-mt-2 mb-2 text-xs text-red-600">{errors.bio}</Text> : null}

      <View className="mb-3 flex-row gap-2">
        <View className="flex-1">
          <SelectField
            label="Espécie"
            value={form.type}
            placeholder="Selecione"
            error={errors.type}
            onPress={() =>
              openPicker("type", "Espécie", [
                { value: "Cachorro", label: "Cachorro" },
                { value: "Gato", label: "Gato" }
              ])
            }
          />
        </View>
        <View className="flex-1">
          <SelectField
            label="Gênero"
            value={form.gender}
            placeholder="Selecione"
            error={errors.gender}
            onPress={() =>
              openPicker("gender", "Gênero", [
                { value: "Macho", label: "Macho" },
                { value: "Fêmea", label: "Fêmea" }
              ])
            }
          />
        </View>
      </View>

      <View className="mb-3 flex-row gap-2">
        <View className="flex-1">
          <SelectField
            label="Idade"
            value={form.age}
            placeholder="Selecione"
            error={errors.age}
            onPress={() =>
              openPicker("age", "Idade", [
                { value: "Filhote", label: "Filhote" },
                { value: "Jovem", label: "Jovem" },
                { value: "Adulto", label: "Adulto" },
                { value: "Idoso", label: "Idoso" }
              ])
            }
          />
        </View>
        <View className="flex-1">
          <SelectField
            label="Porte"
            value={form.size}
            placeholder="Selecione"
            error={errors.size}
            onPress={() =>
              openPicker("size", "Porte", [
                { value: "Pequeno", label: "Pequeno" },
                { value: "Médio", label: "Médio" },
                { value: "Grande", label: "Grande" }
              ])
            }
          />
        </View>
      </View>

      <SelectField
        label="Raça"
        value={form.breed}
        placeholder={form.type ? "Selecione" : "Escolha a espécie primeiro"}
        error={errors.breed}
        onPress={() => {
          if (!form.type) {
            Alert.alert("Espécie", "Selecione Cachorro ou Gato antes da raça.");
            return;
          }
          openPicker("breed", "Raça", breedOptions);
        }}
      />

      <View className="mb-3 flex-row gap-2">
        <View className="flex-1">
          <SelectField
            label="Pelagem"
            value={form.coat}
            placeholder="Selecione"
            error={errors.coat}
            onPress={() =>
              openPicker("coat", "Pelagem", [
                { value: "Curta", label: "Curta" },
                { value: "Média", label: "Média" },
                { value: "Longa", label: "Longa" }
              ])
            }
          />
        </View>
        <View className="flex-1">
          <SelectField
            label="Vacinado"
            value={form.vaccinated}
            placeholder="Selecione"
            error={errors.vaccinated}
            onPress={() =>
              openPicker("vaccinated", "Vacinado", [
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
              ])
            }
          />
        </View>
      </View>

      <View className="mb-3 flex-row gap-2">
        <View className="flex-1">
          <SelectField
            label="Castrado"
            value={form.castrated}
            placeholder="Selecione"
            error={errors.castrated}
            onPress={() =>
              openPicker("castrated", "Castrado", [
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
              ])
            }
          />
        </View>
        <View className="flex-1">
          <SelectField
            label="Vermifugado"
            value={form.dewormed}
            placeholder="Selecione"
            error={errors.dewormed}
            onPress={() =>
              openPicker("dewormed", "Vermifugado", [
                { value: "Sim", label: "Sim" },
                { value: "Não", label: "Não" }
              ])
            }
          />
        </View>
      </View>

      <View className="mb-3">
        <Text className="mb-1 text-sm text-textMain">Condições especiais</Text>
        <Pressable
          onPress={() => setConditionsOpen(true)}
          className={`rounded-2xl border bg-white px-4 py-3 ${errors.specialConditions ? "border-red-400" : "border-borderSoft"}`}
        >
          <Text className="text-sm text-textMain">{conditionsSummary}</Text>
        </Pressable>
        {errors.specialConditions ? (
          <Text className="mt-1 text-xs text-red-600">{errors.specialConditions}</Text>
        ) : null}
      </View>

      <SelectField
        label="Estado"
        value={form.state ? stateOptions.find((o) => o.value === form.state)?.label || form.state : ""}
        placeholder="Selecione o estado"
        error={errors.state}
        onPress={() => openPicker("state", "Estado", stateOptions)}
      />

      <SelectField
        label="Cidade"
        value={form.city}
        placeholder={form.state ? "Selecione a cidade" : "Selecione o estado primeiro"}
        error={errors.city}
        onPress={() => {
          if (!form.state) {
            Alert.alert("Estado", "Selecione o estado antes da cidade.");
            return;
          }
          openPicker("city", "Cidade", cityOptions);
        }}
      />

      <AppInput
        label="Tempo de espera (meses)"
        value={form.waitingTime}
        onChangeText={(value) => setForm((p) => ({ ...p, waitingTime: value.replace(/[^\d]/g, "") }))}
        placeholder="Ex: 2"
        keyboardType="number-pad"
      />
      {errors.waitingTime ? <Text className="-mt-2 mb-2 text-xs text-red-600">{errors.waitingTime}</Text> : null}
      {form.waitingTime !== "" ? (
        <Text className="-mt-2 mb-2 text-xs text-gray-600">
          {parseInt(form.waitingTime, 10) === 1 ? "1 mês" : `${form.waitingTime || 0} meses`}
        </Text>
      ) : null}

      <SelectField
        label="Status"
        value={form.status}
        placeholder="Selecione"
        error={errors.status}
        onPress={() =>
          openPicker("status", "Status", [
            { value: "Disponível", label: "Disponível" },
            { value: "Indisponível", label: "Indisponível" },
            { value: "Adotado", label: "Adotado" },
            { value: "Aguardando", label: "Aguardando" }
          ])
        }
      />

      {picker ? (
        <PickerModal
          visible
          title={picker.title}
          options={picker.options}
          selectedValue={form[picker.key]}
          onClose={closePicker}
          onSelect={(value) => {
            setForm((prev) => {
              const next = { ...prev, [picker.key]: value };
              if (picker.key === "type") next.breed = "";
              if (picker.key === "state") next.city = "";
              return next;
            });
          }}
        />
      ) : null}

      <ConditionsModal
        visible={conditionsOpen}
        selected={form.specialConditions}
        onClose={() => setConditionsOpen(false)}
        onApply={(next) => setForm((p) => ({ ...p, specialConditions: next }))}
      />
    </View>
  );
}
