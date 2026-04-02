import React from "react";
import { ScrollView } from "react-native";
import AppButton from "../ui/AppButton";
import AppInput from "../ui/AppInput";

export default function PetForm({ form, setForm, onSubmit, submitLabel, onPickImage }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppInput
        label="Nome do pet"
        value={form.name}
        onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
      />
      <AppInput
        label="Tipo"
        value={form.type}
        onChangeText={(value) => setForm((prev) => ({ ...prev, type: value }))}
      />
      <AppInput
        label="Idade"
        value={form.age}
        onChangeText={(value) => setForm((prev) => ({ ...prev, age: value }))}
      />
      <AppInput
        label="Status"
        value={form.status}
        onChangeText={(value) => setForm((prev) => ({ ...prev, status: value }))}
      />
      <AppInput
        label="Condicao especial"
        value={form.specialCondition}
        onChangeText={(value) => setForm((prev) => ({ ...prev, specialCondition: value }))}
      />
      <AppButton title="Selecionar foto" variant="secondary" onPress={onPickImage} />
      <AppButton className="mt-2" title={submitLabel} onPress={onSubmit} />
    </ScrollView>
  );
}
