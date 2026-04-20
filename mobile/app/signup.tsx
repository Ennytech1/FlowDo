import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  ImageBackground,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { authApi } from "../lib/api";
import { useToast } from "../components/Toast";

export default function SignUpScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = {
    card: "rgba(30, 41, 59, 0.7)",
    text: "#fff",
    textSecondary: "rgba(255, 255, 255, 0.7)",
    primary: "#6366f1",
    border: "rgba(255, 255, 255, 0.1)",
  };

  const handleSignUp = async () => {
    if (!email || !password || !username || !confirmPassword) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      await authApi.signup({
        email,
        password,
        fullName: username,
      });

      showToast("Account created successfully! You can now log in.", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/login");
    } catch (error: any) {
      showToast(error.message || "Registration failed", "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require("../assets/auth_bg.png")} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15, 23, 42, 0.6)" }]} />
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.logoContainer}>
                <Ionicons name="flash" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Join the Flow</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Experience the full potential of high-fidelity productivity
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>USERNAME</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: theme.border }]}>
                  <Ionicons name="at-circle-outline" size={20} color={theme.textSecondary} />
                  <TextInput
                    placeholder="champ_99"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={username}
                    onChangeText={setUsername}
                    style={[styles.input, { color: theme.text }]}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: theme.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                  <TextInput
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={email}
                    onChangeText={setEmail}
                    style={[styles.input, { color: theme.text }]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: theme.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, { color: theme.text }]}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={theme.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>CONFIRM PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: theme.border }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={theme.textSecondary} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={[styles.input, { color: theme.text }]}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={theme.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)} style={styles.footer}>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                  Already have an account?{" "}
                  <Text style={{ color: theme.primary, fontWeight: "700" }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 40 },
  header: { alignItems: "center", marginTop: 10, marginBottom: 20 },
  backButton: {
    position: "absolute",
    left: 0,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 20, paddingHorizontal: 30, opacity: 0.8 },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 20,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 8, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: "600" },
  registerButton: {
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  registerButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  footer: { marginTop: 10, alignItems: "center" },
  footerText: { fontSize: 14, fontWeight: "600" },
});
