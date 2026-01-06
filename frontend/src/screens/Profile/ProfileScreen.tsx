import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import {
  User,
  Hospital,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react-native";

export function ProfileScreen() {
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [dailyCheckIn, setDailyCheckIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <User color="#ffffff" size={40} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>Sarah Williams</Text>
            <Text style={styles.headerSubtitle}>Patient ID: VR-2026-4521</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Personal Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Details</Text>
          </View>

          <View style={styles.cardContent}>
            <Row label="Full Name" value="Sarah Williams" />
            <Row label="Age" value="45 years" />
            <Row label="Blood Type" value="O+" />
            <Row label="Height" value={`5'6"`} />
            <Row label="Weight" value="150 lbs" />
          </View>

          <TouchableOpacity style={styles.cardFooterButton}>
            <Text style={styles.cardFooterText}>Edit Personal Details</Text>
            <ChevronRight color="#2563eb" size={20} />
          </TouchableOpacity>
        </View>

        {/* Connected Hospital/Doctor */}
        <View style={styles.smallCard}>
          <View style={styles.smallCardRow}>
            <View style={styles.iconCircleGreen}>
              <Hospital color="#16a34a" size={24} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.smallCardTitle}>Connected Hospital</Text>
              <Text style={styles.smallCardText}>Memorial Hospital</Text>
              <Text style={styles.smallCardSubText}>
                Primary Doctor: Dr. Emily Smith
              </Text>
              <Text style={styles.smallCardSubText}>Cardiology Department</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.listCard}>
            {/* Medication Schedule */}
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.iconCircleBlue}>
                  <Text style={styles.iconClock}>⏰</Text>
                </View>
                <Text style={styles.listItemText}>Medication Schedule</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <View style={styles.listItemLeft}>
                <View style={styles.iconCircleGreenLight}>
                  <Bell color="#16a34a" size={20} />
                </View>
                <Text style={styles.listItemText}>Notification Settings</Text>
              </View>
              <ChevronRight
                color="#9ca3af"
                size={20}
                style={{
                  transform: [{ rotate: showNotifications ? "90deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>

            {showNotifications && (
              <View style={styles.notificationPanel}>
                <ToggleRow
                  label="Medication Reminders"
                  value={medicationReminders}
                  onValueChange={setMedicationReminders}
                />
                <ToggleRow
                  label="Appointment Reminders"
                  value={appointmentReminders}
                  onValueChange={setAppointmentReminders}
                />
                <ToggleRow
                  label="Daily Check-in"
                  value={dailyCheckIn}
                  onValueChange={setDailyCheckIn}
                />
              </View>
            )}

            {/* Language */}
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.iconCirclePurple}>
                  <Globe color="#7c3aed" size={20} />
                </View>
                <View>
                  <Text style={styles.listItemText}>Language</Text>
                  <Text style={styles.listItemSubText}>English</Text>
                </View>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.privacyCard}>
          <View style={styles.smallCardRow}>
            <Shield color="#2563eb" size={24} style={styles.privacyIcon} />
            <View style={styles.flex1}>
              <Text style={styles.privacyTitle}>Privacy & Data Safety</Text>
              <Text style={styles.privacyText}>
                Your health data is encrypted end-to-end and stored securely in
                compliance with HIPAA regulations. We never share your
                information without your explicit consent.
              </Text>
              <TouchableOpacity>
                <Text style={styles.privacyLink}>Read Privacy Policy →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <LogOut color="#dc2626" size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>VIORA v1.0.0</Text>
          <Text style={styles.appInfoText}>
            Your trusted post-discharge care companion
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

type RowProps = { label: string; value: string };
const Row = ({ label, value }: RowProps) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
};

const ToggleRow = ({ label, value, onValueChange }: ToggleRowProps) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
      thumbColor="#ffffff"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eff6ff",
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  headerName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#bfdbfe",
    fontSize: 14,
  },
  body: {
    paddingHorizontal: 24,
    marginTop: -24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#dbeafe",
    overflow: "hidden",
    marginBottom: 16,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardFooterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cardFooterText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: {
    color: "#4b5563",
    fontSize: 14,
  },
  rowValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },
  smallCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  smallCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconCircleGreen: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  flex1: {
    flex: 1,
  },
  smallCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  smallCardText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 2,
  },
  smallCardSubText: {
    fontSize: 13,
    color: "#6b7280",
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  listItemSubText: {
    fontSize: 13,
    color: "#6b7280",
  },
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  iconClock: {
    color: "#2563eb",
    fontSize: 18,
  },
  iconCircleGreenLight: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCirclePurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationPanel: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  toggleLabel: {
    fontSize: 14,
    color: "#374151",
  },
  privacyCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "#bfdbfe",
    marginBottom: 16,
  },
  privacyIcon: {
    marginRight: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  privacyLink: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
  },
  appInfo: {
    alignItems: "center",
    paddingBottom: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
