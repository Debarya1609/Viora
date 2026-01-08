// src/screens/Medication/MedicationListScreen.tsx

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../../../constants/colors";
import { api, Medication } from "../../../services/api";
import { MedicationCard } from "../../../components/cards/MedicationCard";

type MedicationsScreenProps = {
  navigation: any;
};

export const MedicationsScreen: React.FC<MedicationsScreenProps> = ({
  navigation,
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMedication = () => {
    navigation.navigate("AddMedication");
  };

  const loadMedications = async () => {
    try {
      setError(null);
      const data = await api.getMedications();
      setMedications(data);
    } catch (e: any) {
      setError(e.message || "Failed to load medications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadMedications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMedications();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity style={styles.actionPrimary} onPress={loadMedications}>
            <Text style={styles.actionPrimaryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!medications.length) {
      return (
        <View style={styles.centered}>
          <Text style={{ color: COLORS.textSecondary, marginBottom: 8 }}>
            No medications yet.
          </Text>
          <TouchableOpacity
            style={styles.actionPrimary}
            onPress={handleAddMedication}
          >
            <Text style={styles.actionPrimaryText}>Add your first medication</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return medications.map((med) => (
      <MedicationCard
        key={med.id}
        medication={med}
        onPress={() => {
          // later: navigate to medication detail/edit
        }}
      />
    ));
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medications</Text>
          <Text style={styles.headerSubtitle}>Your medication schedule</Text>
        </View>

        <View style={styles.body}>
          {/* Summary card (static for now) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryLabel}>Today&apos;s Progress</Text>
                <Text style={styles.summaryValue}>—</Text>
              </View>
              <View style={styles.circleWrapper}>
                <View style={styles.circleBg} />
              </View>
            </View>
            <Text style={styles.summaryText}>
              Your medication adherence will appear here once you start logging
              doses.
            </Text>
          </View>

          {renderContent()}
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
  centered: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
