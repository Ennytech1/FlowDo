import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  useColorScheme,
  ImageBackground,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Cinematic Productivity",
    description: "Welcome to a tool designed for focus. Organized your thoughts with professional-grade clarity.",
    icon: "infinite-outline",
    color: "#6366f1",
  },
  {
    id: "2",
    title: "Intelligent Reminders",
    description: "Our smart alarm engine ensures you never miss a deadline. Snooze or finish with one tap.",
    icon: "notifications-outline",
    color: "#10b981",
  },
  {
    id: "3",
    title: "Master Your Flow",
    description: "Celebrate every win with data-rich stats and cinematic visuals. Ready to win?",
    icon: "rocket-outline",
    color: "#f59e0b",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const scrollX = useSharedValue(0);

  const theme = {
    background: isDark ? "#0f172a" : "#f8fafc",
    card: isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
    text: "#fff", // Always white for cinematic look
    textSecondary: "rgba(255, 255, 255, 0.7)",
    primary: "#6366f1",
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem("has_onboarded", "true");
      router.replace("/login");
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem("has_onboarded", "true");
    router.replace("/login");
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View entering={FadeInUp.delay(200)} style={[styles.glassCard]}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + "30", borderColor: item.color }]}>
            <Ionicons name={item.icon} size={64} color={item.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require("../assets/onboarding_bg.png")} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15, 23, 42, 0.4)" }]} />
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            scrollX.value = e.nativeEvent.contentOffset.x;
            setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          scrollEventThrottle={16}
        />

        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, index) => {
              const animatedStyle = useAnimatedStyle(() => {
                const dotWidth = interpolate(
                  scrollX.value,
                  [(index - 1) * width, index * width, (index + 1) * width],
                  [10, 24, 10],
                  "clamp"
                );
                const opacity = interpolate(
                  scrollX.value,
                  [(index - 1) * width, index * width, (index + 1) * width],
                  [0.4, 1, 0.4],
                  "clamp"
                );
                return {
                  width: withSpring(dotWidth),
                  opacity: withSpring(opacity),
                };
              });
              return (
                <Animated.View
                  key={index}
                  style={[styles.indicator, animatedStyle, { backgroundColor: theme.primary }]}
                />
              );
            })}
          </View>

          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === SLIDES.length - 1 ? "Launch Application" : "Continue"}
            </Text>
            <Ionicons 
              name={currentIndex === SLIDES.length - 1 ? "rocket" : "arrow-forward"} 
              size={20} 
              color="#fff" 
              style={{ marginLeft: 8 }} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  skipText: { fontSize: 14, fontWeight: "800", color: "#fff", textTransform: "uppercase", letterSpacing: 1 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 30,
    borderRadius: 40,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
  },
  textContainer: { alignItems: "center" },
  title: { fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 16, letterSpacing: -0.5 },
  description: { fontSize: 16, textAlign: "center", lineHeight: 28, opacity: 0.8 },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    height: 10,
    marginBottom: 40,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  nextButton: {
    height: 64,
    width: "100%",
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
