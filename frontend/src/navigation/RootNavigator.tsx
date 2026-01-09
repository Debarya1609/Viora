// src/navigation/RootNavigator.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../screens/Auth/WelcomeScreen";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { RegisterScreen } from "../screens/Auth/RegisterScreen";
import { AppTabs } from "./AppTabs";
import { MedicationFormScreen } from "../screens/Medication/AddMedicationScreen";
import { NurseChatScreen } from "../screens/Nurse/NurseChatScreen";
import { AddReportScreen } from "../screens/Reports/AddReportsScreen";
import { AddAppointmentScreen } from "../screens/Reports/AddAppointmentScreen";
import { ProfileOnboardingScreen } from "../screens/Profile/ProfileOnboardingScreen";
import MedicationsScreen from "../screens/Medication/MedicationListScreen";
import { Medication } from "../../services/api";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  AppTabs: undefined;
  ProfileOnboarding:
    | {
        initialName?: string;
      }
    | undefined;

  // Medication flow
  // AddMedication can receive an optional medication when editing
  AddMedication:
    | {
        medication?: Medication;
      }
    | undefined;

  Medications: undefined;

  AddAppointment: undefined;
  AddReport: undefined;

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
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Profile onboarding (forced after auth if needed) */}
      <Stack.Screen
        name="ProfileOnboarding"
        component={ProfileOnboardingScreen}
      />

      {/* Main app after auth (includes Profile tab inside AppTabs) */}
      <Stack.Screen name="AppTabs" component={AppTabs} />

      {/* Medication flow */}
      <Stack.Screen name="AddMedication" component={MedicationFormScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />

      {/* Nurse chat & records */}
      <Stack.Screen name="NurseChat" component={NurseChatScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
      <Stack.Screen name="AddReport" component={AddReportScreen} />
    </Stack.Navigator>
  );
};
