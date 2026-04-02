import React from "react";
import { Pressable, Text } from "react-native";
import { useAccessibility } from "../../hooks/useAccessibility";

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  className = ""
}) {
  const { largeText } = useAccessibility();
  const variantClass =
    variant === "secondary"
      ? "bg-brandSoft border border-brand"
      : variant === "danger"
        ? "bg-red-500"
        : "bg-brand";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-2xl px-4 py-3 ${variantClass} ${disabled ? "opacity-60" : ""} ${className}`}
    >
      <Text
        className={`font-semibold ${largeText ? "text-base" : "text-sm"} ${
          variant === "secondary" ? "text-brand" : "text-white"
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
