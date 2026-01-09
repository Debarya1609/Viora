// src/components/cards/MedicationCard.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Pill, Trash2 } from "lucide-react-native";
import { COLORS } from "../../constants/colors";
import { Medication } from "../../services/api";

type Props = {
  medication: Medication;
  onPress?: () => void;
  onDelete?: () => void;
};

export const MedicationCard: React.FC<Props> = ({
  medication,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.iconWrapper}>
        <Pill size={22} color={COLORS.primaryBlue} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{medication.name}</Text>
        {medication.dosage ? (
          <Text style={styles.line}>{medication.dosage}</Text>
        ) : null}
        {medication.frequency ? (
          <Text style={styles.line}>{medication.frequency}</Text>
        ) : null}
        {medication.instructions ? (
          <Text style={styles.instructions} numberOfLines={2}>
            {medication.instructions}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: medication.is_active ? "#22C55E" : "#9CA3AF" },
            ]}
          />
          <Text style={styles.statusText}>
            {medication.is_active ? "Active" : "Stopped"}
          </Text>
        </View>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  line: {
    fontSize: 13,
    color: "#6B7280",
  },
  instructions: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
});
