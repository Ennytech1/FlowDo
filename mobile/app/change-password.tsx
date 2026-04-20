import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { authApi } from "../lib/api";

export default function ChangePasswordScreen() {
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    try {
      await authApi.changePassword({ currentPassword, newPassword });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Password updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const PasswordInput = ({ label, value, onChangeText, field }: any) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPass[field as keyof typeof showPass]}
          placeholder="••••••••"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
        />
        <TouchableOpacity onPress={() => setShowPass({ ...showPass, [field]: !showPass[field as keyof typeof showPass] })}>
          <Ionicons 
            name={showPass[field as keyof typeof showPass] ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Change Password</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.infoBox}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primary + "10" }]}>
              <Ionicons name="shield-half-outline" size={30} color={theme.primary} />
            </View>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Update Your Security</Text>
            <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]}>
              Your new password should be at least 8 characters long and contain numbers.
            </Text>
          </Animated.View>

          <View style={styles.formSplitter} />

          <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
            <PasswordInput 
              label="CURRENT PASSWORD" 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              field="current"
            />
            <TouchableOpacity 
              onPress={() => router.push("/forgot-password")}
              style={{ alignSelf: "flex-end", marginTop: -10 }}
            >
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "700" }}>Forgot current password?</Text>
            </TouchableOpacity>
            <PasswordInput 
              label="NEW PASSWORD" 
              value={newPassword} 
              onChangeText={setNewPassword} 
              field="new"
            />
            <PasswordInput 
              label="CONFIRM NEW PASSWORD" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              field="confirm"
            />

            <TouchableOpacity 
              style={[styles.updateBtn, { backgroundColor: theme.primary }]}
              onPress={handleUpdate}
            >
              <Text style={styles.updateBtnText}>Update Password</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  infoBox: { alignItems: "center", marginBottom: 30 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  infoTitle: { fontSize: 22, fontWeight: "900", marginBottom: 8 },
  infoSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, opacity: 0.8 },
  formSplitter: { height: 1, width: "100%", backgroundColor: "transparent", borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", marginBottom: 30, opacity: 0.2 },
  form: { gap: 20 },
  inputContainer: { gap: 10 },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: "600" },
  updateBtn: {
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 4,
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  updateBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
