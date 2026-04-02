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
    <Stack.Navigator>
      <Stack.Screen name={ROUTES.Home} component={HomeScreen} options={{ title: "Center Pet" }} />
      <Stack.Screen name={ROUTES.Catalog} component={CatalogScreen} options={{ title: "Catalogo" }} />
      <Stack.Screen name={ROUTES.CatalogFilter} component={CatalogFilterScreen} options={{ title: "Filtro" }} />
      <Stack.Screen name={ROUTES.PetInfo} component={PetDetailsScreen} options={{ title: "Pet" }} />
      <Stack.Screen name={ROUTES.OngProfile} component={OngProfileScreen} options={{ title: "Perfil da ONG" }} />
      <Stack.Screen name={ROUTES.Terms} component={TermsScreen} options={{ title: "Termos" }} />
      <Stack.Screen name={ROUTES.Settings} component={SettingsScreen} options={{ title: "Configuracoes" }} />
      <Stack.Screen name={ROUTES.TestDraft} component={TestDraftScreen} options={{ title: "Testes" }} />
      <Stack.Screen name={ROUTES.NotFound} component={NotFoundScreen} options={{ title: "Nao encontrada" }} />
      <Stack.Screen name={ROUTES.ResetPassword} component={ResetPasswordScreen} options={{ title: "Redefinir senha" }} />
      <Stack.Screen
        name={ROUTES.ForgotPassword}
        component={ForgotPasswordScreen}
        options={{ title: "Recuperar senha" }}
      />

      {!isAuthenticated && (
        <>
          <Stack.Screen name={ROUTES.Login} component={LoginScreen} options={{ title: "Entrar" }} />
          <Stack.Screen
            name={ROUTES.RegisterOng}
            component={RegisterOngScreen}
            options={{ title: "Cadastro ONG" }}
          />
        </>
      )}

      {isAuthenticated && (userType === "Ong" || userType === "ONG") && (
        <>
          <Stack.Screen name={ROUTES.HomeOng} component={HomeOngScreen} options={{ title: "Home ONG" }} />
          <Stack.Screen
            name={ROUTES.RegisterPet}
            component={RegisterPetScreen}
            options={{ title: "Cadastrar pet" }}
          />
          <Stack.Screen name={ROUTES.EditPet} component={EditPetScreen} options={{ title: "Editar pet" }} />
          <Stack.Screen name={ROUTES.EditOrg} component={EditOrgScreen} options={{ title: "Editar ONG" }} />
          <Stack.Screen name={ROUTES.Adoption} component={AdoptionScreen} options={{ title: "Adocao" }} />
          <Stack.Screen name={ROUTES.Dashboard} component={DashboardScreen} options={{ title: "Dashboard" }} />
        </>
      )}

      {isAuthenticated && userType !== "Ong" && userType !== "ONG" && (
        <>
          <Stack.Screen
            name={ROUTES.AdopterProfile}
            component={AdopterProfileScreen}
            options={{ title: "Meu perfil" }}
          />
          <Stack.Screen name={ROUTES.EditUser} component={EditUserScreen} options={{ title: "Editar perfil" }} />
          <Stack.Screen
            name={ROUTES.FormSafeAdopter}
            component={FormSafeAdopterScreen}
            options={{ title: "Adotante seguro" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
