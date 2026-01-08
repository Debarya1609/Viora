// src/navigation/RootNavigator.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../screens/Auth/WelcomeScreen";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { AppTabs } from "./AppTabs";
import { MedicationFormScreen } from "../screens/Medication/AddMedicationScreen";
import { NurseChatScreen } from "../screens/Nurse/NurseChatScreen";
import { RegisterScreen } from "../screens/Auth/RegisterScreen";
import { AddReportScreen } from "../screens/Reports/AddReportsScreen";
import { AddAppointmentScreen } from "../screens/Reports/AddAppointmentScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  AppTabs: undefined; 
  AddMedication: undefined;
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

      {/* Main app after auth (includes ProfileTab inside AppTabs) */}
      <Stack.Screen name="AppTabs" component={AppTabs} />

      {/* Medication flow */}
      <Stack.Screen name="AddMedication" component={MedicationFormScreen} />

      {/* Optional full-screen nurse chat */}
      <Stack.Screen name="NurseChat" component={NurseChatScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
      <Stack.Screen name="AddReport" component={AddReportScreen} />

    </Stack.Navigator>
  );
};
