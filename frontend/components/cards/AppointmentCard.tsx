// src/components/cards/AppointmentCard.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, MapPin, CheckCircle, X } from "lucide-react-native";
import { COLORS } from "../../constants/colors";
import { Appointment } from "../../services/api";

type Props = {
  appointment: Appointment;
  variant: "upcoming" | "past";
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

export const AppointmentCard: React.FC<Props> = ({
  appointment,
  variant,
  onPrimaryPress,
  onSecondaryPress,
}) => {
  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";

  const dateText = new Date(appointment.start_time).toLocaleString();

  if (variant === "upcoming") {
    return (
      <View style={styles.upcomingCard}>
        <View style={styles.upcomingTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{appointment.reason || "Appointment"}</Text>
            <Text style={styles.doctor}>
              Doctor: {appointment.doctor_id.slice(0, 6)}...
            </Text>
            <View style={styles.metaRow}>
              <Calendar size={16} color="#9CA3AF" />
              <Text style={styles.metaText}>{dateText}</Text>
            </View>
            {appointment.notes ? (
              <View style={styles.metaRow}>
                <MapPin size={16} color="#9CA3AF" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {appointment.notes}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.chipConfirmed}>
            <CheckCircle size={14} color="#16A34A" />
            <Text style={styles.chipConfirmedText}>Scheduled</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onPrimaryPress && (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={onPrimaryPress}
            >
              <Text style={styles.primaryText}>View Details</Text>
            </TouchableOpacity>
          )}
          {onSecondaryPress && (
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.9}
              onPress={onSecondaryPress}
            >
              <Text style={styles.secondaryText}>Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // past variant
  return (
    <View
      style={[
        styles.pastCard,
        isCompleted ? styles.pastCardCompleted : styles.pastCardCancelled,
      ]}
    >
      <View style={styles.pastTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{appointment.reason || "Appointment"}</Text>
          <Text style={styles.doctor}>
            Doctor: {appointment.doctor_id.slice(0, 6)}...
          </Text>
          <View style={styles.metaRow}>
            <Calendar size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{dateText}</Text>
          </View>
        </View>

        {isCompleted ? (
          <View style={styles.chipCompleted}>
            <CheckCircle size={14} color="#4B5563" />
            <Text style={styles.chipCompletedText}>Completed</Text>
          </View>
        ) : (
          <View style={styles.chipCancelled}>
            <X size={14} color="#DC2626" />
            <Text style={styles.chipCancelledText}>
              {isCancelled ? "Cancelled" : "No show"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  upcomingCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 10,
  },
  upcomingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  doctor: {
    fontSize: 14,
    color: COLORS.primaryBlue,
    fontWeight: "500",
    marginBottom: 4,
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
  chipConfirmed: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#DCFCE7",
    gap: 4,
  },
  chipConfirmedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  pastCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pastCardCompleted: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  pastCardCancelled: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  pastTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chipCompleted: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E5E7EB",
    gap: 4,
  },
  chipCompletedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  chipCancelled: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FEE2E2",
    gap: 4,
  },
  chipCancelledText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B91C1C",
  },
});
