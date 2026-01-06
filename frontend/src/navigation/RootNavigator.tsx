// src/navigation/RootNavigator.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../screens/Auth/WelcomeScreen";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { AppTabs } from "./AppTabs";
import { MedicationFormScreen } from "../screens/Medication/AddMedicationScreen";
import { NurseChatScreen } from "../screens/Nurse/NurseChatScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  AppTabs: undefined; // bottom‑tab navigator (Home, Meds, Reports, Nurse, Profile)
  AddMedication: undefined;
  NurseChat: { userName?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Main app after auth (includes ProfileTab inside AppTabs) */}
      <Stack.Screen name="AppTabs" component={AppTabs} />

      {/* Medication flow */}
      <Stack.Screen name="AddMedication" component={MedicationFormScreen} />

      {/* Optional full-screen nurse chat */}
      <Stack.Screen name="NurseChat" component={NurseChatScreen} />
    </Stack.Navigator>
  );
};
