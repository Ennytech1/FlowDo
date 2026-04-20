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
  ImageBackground,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { useColorScheme } from "../hooks/use-color-scheme";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { authApi } from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../components/Toast";

export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = {
    card: "rgba(30, 41, 59, 0.7)",
    text: "#fff",
    textSecondary: "rgba(255, 255, 255, 0.7)",
    primary: "#6366f1",
    border: "rgba(255, 255, 255, 0.1)",
  };

  const handleAuth = async () => {
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      
      await AsyncStorage.setItem("auth_token", data.token);
      await AsyncStorage.setItem("user_info", JSON.stringify(data.user));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (error: any) {
      console.error("Auth Error Detail:", error);
      showToast(error.message || "Something went wrong.", "error");
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
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15, 23, 42, 0.5)" }]} />
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="checkbox" size={44} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Log in to manage your daily tasks efficiently
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: theme.border }]}>
                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                <TextInput
                  placeholder="champ@example.com"
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
              <View style={[styles.inputWrapper, { backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: theme.border }]}>
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/forgot-password");
              }}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)} style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Don't have an account?{" "}
                <Text style={{ color: theme.primary, fontWeight: "700" }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 30 },
  logoContainer: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  title: { fontSize: 30, fontWeight: "900", marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 20, opacity: 0.8 },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 20,
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: "600" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { fontSize: 13, fontWeight: "700" },
  loginButton: {
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  footer: { marginTop: 20, alignItems: "center" },
  footerText: { fontSize: 14, fontWeight: "600" },
});
