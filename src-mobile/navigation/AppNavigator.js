import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import PetDetailsScreen from "../screens/PetDetailsScreen";
import CatalogScreen from "../screens/CatalogScreen";
import CatalogFilterScreen from "../screens/CatalogFilterScreen";
import OngProfileScreen from "../screens/OngProfileScreen";
import AdopterProfileScreen from "../screens/AdopterProfileScreen";
import RegisterPetScreen from "../screens/RegisterPetScreen";
import EditPetScreen from "../screens/EditPetScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import FormSafeAdopterScreen from "../screens/FormSafeAdopterScreen";
import RegisterOngScreen from "../screens/RegisterOngScreen";
import EditUserScreen from "../screens/EditUserScreen";
import EditOrgScreen from "../screens/EditOrgScreen";
import DashboardScreen from "../screens/DashboardScreen";
import TermsScreen from "../screens/TermsScreen";
import AdoptionScreen from "../screens/AdoptionScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HomeOngScreen from "../screens/HomeOngScreen";
import TestDraftScreen from "../screens/TestDraftScreen";
import { ROUTES } from "./routeNames";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, isAuthenticated, userType } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.Home} component={HomeScreen} />
      <Stack.Screen name={ROUTES.Catalog} component={CatalogScreen} />
      <Stack.Screen name={ROUTES.CatalogFilter} component={CatalogFilterScreen} />
      <Stack.Screen name={ROUTES.PetInfo} component={PetDetailsScreen} />
      <Stack.Screen name={ROUTES.OngProfile} component={OngProfileScreen} />
      <Stack.Screen name={ROUTES.Terms} component={TermsScreen} />
      <Stack.Screen name={ROUTES.Settings} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.TestDraft} component={TestDraftScreen} />
      <Stack.Screen name={ROUTES.NotFound} component={NotFoundScreen} />
      <Stack.Screen name={ROUTES.ResetPassword} component={ResetPasswordScreen} />
      <Stack.Screen name={ROUTES.ForgotPassword} component={ForgotPasswordScreen} />

      {!isAuthenticated && (
        <>
          <Stack.Screen name={ROUTES.Login} component={LoginScreen} />
          <Stack.Screen name={ROUTES.RegisterOng} component={RegisterOngScreen} />
        </>
      )}

      {isAuthenticated && (userType === "Ong" || userType === "ONG") && (
        <>
          <Stack.Screen name={ROUTES.HomeOng} component={HomeOngScreen} />
          <Stack.Screen name={ROUTES.RegisterPet} component={RegisterPetScreen} />
          <Stack.Screen name={ROUTES.EditPet} component={EditPetScreen} />
          <Stack.Screen name={ROUTES.EditOrg} component={EditOrgScreen} />
          <Stack.Screen name={ROUTES.Adoption} component={AdoptionScreen} />
          <Stack.Screen name={ROUTES.Dashboard} component={DashboardScreen} />
        </>
      )}

      {isAuthenticated && userType !== "Ong" && userType !== "ONG" && (
        <>
          <Stack.Screen name={ROUTES.AdopterProfile} component={AdopterProfileScreen} />
          <Stack.Screen name={ROUTES.EditUser} component={EditUserScreen} />
          <Stack.Screen name={ROUTES.FormSafeAdopter} component={FormSafeAdopterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
