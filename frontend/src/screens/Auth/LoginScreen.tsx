// src/screens/Auth/LoginScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Mail, Lock, ArrowLeft } from "lucide-react-native";
import { api, setToken } from "../../../services/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS } from "../../../constants/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });
  }, [scale, opacity]);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAuthSuccess = async () => {
    try {
      const status = await api.getProfileStatus();
      if (status.needs_profile) {
        navigation.reset({
          index: 0,
          routes: [{ name: "ProfileOnboarding" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "AppTabs" }],
        });
      }
    } catch {
      navigation.reset({
        index: 0,
        routes: [{ name: "AppTabs" }],
      });
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(email, password);
      setToken(res.token);
      await handleAuthSuccess();
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot password",
      "Password reset flow will be added in a future version."
    );
  };

  const handleLoginWithGoogle = () => {
    Alert.alert(
      "Google sign-in",
      "Google authentication will be integrated here later."
    );
  };

  const handleLoginWithFacebook = () => {
    Alert.alert(
      "Facebook sign-in",
      "Facebook authentication will be integrated here later."
    );
  };

  const handleCreateAccount = () => {
    navigation.navigate("Register" as never);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, headerStyle]}>
          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your care journey
            </Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.forgotRow}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={loading}
            >
              <Text style={styles.signInText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialGroup}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleLoginWithGoogle}
                activeOpacity={0.9}
              >
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleLoginWithFacebook}
                activeOpacity={0.9}
              >
                <Text style={[styles.socialIcon, { color: "#1877F2" }]}>f</Text>
                <Text style={styles.socialText}>Continue with Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.createRow}>
              <Text style={styles.createLabel}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleCreateAccount}>
                <Text style={styles.createLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  headerLogoText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryBlue,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  content: {
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primaryBlue,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 380,
    marginTop: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 14,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primaryBlue,
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  signInText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },
  socialGroup: {
    gap: 10,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  socialIcon: {
    fontSize: 18,
    color: "#4285F4",
    marginRight: 10,
  },
  socialText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  createRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  createLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  createLink: {
    fontSize: 14,
    color: COLORS.primaryBlue,
    fontWeight: "600",
  },
});
