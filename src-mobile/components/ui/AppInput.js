import React from "react";
import { Text, TextInput, View } from "react-native";
import { useAccessibility } from "../../hooks/useAccessibility";

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline = false,
  numberOfLines = 1,
  ...rest
}) {
  const { largeText } = useAccessibility();
  return (
    <View className="mb-3">
      {label ? <Text className={`mb-1 text-textMain ${largeText ? "text-base" : "text-sm"}`}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className={`rounded-2xl border border-borderSoft bg-white px-4 py-3 text-textMain ${
          largeText ? "text-base" : "text-sm"
        }`}
        {...rest}
      />
    </View>
  );
}
