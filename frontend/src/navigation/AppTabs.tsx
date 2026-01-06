// src/navigation/AppTabs.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/Home/HomeScreen";
import { MedicationsScreen } from "../screens/Medication/MedicationListScreen";
import { ReportsScreen } from "../screens/Reports/ReportsScreen";
import { NurseChatScreen } from "../screens/Nurse/NurseChatScreen";
import { ProfileScreen } from "../screens/Profile/ProfileScreen";
import { COLORS } from "../../constants/colors";
import {
  Home as HomeIcon,
  Pill,
  FileText,
  MessageCircle,
  User,
} from "lucide-react-native";

export type AppTabsParamList = {
  HomeTab: undefined;
  MedicationsTab: undefined;
  ReportsTab: undefined;
  NurseTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryBlue,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: { backgroundColor: "#FFFFFF" },
        tabBarIcon: ({ color, size }) => {
          let Icon = HomeIcon;
          if (route.name === "MedicationsTab") Icon = Pill;
          if (route.name === "ReportsTab") Icon = FileText;
          if (route.name === "NurseTab") Icon = MessageCircle;
          if (route.name === "ProfileTab") Icon = User;
          return <Icon color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="MedicationsTab"
        component={MedicationsScreen}
        options={{ title: "Medications" }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{ title: "Reports" }}
      />
      <Tab.Screen
        name="NurseTab"
        component={NurseChatScreen}
        options={{ title: "Nurse" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};
