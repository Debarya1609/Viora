// src/screens/Home/HomeScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Pill,
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import { COLORS } from "../../../constants/colors";
import {
  api,
  Appointment,
  PatientProfile,
  MedicationEvent,
} from "../../../services/api";

type TaskStatus = "taken" | "upcoming" | "pending";

type TaskItem = {
  id: string;
  type: "medication" | "checkIn";
  name: string;
  time: string;
  status: TaskStatus;
  eventId?: string;
};

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayEvents, setTodayEvents] = useState<MedicationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmEventId, setConfirmEventId] = useState<string | null>(null);
  const [confirmMedName, setConfirmMedName] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  const userName = profile?.full_name || "Patient";

  const loadHome = async () => {
    try {
      const [p, appts, events] = await Promise.all([
        api.getProfile(),
        api.getAppointments(),
        api.getTodayMedicationEvents(),
      ]);
      setProfile(p);
      setAppointments(appts);
      setTodayEvents(events);
    } catch (e) {
      console.error("Home load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  // Next medication from events
  const nextMedication = useMemo(() => {
    const now = new Date();
    const upcoming = todayEvents
      .filter((e) => e.status === "scheduled")
      .map((e) => ({
        ...e,
        dt: new Date(e.scheduled_time),
      }))
      .filter((e) => e.dt >= now)
      .sort((a, b) => a.dt.getTime() - b.dt.getTime());

    if (!upcoming.length) return null;
    const first = upcoming[0];
    const timeStr = new Date(first.scheduled_time).toLocaleTimeString(
      undefined,
      { hour: "numeric", minute: "2-digit" }
    );
    return {
      eventId: first.id,
      name: first.name || "Medication",
      time: timeStr,
    };
  }, [todayEvents]);

  // Next appointment
  const nextAppointment = useMemo(() => {
    const now = new Date();
    const upcoming = appointments
      .map((a) => ({ ...a, startDate: new Date(a.start_time) }))
      .filter((a) => a.startDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (!upcoming.length) return null;
    const first = upcoming[0];
    const date = first.startDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = first.startDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return {
      doctorText: "Your upcoming appointment",
      date,
      time,
      location: "Hospital",
    };
  }, [appointments]);

  // Today tasks from events
  const todaysTasks: TaskItem[] = useMemo(() => {
    const tasks: TaskItem[] = [];

    todayEvents.forEach((e) => {
      const dt = new Date(e.scheduled_time);
      const timeStr = dt.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });

      const status: TaskStatus =
        e.status === "taken"
          ? "taken"
          : dt > new Date()
          ? "upcoming"
          : "pending";

      tasks.push({
        id: e.id,
        eventId: e.id,
        type: "medication",
        name: e.name || "Medication",
        time: timeStr,
        status,
      });
    });

    // simple daily check-in
    tasks.push({
      id: "checkin-bp",
      type: "checkIn",
      name: "Daily health check-in",
      time: "7:00 PM",
      status: "pending",
    });

    return tasks;
  }, [todayEvents]);

  const handleOpenNurseChat = () => {
    navigation.navigate("NurseChat");
  };

  const handleOpenMedications = () => {
    navigation.navigate("Medications");
  };

  const handleMarkNextMedication = () => {
    if (!nextMedication) return;
    setConfirmEventId(nextMedication.eventId);
    setConfirmMedName(nextMedication.name);
  };

  const handleConfirmYes = async () => {
    if (!confirmEventId) return;
    try {
      setMarking(true);
      await api.markMedicationEventTaken(confirmEventId);
      setConfirmEventId(null);
      setConfirmMedName(null);
      await loadHome(); // refresh events & next med
    } catch (e) {
      console.error("mark taken error", e);
    } finally {
      setMarking(false);
    }
  };

  const handleConfirmNo = () => {
    setConfirmEventId(null);
    setConfirmMedName(null);
  };

  if (loading) {
    return (
      <View
        style={[styles.root, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

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
                <Text style={styles.cardText}>
                  {nextMedication?.name || "No medications scheduled"}
                </Text>
                {nextMedication && (
                  <View style={styles.timeRow}>
                    <Clock size={16} color="#9CA3AF" />
                    <Text style={styles.timeText}>{nextMedication.time}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={
                  nextMedication
                    ? handleMarkNextMedication
                    : handleOpenMedications
                }
              >
                <Text style={styles.primaryButtonText}>
                  {nextMedication ? "Mark as taken" : "View medications"}
                </Text>
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
                {nextAppointment ? (
                  <>
                    <Text style={styles.cardText}>
                      {nextAppointment.doctorText}
                    </Text>
                    <View style={styles.appointmentRow}>
                      <Text style={styles.metaText}>{nextAppointment.date}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>{nextAppointment.time}</Text>
                    </View>
                    <Text style={styles.metaText}>
                      {nextAppointment.location}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.cardText}>
                    You have no upcoming appointments.
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Today’s tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
          <View style={styles.tasksCard}>
            {todaysTasks.length === 0 ? (
              <View style={styles.taskRow}>
                <Text style={styles.taskName}>No tasks for today</Text>
              </View>
            ) : (
              todaysTasks.map((task) => {
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
              })
            )}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Medications Today</Text>
              <Text style={styles.statValue}>
                {todayEvents.filter((e) => e.status === "taken").length}/
                {todayEvents.length || 1}
              </Text>
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

      {/* confirmation modal */}
      {confirmEventId && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              Have you taken {confirmMedName || "this medication"}?
            </Text>
            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: COLORS.primaryBlue },
                ]}
                onPress={handleConfirmYes}
                disabled={marking}
              >
                <Text style={styles.confirmButtonTextPrimary}>
                  {marking ? "Saving..." : "Yes"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: "#E5E7EB" },
                ]}
                onPress={handleConfirmNo}
                disabled={marking}
              >
                <Text style={styles.confirmButtonTextSecondary}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  confirmOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmCard: {
    width: "80%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  confirmButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 8,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  confirmButtonTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  confirmButtonTextSecondary: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});
