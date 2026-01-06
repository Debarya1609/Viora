// src/screens/Medication/MedicationListScreen.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Pill,
  Clock,
  Info,
  Plus,
  CheckCircle,
} from "lucide-react-native";
import { COLORS } from "../../../constants/colors";

const medications = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500mg",
    frequency: "2x daily",
    times: ["8:00 AM", "8:00 PM"],
    nextDose: "8:00 PM",
    status: "upcoming",
    notes: "Take with food",
  },
  {
    id: 2,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "1x daily",
    times: ["8:00 AM"],
    nextDose: "Tomorrow 8:00 AM",
    status: "taken",
    notes: "For blood pressure",
  },
  {
    id: 3,
    name: "Aspirin",
    dosage: "81mg",
    frequency: "1x daily",
    times: ["2:00 PM"],
    nextDose: "2:00 PM",
    status: "upcoming",
    notes: "Low dose",
  },
  {
    id: 4,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "1x daily",
    times: ["9:00 PM"],
    nextDose: "9:00 PM",
    status: "upcoming",
    notes: "Take at bedtime",
  },
  {
    id: 5,
    name: "Omeprazole",
    dosage: "40mg",
    frequency: "1x daily",
    times: ["7:00 AM"],
    nextDose: "Tomorrow 7:00 AM",
    status: "missed",
    notes: "Before breakfast",
  },
];

export const MedicationsScreen: React.FC<any> = ({ navigation }) => {
  const handleAddMedication = () => {
    navigation.navigate("AddMedication");
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medications</Text>
          <Text style={styles.headerSubtitle}>Your medication schedule</Text>
        </View>

        <View style={styles.body}>
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryLabel}>Today&apos;s Progress</Text>
                <Text style={styles.summaryValue}>3/5</Text>
              </View>
              <View style={styles.circleWrapper}>
                <View style={styles.circleBg} />
              </View>
            </View>
            <Text style={styles.summaryText}>
              Keep it up! You&apos;re on track today.
            </Text>
          </View>

          {/* Medications list */}
          {medications.map((med) => {
            const bgColor =
              med.status === "taken"
                ? "#ECFDF3"
                : med.status === "missed"
                ? "#FEF2F2"
                : "#FFFFFF";

            const borderColor =
              med.status === "taken"
                ? "#BBF7D0"
                : med.status === "missed"
                ? "#FECACA"
                : "#E5E7EB";

            const iconBg =
              med.status === "taken"
                ? "#DCFCE7"
                : med.status === "missed"
                ? "#FEE2E2"
                : "#DBEAFE";

            const iconColor =
              med.status === "taken"
                ? "#16A34A"
                : med.status === "missed"
                ? "#DC2626"
                : COLORS.primaryBlue;

            const noteBg =
              med.status === "taken"
                ? "#DCFCE7"
                : med.status === "missed"
                ? "#FEE2E2"
                : "#DBEAFE";

            const noteIconColor =
              med.status === "taken"
                ? "#16A34A"
                : med.status === "missed"
                ? "#DC2626"
                : COLORS.primaryBlue;

            const nextDoseColor =
              med.status === "taken"
                ? "#15803D"
                : med.status === "missed"
                ? "#B91C1C"
                : "#1D4ED8";

            return (
              <View
                key={med.id}
                style={[
                  styles.medCard,
                  { backgroundColor: bgColor, borderColor },
                ]}
              >
                <View style={styles.medTopRow}>
                  <View
                    style={[
                      styles.medIconCircle,
                      { backgroundColor: iconBg },
                    ]}
                  >
                    {med.status === "taken" ? (
                      <CheckCircle size={24} color={iconColor} />
                    ) : (
                      <Pill size={24} color={iconColor} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDosage}>
                      {med.dosage} • {med.frequency}
                    </Text>
                    <View style={styles.medTimesRow}>
                      <Clock size={16} color="#9CA3AF" />
                      <Text style={styles.medTimesText}>
                        {med.times.join(", ")}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.medNote,
                        { backgroundColor: noteBg },
                      ]}
                    >
                      <Info size={16} color={noteIconColor} />
                      <Text style={styles.medNoteText}>{med.notes}</Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.medFooter,
                    { borderTopColor: borderColor },
                  ]}
                >
                  <View>
                    <Text style={styles.footerLabel}>Next dose</Text>
                    <Text
                      style={[
                        styles.footerNextDose,
                        { color: nextDoseColor },
                      ]}
                    >
                      {med.nextDose}
                    </Text>
                  </View>

                  {med.status === "upcoming" && (
                    <TouchableOpacity style={styles.actionPrimary}>
                      <Text style={styles.actionPrimaryText}>Mark Taken</Text>
                    </TouchableOpacity>
                  )}

                  {med.status === "missed" && (
                    <TouchableOpacity style={styles.actionDanger}>
                      <Text style={styles.actionDangerText}>Take Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddMedication}
        activeOpacity={0.9}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primaryBlue,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#DBEAFE",
  },
  body: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  circleWrapper: {
    width: 64,
    height: 64,
  },
  circleBg: {
    flex: 1,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#3B82F6",
    opacity: 0.7,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  medCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  medTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  medIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  medName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  medDosage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  medTimesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  medTimesText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  medNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 2,
    gap: 6,
  },
  medNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  medFooter: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footerNextDose: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionPrimary: {
    borderRadius: 10,
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionDanger: {
    borderRadius: 10,
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionDangerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
