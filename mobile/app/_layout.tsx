import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastProvider } from "../components/Toast";
import { ThemeProvider } from "../context/ThemeContext";
import Preloader from "../components/Preloader";
import { View } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Initial delay to prevent splash flicker
    const timer = setTimeout(() => setIsLoading(false), 2000); // Increased for cinematic effect
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === "onboarding";

    async function verifyAndRedirect() {
      const value = await AsyncStorage.getItem("has_onboarded");
      const hasOnboarded = value === "true";
      
      if (!hasOnboarded && !inOnboarding) {
        router.replace("/onboarding");
      } else if (hasOnboarded && inOnboarding) {
        router.replace("/login");
      }
    }

    verifyAndRedirect();
  }, [segments, isLoading]);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </ThemeProvider>
  );
}

