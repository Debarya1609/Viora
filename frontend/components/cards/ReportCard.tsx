// src/components/cards/ReportCard.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, MapPin, FileText } from "lucide-react-native";
import { COLORS } from "../../constants/colors";
import { PatientReport } from "../../services/api";

type Props = {
  report: PatientReport;
  onPress?: () => void;
};

export const ReportCard: React.FC<Props> = ({ report, onPress }) => {
  const dateText = report.date
    ? new Date(report.date).toDateString()
    : "Date not set";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <FileText size={24} color={COLORS.primaryBlue} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{report.type || "Medical Report"}</Text>
          <View style={styles.metaRow}>
            <Calendar size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{dateText}</Text>
          </View>
          {report.notes ? (
            <View style={styles.metaRow}>
              <MapPin size={16} color="#9CA3AF" />
              <Text style={styles.metaText} numberOfLines={1}>
                {report.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Text style={styles.viewText}>View Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  viewButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
