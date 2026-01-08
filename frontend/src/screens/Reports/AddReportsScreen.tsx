// src/screens/Reports/AddReportScreen.tsx

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
import {
  FileText as FileTextIcon,
  Calendar,
  Hospital,
  User as UserIcon,
  Upload,
  ArrowLeft,
  Info,
} from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS } from "../../../constants/colors";
import { api } from "../../../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "AddReport">;

const REPORT_TYPES = [
  "Discharge Summary",
  "Lab Report",
  "Imaging Report",
  "Prescription",
  "Other",
];

export const AddReportScreen: React.FC<Props> = ({ navigation }) => {
  const [reportType, setReportType] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [hospitalName, setHospitalName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectFile = () => {
    // later: integrate real file picker
    setSelectedFile("medical_report_2026.pdf");
  };

  const handleSave = async () => {
    if (!reportType || !date || !hospitalName.trim() || !doctorName.trim()) {
      Alert.alert(
        "Missing info",
        "Please fill report type, date, hospital and doctor name."
      );
      return;
    }

    const isoDate = new Date(date).toISOString();

    try {
      setLoading(true);
      await api.createReport({
        type: reportType,
        file_url: selectedFile || "dummy://local-report.pdf",
        date: isoDate,
        notes:
          notes ||
          `${hospitalName.trim()} - ${doctorName.trim()}`,
      });
      Alert.alert("Success", "Report saved successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save report.");
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
          <Text style={styles.headerTitle}>Upload Medical Report</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Report type */}
        <View style={styles.field}>
          <Text style={styles.label}>Report Type</Text>
          <View style={styles.inputWrapper}>
            <FileTextIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={reportType}
              onChangeText={setReportType}
              placeholder="e.g., Discharge Summary"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date of Report (YYYY-MM-DD)</Text>
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

        {/* Hospital */}
        <View style={styles.field}>
          <Text style={styles.label}>Hospital / Clinic Name</Text>
          <View style={styles.inputWrapper}>
            <Hospital size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={hospitalName}
              onChangeText={setHospitalName}
              placeholder="e.g., Memorial Hospital"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Doctor */}
        <View style={styles.field}>
          <Text style={styles.label}>Doctor Name</Text>
          <View style={styles.inputWrapper}>
            <UserIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="e.g., Dr. Emily Smith"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <View style={styles.inputWrapperPlain}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes about this report"
              style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </View>
        </View>

        {/* File upload (fake) */}
        <View style={styles.field}>
          <Text style={styles.label}>Upload File</Text>
          <TouchableOpacity
            style={[
              styles.uploadCard,
              selectedFile ? styles.uploadCardSelected : undefined,
            ]}
            activeOpacity={0.9}
            onPress={handleSelectFile}
          >
            <View
              style={[
                styles.uploadIconWrapper,
                { backgroundColor: selectedFile ? "#DCFCE7" : "#DBEAFE" },
              ]}
            >
              {selectedFile ? (
                <FileTextIcon size={28} color="#16A34A" />
              ) : (
                <Upload size={28} color="#2563EB" />
              )}
            </View>
            {selectedFile ? (
              <View>
                <Text style={styles.uploadTitle}>{selectedFile}</Text>
                <Text style={styles.uploadSubtitle}>Tap to change file</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.uploadTitle}>Tap to select file</Text>
                <Text style={styles.uploadSubtitle}>
                  PDF, JPG, PNG (Max 10MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Info size={18} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            Your reports are encrypted and stored securely. Only you and your
            authorized care team can access them.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Saving..." : "Save Report"}
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
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  uploadCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  uploadCardSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: "#86EFAC",
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 10,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1D4ED8",
  },
  submitButton: {
    marginTop: 16,
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
