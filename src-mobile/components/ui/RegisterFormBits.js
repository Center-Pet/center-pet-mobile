import React from "react";
import { StyleSheet, Text, View } from "react-native";

const BRAND = "#D14D72";
const VALID = "#4CAF50";
const INVALID = "#F06292";
const MUTED = "#777777";
const METER_BG = "rgba(252, 200, 209, 0.1)";

export function FieldError({ message }) {
  if (!message) return null;
  return <Text style={styles.fieldError}>{message}</Text>;
}

/**
 * Indicador dinâmico igual ao web (Login.css / RegisterOng — .password-strength-meter).
 * `validation` = retorno de validarSenhaForte(senha).
 */
export function PasswordStrengthHint({ validation }) {
  if (!validation || typeof validation !== "object") return null;

  const rows = [
    { ok: validation.comprimentoMinimo, label: "Mínimo de 8 caracteres" },
    { ok: validation.temNumero, label: "Pelo menos um número" },
    { ok: validation.temMaiuscula, label: "Pelo menos uma maiúscula" },
    { ok: validation.temMinuscula, label: "Pelo menos uma minúscula" },
    { ok: validation.temCaractereEspecial, label: "Pelo menos um caractere especial" }
  ];

  return (
    <View style={styles.meter}>
      <Text style={styles.meterTitle}>Requisitos de senha:</Text>
      <View style={styles.requirementsRow}>
        {rows.map((row, i) => (
          <View key={String(i)} style={styles.requirementItem}>
            <View style={[styles.iconWrap, row.ok ? styles.iconValid : styles.iconInvalid]}>
              <Text style={[styles.iconText, row.ok ? styles.iconTextValid : styles.iconTextInvalid]}>
                {row.ok ? "✓" : "○"}
              </Text>
            </View>
            <Text style={[styles.reqLabel, row.ok ? styles.reqValid : styles.reqInvalid]}>{row.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldError: {
    marginBottom: 8,
    fontSize: 12,
    color: "#DC2626"
  },
  meter: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: METER_BG,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  meterTitle: {
    fontSize: 14,
    color: BRAND,
    marginTop: 0,
    marginBottom: 10,
    fontWeight: "600",
    letterSpacing: 0.15
  },
  requirementsRow: {
    flexDirection: "column",
    gap: 5
  },
  requirementItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3
  },
  iconWrap: {
    marginRight: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  iconValid: {
    backgroundColor: "rgba(76, 175, 80, 0.15)"
  },
  iconInvalid: {
    backgroundColor: "rgba(240, 98, 146, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(240, 98, 146, 0.3)"
  },
  iconText: {
    fontSize: 10,
    lineHeight: 12
  },
  iconTextValid: { color: VALID },
  iconTextInvalid: { color: INVALID },
  reqLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  reqValid: {
    color: VALID,
    fontWeight: "500"
  },
  reqInvalid: {
    color: INVALID
  }
});
