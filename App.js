import React from "react";
import "react-native-gesture-handler";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src-mobile/contexts/AuthContext";
import { AccessibilityProvider } from "./src-mobile/contexts/AccessibilityContext";
import AppNavigator from "./src-mobile/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
