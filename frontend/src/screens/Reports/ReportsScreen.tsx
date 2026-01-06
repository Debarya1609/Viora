// src/screens/Reports/ReportsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  FileText,
  Calendar,
  MapPin,
  Upload,
  CheckCircle,
  X,
} from "lucide-react-native";
import { COLORS } from "../../../constants/colors";

type TabKey = "reports" | "appointments";

const reports = [
  {
    id: 1,
    type: "Discharge Summary",
    date: "Jan 2, 2026",
    hospital: "Memorial Hospital",
    doctor: "Dr. Emily Smith",
    icon: "📄",
  },
  {
    id: 2,
    type: "Lab Report - Blood Work",
    date: "Dec 28, 2025",
    hospital: "Memorial Hospital",
    doctor: "Dr. Emily Smith",
    icon: "🔬",
  },
  {
    id: 3,
    type: "ECG Report",
    date: "Dec 20, 2025",
    hospital: "Memorial Hospital",
    doctor: "Dr. Sarah Johnson",
    icon: "💓",
  },
  {
    id: 4,
    type: "X-Ray Report",
    date: "Dec 15, 2025",
    hospital: "City Medical Center",
    doctor: "Dr. Michael Chen",
    icon: "📸",
  },
];

const appointments = [
  {
    id: 1,
    type: "Follow-up Consultation",
    date: "Jan 10, 2026",
    time: "10:30 AM",
    doctor: "Dr. Emily Smith",
    specialty: "Cardiology",
    location: "Memorial Hospital, Building A, Room 305",
    status: "confirmed" as const,
  },
  {
    id: 2,
    type: "Lab Work",
    date: "Jan 15, 2026",
    time: "9:00 AM",
    doctor: "Lab Services",
    specialty: "Laboratory",
    location: "Memorial Hospital, Lab Wing",
    status: "confirmed" as const,
  },
  {
    id: 3,
    type: "Post-Surgery Check",
    date: "Dec 28, 2025",
    time: "2:00 PM",
    doctor: "Dr. Emily Smith",
    specialty: "Cardiology",
    location: "Memorial Hospital, Building A",
    status: "completed" as const,
  },
  {
    id: 4,
    type: "Initial Consultation",
    date: "Dec 10, 2025",
    time: "11:00 AM",
    doctor: "Dr. Sarah Johnson",
    specialty: "Internal Medicine",
    location: "City Medical Center",
    status: "cancelled" as const,
  },
];

export const ReportsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("reports");

  const upcoming = appointments.filter((a) => a.status === "confirmed");
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Records</Text>
          <Text style={styles.headerSubtitle}>Reports and appointments</Text>
        </View>

        <View style={styles.body}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "reports" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("reports")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reports" && styles.tabTextActive,
                ]}
              >
                Past Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "appointments" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("appointments")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "appointments" && styles.tabTextActive,
                ]}
              >
                Appointments
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "reports" ? (
            <View style={styles.section}>
              {/* Upload button */}
              <TouchableOpacity style={styles.uploadButton} activeOpacity={0.9}>
                <Upload size={22} color="#FFFFFF" />
                <Text style={styles.uploadText}>Upload New Report</Text>
              </TouchableOpacity>

              {/* Reports list */}
              {reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportTopRow}>
                    <View style={styles.reportIcon}>
                      <Text style={styles.reportEmoji}>{report.icon}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.reportTitle}>{report.type}</Text>
                      <View style={styles.reportMetaRow}>
                        <Calendar size={16} color="#9CA3AF" />
                        <Text style={styles.reportMetaText}>{report.date}</Text>
                      </View>
                      <View style={styles.reportMetaRow}>
                        <MapPin size={16} color="#9CA3AF" />
                        <Text style={styles.reportMetaText}>
                          {report.hospital}
                        </Text>
                      </View>
                      <Text style={styles.reportDoctor}>
                        By {report.doctor}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.viewReportButton}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.viewReportText}>View Report</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              {/* Book appointment button */}
              <TouchableOpacity style={styles.bookButton} activeOpacity={0.9}>
                <Calendar size={22} color="#FFFFFF" />
                <Text style={styles.bookText}>Book Appointment</Text>
              </TouchableOpacity>

              {/* Upcoming */}
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcoming.map((apt) => (
                <View key={apt.id} style={styles.upcomingCard}>
                  <View style={styles.upcomingTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.aptTitle}>{apt.type}</Text>
                      <Text style={styles.aptDoctor}>
                        {apt.doctor} - {apt.specialty}
                      </Text>
                      <View style={styles.aptMetaRow}>
                        <Calendar size={16} color="#9CA3AF" />
                        <Text style={styles.aptMetaText}>
                          {apt.date} at {apt.time}
                        </Text>
                      </View>
                      <View style={styles.aptMetaRow}>
                        <MapPin size={16} color="#9CA3AF" />
                        <Text style={styles.aptMetaText}>{apt.location}</Text>
                      </View>
                    </View>

                    <View style={styles.chipConfirmed}>
                      <CheckCircle size={14} color="#16A34A" />
                      <Text style={styles.chipConfirmedText}>Confirmed</Text>
                    </View>
                  </View>

                  <View style={styles.aptActionsRow}>
                    <TouchableOpacity
                      style={styles.aptPrimaryButton}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.aptPrimaryText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.aptSecondaryButton}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.aptSecondaryText}>Reschedule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Past */}
              <Text style={styles.sectionTitle}>Past</Text>
              {past.map((apt) => {
                const isCompleted = apt.status === "completed";
                return (
                  <View
                    key={apt.id}
                    style={[
                      styles.pastCard,
                      isCompleted
                        ? styles.pastCardCompleted
                        : styles.pastCardCancelled,
                    ]}
                  >
                    <View style={styles.pastTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.aptTitle}>{apt.type}</Text>
                        <Text style={styles.aptDoctor}>
                          {apt.doctor} - {apt.specialty}
                        </Text>
                        <View style={styles.aptMetaRow}>
                          <Calendar size={16} color="#9CA3AF" />
                          <Text style={styles.aptMetaText}>
                            {apt.date} at {apt.time}
                          </Text>
                        </View>
                      </View>

                      {isCompleted ? (
                        <View style={styles.chipCompleted}>
                          <CheckCircle size={14} color="#4B5563" />
                          <Text style={styles.chipCompletedText}>
                            Completed
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.chipCancelled}>
                          <X size={14} color="#DC2626" />
                          <Text style={styles.chipCancelledText}>
                            Cancelled
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
  body: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 4,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryBlue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  section: {
    marginTop: 4,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryGreen,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 14,
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  reportCard: {
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
  reportTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reportIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportEmoji: {
    fontSize: 26,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  reportMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  reportMetaText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  reportDoctor: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
  viewReportButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewReportText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryGreen,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 14,
  },
  bookText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
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
  aptTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  aptDoctor: {
    fontSize: 14,
    color: COLORS.primaryBlue,
    fontWeight: "500",
    marginBottom: 4,
  },
  aptMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  aptMetaText: {
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
  aptActionsRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  aptPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 10,
    alignItems: "center",
  },
  aptPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  aptSecondaryButton: {
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  aptSecondaryText: {
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
