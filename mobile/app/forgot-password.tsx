import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    background: isDark ? "#0f172a" : "#f8fafc",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#1e293b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    primary: "#6366f1",
    border: isDark ? "#334155" : "#f1f5f9",
  };

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleReset = () => {
    if (!email) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSent(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {!isSent ? (
            <>
              <Animated.View entering={FadeInUp.delay(200)} style={styles.hero}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + "10" }]}>
                  <Ionicons name="key-outline" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Forgot Password?</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                    <TextInput
                      placeholder="champ@example.com"
                      placeholderTextColor={theme.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      style={[styles.input, { color: theme.text }]}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.resetButton, { backgroundColor: theme.primary }]}
                  onPress={handleReset}
                >
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            <Animated.View entering={FadeInUp} style={styles.successContainer}>
              <View style={[styles.iconCircle, { backgroundColor: "#10b98110" }]}>
                <Ionicons name="checkmark-done-circle" size={60} color="#10b981" />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Check Your Email</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                We've sent password reset instructions to {email}.
              </Text>
              <TouchableOpacity 
                style={[styles.resetButton, { backgroundColor: theme.primary, width: "100%", marginTop: 30 }]}
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.resetButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  scrollContent: { paddingHorizontal: 30, paddingVertical: 40, alignItems: "center" },
  hero: { alignItems: "center", marginBottom: 40 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "900", marginBottom: 15 },
  subtitle: { fontSize: 16, textAlign: "center", lineHeight: 24, opacity: 0.8 },
  form: { width: "100%" },
  inputContainer: { marginBottom: 30 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, letterSpacing: 1 },
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
  resetButton: {
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  resetButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  successContainer: { alignItems: "center", width: "100%", paddingTop: 40 },
});
