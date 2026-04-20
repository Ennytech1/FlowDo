import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function SubscriptionScreen() {
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

  const PlanFeature = ({ text }: { text: string }) => (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
      <Text style={[styles.featureText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Subscription</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(200)} style={[styles.currentPlan, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.badge, { backgroundColor: theme.primary + "20" }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>ACTIVE</Text>
          </View>
          <Text style={[styles.planTitle, { color: theme.text }]}>Free Plan</Text>
          <Text style={[styles.planPrice, { color: theme.text }]}>$0.00<Text style={styles.pricePeriod}>/month</Text></Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.features}>
            <PlanFeature text="Up to 10 active tasks" />
            <PlanFeature text="Basic category filtering" />
            <PlanFeature text="Offline mode" />
          </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>UPGRADE TO PREMIUM</Text>
        
        <TouchableOpacity 
          style={[styles.premiumPlan, { backgroundColor: theme.primary }]}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
          <Text style={styles.premiumTitle}>Pro Plus</Text>
          <View style={styles.premiumPriceRow}>
            <Text style={styles.premiumPrice}>$4.99</Text>
            <Text style={styles.premiumPeriod}>/month</Text>
          </View>
          <View style={styles.premiumFeatures}>
            <View style={styles.featureRow}>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.premiumFeatureText}>Unlimited Tasks & Categories</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="sync" size={18} color="#fff" />
              <Text style={styles.premiumFeatureText}>Cloud Sync & Backup</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="diamond" size={18} color="#fff" />
              <Text style={styles.premiumFeatureText}>Custom Themes & App Icons</Text>
            </View>
          </View>
          <View style={styles.upgradeBtn}>
            <Text style={[styles.upgradeBtnText, { color: theme.primary }]}>Upgrade Now</Text>
          </View>
        </TouchableOpacity>
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
  currentPlan: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 40,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 15,
  },
  badgeText: { fontSize: 11, fontWeight: "900" },
  planTitle: { fontSize: 24, fontWeight: "900", marginBottom: 8 },
  planPrice: { fontSize: 32, fontWeight: "900" },
  pricePeriod: { fontSize: 14, fontWeight: "600", opacity: 0.6 },
  divider: { height: 1, marginVertical: 25 },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureText: { fontSize: 14, fontWeight: "600" },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 20, letterSpacing: 1.5 },
  premiumPlan: {
    padding: 30,
    borderRadius: 32,
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    position: "absolute",
    top: 20,
    right: 20,
  },
  popularText: { color: "#6366f1", fontSize: 10, fontWeight: "900" },
  premiumTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 10 },
  premiumPriceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 25 },
  premiumPrice: { color: "#fff", fontSize: 42, fontWeight: "900" },
  premiumPeriod: { color: "#ffffffa0", fontSize: 16, fontWeight: "600" },
  premiumFeatures: { gap: 15, marginBottom: 30 },
  premiumFeatureText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  upgradeBtn: {
    backgroundColor: "#fff",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeBtnText: { fontSize: 18, fontWeight: "800" },
});
