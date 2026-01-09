// src/screens/Profile/ProfileOnboardingScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS } from "../../../constants/colors";
import { api } from "../../../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileOnboarding">;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type Gender = "Male" | "Female" | "Other";

export const ProfileOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
  if (!fullName || !dateOfBirth || !gender || !bloodGroup) {
    setError("Please fill all required fields");
    return;
  }

  try {
    setSaving(true);
    setError(null);

    await api.updatePatientProfile({
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      gender,
      phone: phone || null,
      address: address || null,
      blood_group: bloodGroup,
      conditions: conditions || null,
      allergies: allergies || null,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: "AppTabs" }],
    });
  } catch (e: any) {
    setError(e.message || "Failed to save profile");
  } finally {
    setSaving(false);
  }
};


  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete your profile</Text>
          <Text style={styles.headerSubtitle}>
            This helps your care team understand you better
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.card}>
          {/* Full Name */}
          <Text style={styles.label}>Full name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
          />

          {/* Date of Birth – later: wire a date picker */}
          <Text style={styles.label}>Date of birth *</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />

          {/* Gender segmented buttons */}
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            {(["Male", "Female", "Other"] as Gender[]).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderChip,
                  gender === g && styles.genderChipActive,
                ]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    gender === g && styles.genderChipTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 ..."
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={address}
            onChangeText={setAddress}
            placeholder="Street, City, State, PIN"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />

          {/* Blood group – simple row of chips or dropdown */}
          <Text style={styles.label}>Blood group *</Text>
          <View style={styles.bloodRow}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[
                  styles.bloodChip,
                  bloodGroup === bg && styles.bloodChipActive,
                ]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text
                  style={[
                    styles.bloodChipText,
                    bloodGroup === bg && styles.bloodChipTextActive,
                  ]}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conditions */}
          <Text style={styles.label}>Known conditions</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={conditions}
            onChangeText={setConditions}
            placeholder="e.g., Diabetes, Hypertension"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />

          {/* Allergies */}
          <Text style={styles.label}>Allergies</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={allergies}
            onChangeText={setAllergies}
            placeholder="e.g., Penicillin, Peanuts"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? "Saving..." : "Save and continue"}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    fontSize: 13,
  },
  card: {
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: "#F9FAFB",
  },
  multiline: {
    height: 90,
    paddingTop: 10,
    paddingBottom: 10,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  genderChipActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  genderChipText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  genderChipTextActive: {
    color: "#FFFFFF",
  },
  bloodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: "#F9FAFB",
  },
  bloodChipActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  bloodChipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  bloodChipTextActive: {
    color: "#FFFFFF",
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
