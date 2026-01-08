// src/screens/Appointments/AddAppointmentScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { Calendar, Clock, User as UserIcon, FileText, ArrowLeft, Info } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS } from "../../../constants/colors";
import { api } from "../../../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "AddAppointment">;

const DOCTORS = [
  { id: "1", name: "Dr. Emily Smith", specialty: "Cardiology" },
  { id: "2", name: "Dr. Sarah Johnson", specialty: "Internal Medicine" },
  { id: "3", name: "Dr. Michael Chen", specialty: "Radiology" },
  { id: "4", name: "Dr. James Wilson", specialty: "General Practice" },
];

export const AddAppointmentScreen: React.FC<Props> = ({ navigation }) => {
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");   // yyyy-mm-dd
  const [time, setTime] = useState("");   // HH:mm
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!doctorId || !date || !time || !reason.trim()) {
      Alert.alert("Missing info", "Please fill doctor, date, time and reason.");
      return;
    }

    // Build ISO start_time string
    const start_time = new Date(`${date}T${time}:00`).toISOString();

    try {
      setLoading(true);
      await api.createAppointment({
        doctor_id: doctorId,
        start_time,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });
      Alert.alert("Success", "Appointment booked successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Info size={18} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            You can manage appointments from the Health Records tab.
          </Text>
        </View>

        {/* Doctor */}
        <View style={styles.field}>
          <Text style={styles.label}>Select Doctor</Text>
          <View style={styles.inputWrapper}>
            <UserIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={
                DOCTORS.find((d) => d.id === doctorId)
                  ? `${DOCTORS.find((d) => d.id === doctorId)?.name} - ${
                      DOCTORS.find((d) => d.id === doctorId)?.specialty
                    }`
                  : ""
              }
              placeholder="Tap to type doctor name or ID"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              onChangeText={(text) => {
                // simplest: treat as free text mapped to doctor_id
                setDoctorId(text.trim());
              }}
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <View style={styles.inputWrapper}>
            <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2026-01-09"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Time */}
        <View style={styles.field}>
          <Text style={styles.label}>Time (HH:MM)</Text>
          <View style={styles.inputWrapper}>
            <Clock size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="10:30"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Reason */}
        <View style={styles.field}>
          <Text style={styles.label}>Reason for Visit</Text>
          <View style={styles.inputWrapperPlain}>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Follow-up consultation"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <View style={styles.inputWrapperPlain}>
            <FileText size={20} color="#9CA3AF" style={styles.inputIconTop} />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional information for the doctor"
              style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Booking..." : "Confirm Booking"}
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
  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primaryBlue,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1D4ED8",
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
  },
  inputWrapperPlain: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputIconTop: {
    marginTop: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
