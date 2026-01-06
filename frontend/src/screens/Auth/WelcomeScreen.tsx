// src/screens/Auth/WelcomeScreen.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLORS } from "../../../constants/colors"; // adjust path if needed
import { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 500 });
    opacity.value = withTiming(1, { duration: 500 });
  }, [scale, opacity]);

  const containerAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleGetStarted = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, containerAnim]}>
          {/* Logo section */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              {/* Placeholder logo shape; replace with Image if you have logo asset */}
              <View style={styles.logoInner} />
            </View>
            <Text style={styles.title}>VIORA</Text>
            <Text style={styles.subtitle}>Your post-discharge care companion</Text>
          </View>

          {/* Feature cards */}
          <View style={styles.features}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.featureIconBlue]}>
                <Text style={styles.featureEmoji}>💊</Text>
              </View>
              <Text style={styles.featureText}>Never miss a medication</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.featureIconGreen]}>
                <Text style={styles.featureEmoji}>📋</Text>
              </View>
              <Text style={styles.featureText}>
                Track reports & appointments
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.featureIconBlue]}>
                <Text style={styles.featureEmoji}>👩‍⚕️</Text>
              </View>
              <Text style={styles.featureText}>Chat with AI nurse anytime</Text>
            </View>
          </View>

          {/* Get Started button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Trusted by healthcare providers worldwide
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.primaryBlue,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  features: {
    width: "100%",
    maxWidth: 360,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureIconBlue: {
    backgroundColor: "#E0F2FF",
  },
  featureIconGreen: {
    backgroundColor: "#E0F9EF",
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  button: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryBlue,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  footerText: {
    marginTop: 16,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
