// src/screens/Reports/ReportsScreen.tsx

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
import { Upload, Calendar } from "lucide-react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../../../constants/colors";
import { api, Appointment, PatientReport } from "../../../services/api";
import { ReportCard } from "../../../components/cards/ReportCard";
import { AppointmentCard } from "../../../components/cards/AppointmentCard";
import { RootStackParamList } from "../../navigation/RootNavigator";

type TabKey = "reports" | "appointments";
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [activeTab, setActiveTab] = useState<TabKey>("reports");
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [r, a] = await Promise.all([
        api.getReports(),
        api.getAppointments(),
      ]);
      setReports(r);
      setAppointments(a);
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  );
  const past = appointments.filter(
    (a) =>
      a.status === "completed" ||
      a.status === "cancelled" ||
      a.status === "no_show"
  );

  const renderReportsTab = () => {
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
          <TouchableOpacity style={styles.bookButton} onPress={loadData}>
            <Text style={styles.bookText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        {/* Upload button → AddReport screen */}
        <TouchableOpacity
          style={styles.uploadButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AddReport")}
        >
          <Upload size={22} color="#FFFFFF" />
          <Text style={styles.uploadText}>Upload New Report</Text>
        </TouchableOpacity>

        {reports.length === 0 ? (
          <View style={styles.centered}>
            <Text style={{ color: COLORS.textSecondary }}>
              No reports yet.
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => {
                // later: navigate to a report viewer using report.file_url
              }}
            />
          ))
        )}
      </View>
    );
  };

  const renderAppointmentsTab = () => {
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
          <TouchableOpacity style={styles.bookButton} onPress={loadData}>
            <Text style={styles.bookText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        {/* Book appointment → AddAppointment screen */}
        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AddAppointment")}
        >
          <Calendar size={22} color="#FFFFFF" />
          <Text style={styles.bookText}>Book Appointment</Text>
        </TouchableOpacity>

        {/* Upcoming */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcoming.length === 0 ? (
          <View style={styles.centered}>
            <Text style={{ color: COLORS.textSecondary }}>
              No upcoming appointments.
            </Text>
          </View>
        ) : (
          upcoming.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              variant="upcoming"
              onPrimaryPress={() => {
                // later: open appointment detail screen
              }}
            />
          ))
        )}

        {/* Past */}
        <Text style={styles.sectionTitle}>Past</Text>
        {past.length === 0 ? (
          <View style={styles.centered}>
            <Text style={{ color: COLORS.textSecondary }}>
              No past appointments.
            </Text>
          </View>
        ) : (
          past.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              variant="past"
            />
          ))
        )}
      </View>
    );
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

          {activeTab === "reports"
            ? renderReportsTab()
            : renderAppointmentsTab()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // keep all your existing styles unchanged
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
  centered: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
