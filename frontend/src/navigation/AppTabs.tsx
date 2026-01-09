// src/navigation/AppTabs.tsx

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
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
  NurseTab: undefined;
  ReportsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

// Custom bottom bar
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const id =
            route.name === "HomeTab"
              ? "home"
              : route.name === "MedicationsTab"
              ? "medications"
              : route.name === "NurseTab"
              ? "nurse"
              : route.name === "ReportsTab"
              ? "reports"
              : "profile";

          const isCenter = id === "nurse";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          let IconComponent: React.ComponentType<any> = HomeIcon;
          if (route.name === "MedicationsTab") IconComponent = Pill;
          if (route.name === "ReportsTab") IconComponent = FileText;
          if (route.name === "NurseTab") IconComponent = MessageCircle;
          if (route.name === "ProfileTab") IconComponent = User;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.9}
              style={[
                styles.tabItem,
                isCenter ? styles.centerTabItem : undefined,
              ]}
            >
              {isCenter ? (
                <View style={styles.centerTabWrapper}>
                  <View
                    style={[
                      styles.centerCircle,
                      {
                        backgroundColor: isFocused
                          ? COLORS.primaryBlue
                          : "rgb(117, 145, 167)",
                      },
                    ]}
                  >
                    <Image
                      source={require("../../assets/images/nurse-icon.png")}
                      style={styles.centerLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.centerLabel,
                      { color: isFocused ? COLORS.primaryBlue : "#4B5563" },
                    ]}
                  >
                    Nurse
                  </Text>
                </View>
              ) : (
                <View style={styles.regularTabWrapper}>
                  <IconComponent
                    size={24}
                    color={isFocused ? COLORS.primaryBlue : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isFocused ? COLORS.primaryBlue : "#6B7280",
                        fontWeight: isFocused ? "600" : "400",
                      },
                    ]}
                  >
                    {label as string}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
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
        name="NurseTab"
        component={NurseChatScreen}
        options={{ title: "Nurse" }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{ title: "Reports" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 2,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 6,
  },
  tabBarInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTabItem: {
    marginTop: -20,
  },
  regularTabWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  centerTabWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 2,
  },
  centerLogo: {
    width: 45,
    height: 45,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
