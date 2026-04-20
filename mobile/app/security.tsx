import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInRight } from "react-native-reanimated";

export default function SecurityScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    background: isDark ? "#0f172a" : "#f8fafc",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#1e293b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#f1f5f9",
    primary: "#6366f1",
  };

  const [twoFactor, setTwoFactor] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const auth = await AsyncStorage.getItem("pref_biometrics");
      const tfa = await AsyncStorage.getItem("pref_2fa");
      if (auth !== null) setBiometrics(auth === "true");
      if (tfa !== null) setTwoFactor(tfa === "true");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBiometrics = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Not Available",
          "Biometric authentication is not set up on this device."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
      });

      if (!result.success) return;
    }
    setBiometrics(value);
    await AsyncStorage.setItem("pref_biometrics", value.toString());
  };

  const toggle2FA = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTwoFactor(value);
    await AsyncStorage.setItem("pref_2fa", value.toString());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PASSWORD</Text>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/change-password");
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.primary + "15" }]}>
              <Ionicons name="key-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Change Password</Text>
              <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>Keep your account secure</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>AUTHENTICATION</Text>
          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: "#10b98115" }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Two-Factor Auth</Text>
              <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>Secure your account with 2FA</Text>
            </View>
            <Switch 
              value={twoFactor} 
              onValueChange={toggle2FA}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: "#3b82f615" }]}>
              <Ionicons name="finger-print-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Biometric Login</Text>
              <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>Face ID or Fingerprint</Text>
            </View>
            <Switch 
              value={biometrics} 
              onValueChange={toggleBiometrics}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DEVICES</Text>
          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: "#64748b15" }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#64748b" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Current Device (Active)</Text>
              <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>You are logged in here</Text>
            </View>
            <Text style={{ color: "#10b981", fontSize: 11, fontWeight: "800" }}>ACTIVE</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.5 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuInfo: { flex: 1, marginLeft: 16 },
  menuLabel: { fontSize: 15, fontWeight: "700" },
  menuSublabel: { fontSize: 12, fontWeight: "500", marginTop: 2 },
});
