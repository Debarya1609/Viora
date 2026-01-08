// src/screens/Medication/AddMedicationScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS } from "../../../constants/colors";
import { api } from "../../../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "AddMedication">;

const FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Every 8 hours",
  "Every 6 hours",
  "Every 12 hours",
];

export const MedicationFormScreen: React.FC<Props> = ({ navigation }) => {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<string>("Once daily");
  const [showFrequencyOptions, setShowFrequencyOptions] = useState(false);

  const [time, setTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangeTime = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") {
      setShowTimePicker(false);
    }
    if (selected) {
      setTime(selected);
    }
  };

  const formattedTime = time
    ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const handleSave = async () => {
    if (!medName.trim()) {
      setError("Medication name is required");
      return;
    }

    try {
      setError(null);
      setSaving(true);

      // For now, backend still ignores time; we just store frequency and notes.
      await api.createMedication({
        name: medName.trim(),
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        route: undefined,
        start_date: null,
        end_date: null,
        instructions: notes || undefined,
      });

      navigation.goBack(); // list refetches on focus
    } catch (e: any) {
      setError(e.message || "Failed to save medication");
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
          <Text style={styles.headerTitle}>Add medication</Text>
          <Text style={styles.headerSubtitle}>
            Set up a new reminder for your medication
          </Text>
        </View>

        {/* Error */}
        {error && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: "red", fontSize: 13 }}>{error}</Text>
          </View>
        )}

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

          {/* Frequency as dropdown */}
          <View style={styles.field}>
            <Text style={styles.label}>Frequency</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowFrequencyOptions((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectInputText}>
                {frequency || "Select frequency"}
              </Text>
            </TouchableOpacity>

            {showFrequencyOptions && (
              <View style={styles.dropdown}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFrequency(opt);
                      setShowFrequencyOptions(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Reminder time with time picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Reminder time</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.selectInputText,
                  !formattedTime && { color: "#9CA3AF" },
                ]}
              >
                {formattedTime || "Select time"}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                value={time || new Date()}
                onChange={handleChangeTime}
              />
            )}
          </View>

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
            disabled={saving}
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryText}>Add reminder</Text>
            )}
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
  selectInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  selectInputText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
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

export default MedicationFormScreen;
