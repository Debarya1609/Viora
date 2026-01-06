import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS } from "../../../constants/colors";

type Props = NativeStackScreenProps<RootStackParamList, "AddMedication">;

export const MedicationFormScreen: React.FC<Props> = ({ navigation }) => {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [times, setTimes] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    // TODO: save to state/backend later
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add medication</Text>
          <Text style={styles.headerSubtitle}>
            Set up a new reminder for your medication
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormField
            label="Medication name"
            placeholder="e.g., Metformin"
            value={medName}
            onChangeText={setMedName}
          />
          <FormField
            label="Dosage"
            placeholder="e.g., 500mg"
            value={dosage}
            onChangeText={setDosage}
          />
          <FormField
            label="Frequency"
            placeholder="e.g., 2x daily"
            value={frequency}
            onChangeText={setFrequency}
          />
          <FormField
            label="Reminder times"
            placeholder="e.g., 8:00 AM, 8:00 PM"
            value={times}
            onChangeText={setTimes}
          />
          <FormField
            label="Notes"
            placeholder="Take with food, watch for side effects..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryText}>Add reminder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      style={[styles.input, multiline && styles.inputMultiline]}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  </View>
);

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
    marginBottom: 24,
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
  form: {
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
  inputMultiline: {
    height: 96,
    paddingTop: 10,
    paddingBottom: 10,
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
