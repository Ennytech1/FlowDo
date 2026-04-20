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
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeIn, FadeOut, Layout } from "react-native-reanimated";

export default function SupportScreen() {
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

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleEmailSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const email = "support@todochamp.com"; // Replace with real support email
    const subject = "Support Request - ToDo Champ";
    const body = "Hi Support Team,\n\nI need help with...";
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleWhatsAppSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phoneNumber = "1234567890"; // Replace with real WhatsApp number
    const message = "Hi, I need assistance with ToDo Champ.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web version if app not installed
        Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
      }
    });
  };

  const SupportOption = ({ icon, title, subtitle, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.optionInfo}>
        <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const FaqItem = ({ id, question, answer }: { id: number, question: string, answer: string }) => {
    const isExpanded = expandedFaq === id;
    
    return (
      <View style={[styles.faqItemContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.faqHeader}
          onPress={() => {
            Haptics.selectionAsync();
            setExpandedFaq(isExpanded ? null : id);
          }}
        >
          <Text style={[styles.faqQuestion, { color: theme.text }]}>{question}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        {isExpanded && (
          <Animated.View 
            entering={FadeIn.duration(300)} 
            exiting={FadeOut.duration(200)}
            style={styles.faqAnswerContainer}
          >
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{answer}</Text>
          </Animated.View>
        )}
      </View>
    );
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
          <View style={[styles.imgPlaceholder, { backgroundColor: theme.primary + "10" }]}>
            <Ionicons name="chatbubbles-outline" size={60} color={theme.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>How can we help?</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Our team is here to support your productivity journey.
          </Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CONTACT US</Text>
          <SupportOption 
            icon="mail-outline" 
            title="Email Support" 
            subtitle="Get help via email in 24h" 
            color="#6366f1"
            onPress={handleEmailSupport}
          />
          <SupportOption 
            icon="logo-whatsapp" 
            title="WhatsApp Chat" 
            subtitle="Instant support for Pro members" 
            color="#10b981"
            onPress={handleWhatsAppSupport}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RESOURCES</Text>
          <SupportOption 
            icon="book-outline" 
            title="Guide & Tutorials" 
            subtitle="Learn how to use ToDo Champ" 
            color="#f59e0b"
            onPress={() => Linking.openURL("https://todochamp.com/guides")}
          />
          <SupportOption 
            icon="document-text-outline" 
            title="Privacy Policy" 
            subtitle="How we manage your data" 
            color="#64748b"
            onPress={() => Linking.openURL("https://todochamp.com/privacy")}
          />
        </View>

        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: theme.text }]}>Common Questions</Text>
          <FaqItem 
            id={1}
            question="How do I sync my data?"
            answer="Your data is automatically synced to the cloud in real-time. Just sign in with your account on any device to access your tasks."
          />
          <FaqItem 
            id={2}
            question="Can I use this offline?"
            answer="Yes! You can create and edit tasks offline. Your changes will be synced as soon as you have an internet connection."
          />
          <FaqItem 
            id={3}
            question="How do I upgrade to Pro?"
            answer="Go to the Subscription section in Settings and choose the Pro plan that fits your needs."
          />
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
  heroSection: { alignItems: "center", marginBottom: 40 },
  imgPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: { fontSize: 24, fontWeight: "900", marginBottom: 8 },
  heroSubtitle: { fontSize: 15, textAlign: "center", paddingHorizontal: 40, lineHeight: 22 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.5 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  optionInfo: { flex: 1, marginLeft: 16 },
  optionTitle: { fontSize: 16, fontWeight: "700" },
  optionSubtitle: { fontSize: 12, marginTop: 2 },
  faqSection: { marginTop: 10, paddingBottom: 40 },
  faqTitle: { fontSize: 20, fontWeight: "900", marginBottom: 20 },
  faqItemContainer: {
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  faqQuestion: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 10 },
  faqAnswerContainer: {
    paddingBottom: 20,
    paddingRight: 30,
  },
  faqAnswer: { fontSize: 14, lineHeight: 22 },
});

