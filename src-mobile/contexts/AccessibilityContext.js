import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "accessibility-settings";

export const AccessibilityContext = createContext(undefined);

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setHighContrast(Boolean(parsed.highContrast));
          setLargeText(Boolean(parsed.largeText));
          setReducedMotion(Boolean(parsed.reducedMotion));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(next) {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }

  const value = useMemo(
    () => ({
      loading,
      highContrast,
      largeText,
      reducedMotion,
      async setHighContrast(value) {
        setHighContrast(value);
        await save({ highContrast: value, largeText, reducedMotion });
      },
      async setLargeText(value) {
        setLargeText(value);
        await save({ highContrast, largeText: value, reducedMotion });
      },
      async setReducedMotion(value) {
        setReducedMotion(value);
        await save({ highContrast, largeText, reducedMotion: value });
      }
    }),
    [highContrast, largeText, loading, reducedMotion]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
