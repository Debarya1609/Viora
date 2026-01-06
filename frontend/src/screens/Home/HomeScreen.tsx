// src/screens/Home/HomeScreen.tsx

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
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import { COLORS } from "../../../constants/colors";

const todaysTasks = [
  { id: 1, type: "medication", name: "Metformin 500mg", time: "8:00 AM", status: "taken" },
  { id: 2, type: "medication", name: "Lisinopril 10mg", time: "8:00 AM", status: "taken" },
  { id: 3, type: "medication", name: "Aspirin 81mg", time: "2:00 PM", status: "upcoming" },
  { id: 4, type: "checkIn", name: "Blood pressure check", time: "3:00 PM", status: "pending" },
  { id: 5, type: "medication", name: "Atorvastatin 20mg", time: "9:00 PM", status: "upcoming" },
];

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  const userName = "Patient"; // TODO: replace with real user name from auth later

  const handleOpenNurseChat = () => {
    // later: navigation.navigate("NurseChat");
  };

  const handleOpenMedications = () => {
    // later: navigation.navigate("Medications");
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {greeting}, {userName}
          </Text>
          <Text style={styles.headerSubtitle}>
            Here&apos;s your health overview for today
          </Text>
        </View>

        {/* Next medication */}
        <View style={styles.section}>
          <View style={styles.cardPrimary}>
            <View style={styles.cardRow}>
              <View style={styles.iconCircleBlue}>
                <Pill size={28} color={COLORS.primaryBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Next Medication</Text>
                <Text style={styles.cardText}>Aspirin 81mg</Text>
                <View style={styles.timeRow}>
                  <Clock size={16} color="#9CA3AF" />
                  <Text style={styles.timeText}>2:00 PM</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOpenMedications}
              >
                <Text style={styles.primaryButtonText}>Mark as Taken</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Next appointment */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconCircleGreen}>
                <Calendar size={28} color={COLORS.primaryGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Next Appointment</Text>
                <Text style={styles.cardText}>
                  Dr. Emily Smith - Cardiology
                </Text>
                <View style={styles.appointmentRow}>
                  <Text style={styles.metaText}>Jan 10, 2026</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>10:30 AM</Text>
                </View>
                <Text style={styles.metaText}>
                  Memorial Hospital, Building A
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* VIORA nurse */}
        <View style={styles.section}>
          <View style={styles.nurseCard}>
            <View style={styles.cardRow}>
              <View style={styles.nurseAvatar}>
                <MessageCircle size={28} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.nurseTitle}>VIORA Nurse</Text>
                <Text style={styles.nurseSubtitle}>
                  Always here to help you
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.nurseButton}
              onPress={handleOpenNurseChat}
            >
              <Text style={styles.nurseButtonText}>Start a conversation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today’s tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
          <View style={styles.tasksCard}>
            {todaysTasks.map((task) => {
              const bgColor =
                task.status === "taken"
                  ? "#DCFCE7"
                  : task.status === "upcoming"
                  ? "#DBEAFE"
                  : "#F3F4F6";
              const iconColor =
                task.status === "taken"
                  ? "#16A34A"
                  : task.type === "medication"
                  ? COLORS.primaryBlue
                  : "#4B5563";

              return (
                <View key={task.id} style={styles.taskRow}>
                  <View
                    style={[
                      styles.taskIconCircle,
                      { backgroundColor: bgColor },
                    ]}
                  >
                    {task.status === "taken" ? (
                      <CheckCircle size={20} color={iconColor} />
                    ) : task.type === "medication" ? (
                      <Pill size={20} color={iconColor} />
                    ) : (
                      <Clock size={20} color={iconColor} />
                    )}
                  </View>

                  <View style={styles.taskTextWrapper}>
                    <Text
                      style={[
                        styles.taskName,
                        task.status === "taken" && styles.taskNameDone,
                      ]}
                    >
                      {task.name}
                    </Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>

                  {task.status === "taken" && (
                    <Text style={styles.taskDoneLabel}>Done</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Medications Today</Text>
              <Text style={styles.statValue}>3/5</Text>
              <Text style={[styles.statMeta, { color: "#16A34A" }]}>
                On track
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Recovery Days</Text>
              <Text style={styles.statValue}>12</Text>
              <Text style={[styles.statMeta, { color: COLORS.primaryBlue }]}>
                Progressing well
              </Text>
            </View>
          </View>
        </View>
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
    paddingBottom: 32,
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
  section: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  cardPrimary: {
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
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircleBlue: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconCircleGreen: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  timeText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  metaDot: {
    fontSize: 13,
    color: "#6B7280",
    marginHorizontal: 4,
  },
  nurseCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.primaryBlue,
    flexGrow: 1,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  nurseAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nurseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  nurseSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  nurseButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  nurseButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primaryBlue,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tasksCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  taskIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  taskTextWrapper: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  taskNameDone: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  taskTime: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  taskDoneLabel: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  statMeta: {
    fontSize: 13,
    marginTop: 4,
  },
});
