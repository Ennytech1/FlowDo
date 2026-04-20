import { Ionicons } from "@expo/vector-icons";
import { authApi, taskApi } from "../lib/api";
import { Href, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useAppTheme } from "../context/ThemeContext";

import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "../components/Toast";
import Animated, {
  FadeInRight,
  FadeInDown,
  Layout,
} from "react-native-reanimated";

export default function MenuScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { theme: appTheme, mode, setMode } = useAppTheme();
  const isDark = appTheme === "dark";

  const theme = {
    background: isDark ? "#0f172a" : "#f8fafc",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#1e293b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#f1f5f9",
    primary: "#6366f1",
    danger: "#ef4444",
  };

  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatarUrl: null as string | null,
  });
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    efficiency: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      await loadPreferences();
    };
    init();
  }, []);

  const loadPreferences = async () => {
    try {
      const notifs = await AsyncStorage.getItem("pref_notifications");
      const anls = await AsyncStorage.getItem("pref_analytics");

      if (notifs !== null) {
        setNotifications(notifs === "true");
      } else {
        // Default to true for new accounts
        setNotifications(true);
        await AsyncStorage.setItem("pref_notifications", "true");
      }
      
      if (anls !== null) setAnalytics(anls === "true");
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserData = async () => {
    try {
      // Get profile
      const profileData = await authApi.getProfile();
      
      setProfile({
        name: profileData?.fullName ?? "New Champion",
        email: profileData?.email ?? "",
        avatarUrl: profileData?.avatarUrl ?? null,
      });

      // Get stats
      const todos = await taskApi.getAll();

      if (todos && Array.isArray(todos)) {
        const completed = todos.filter((t: any) => t.completed).length;
        const total = todos.length;
        const pending = total - completed;
        const efficiency =
          total === 0 ? 0 : Math.round((completed / total) * 100);

        setStats({ completed, pending, efficiency });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        const imageUri = result.assets[0].uri;
        
        const formData = new FormData();
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : `image`;

        // @ts-ignore
        formData.append('avatar', {
          uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
          name: filename || 'upload.jpg',
          type,
        });

        const data = await authApi.uploadAvatar(formData);
        if (data.avatarUrl) {
          setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
          showToast("Photo updated!", "success");
          
          const userInfo = await AsyncStorage.getItem("user_info");
          if (userInfo) {
            const updated = JSON.parse(userInfo);
            updated.avatarUrl = data.avatarUrl;
            await AsyncStorage.setItem("user_info", JSON.stringify(updated));
          }
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (value) {
        showToast("Notifications enabled!", "success");
      }

      setNotifications(value);
      await AsyncStorage.setItem("pref_notifications", value.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAnalytics = async (value: boolean) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAnalytics(value);
      await AsyncStorage.setItem("pref_analytics", value.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            
            // Clear auth data
            await AsyncStorage.removeItem("auth_token");
            await AsyncStorage.removeItem("user_info");
            
            router.replace("/login");
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOptionPress = (option: MenuOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (option.route) router.push(option.route);
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Menu</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Animated.View entering={FadeInDown} style={styles.profileSection}>
          <TouchableOpacity 
            onPress={pickImage} 
            disabled={uploading}
            style={styles.avatarWrapper}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              )}
              {uploading && (
                <View style={[styles.uploadingOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </View>
            <View style={[styles.cameraBadge, { backgroundColor: theme.card }]}>
              <Ionicons name="camera" size={16} color={theme.primary} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.profileName, { color: theme.text }]}>
            {profile.name}
          </Text>
          <Text style={{ color: theme.textSecondary }}>
            {profile.email}
          </Text>
        </Animated.View>

        {/* PROGRESS STATS */}
        <Animated.View 
          entering={FadeInDown.delay(100)} 
          style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>DONE</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.efficiency}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>RATE</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TO-DO</Text>
          </View>
        </Animated.View>


        {/* SETTINGS */}
        <SettingRow
          index={0}
          theme={theme}
          handleOptionPress={handleOptionPress}
          item={{
            id: "theme",
            icon: isDark ? "moon" : "sunny",
            label: "Dark Mode",
            color: "#f59e0b",
            type: "toggle",
            value: isDark,
            onToggle: (value) => setMode(value ? "dark" : "light"),
          }}
        />

        <SettingRow
          index={1}
          theme={theme}
          handleOptionPress={handleOptionPress}
          item={{
            id: "1",
            icon: "person-outline",
            label: "Profile",
            color: "#6366f1",
            route: "/profile-settings" as Href,
          }}
        />

        <SettingRow
          index={1}
          theme={theme}
          handleOptionPress={handleOptionPress}
          item={{
            id: "2",
            icon: "notifications-outline",
            label: "Notifications",
            color: "#3b82f6",
            type: "toggle",
            value: notifications,
            onToggle: toggleNotifications,
          }}
        />

        <SettingRow
          index={2}
          theme={theme}
          handleOptionPress={handleOptionPress}
          item={{
            id: "3",
            icon: "analytics-outline",
            label: "Analytics",
            color: "#8b5cf6",
            type: "toggle",
            value: analytics,
            onToggle: toggleAnalytics,
          }}
        />

        {/* SIGN OUT */}
        <TouchableOpacity onPress={handleSignOut} style={styles.logout}>
          <Text style={{ color: theme.danger, fontWeight: "bold" }}>
            Sign Out
          </Text>
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
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  avatarWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0f172a",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  uploadingOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  menuLabel: {
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    fontWeight: "600",
  },

  logout: {
    marginTop: 30,
    alignItems: "center",
  },

  statsCard: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.5,
  },
});

interface MenuOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  route?: Href;
  type?: "toggle";
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

const SettingRow = ({
  item,
  index,
  theme,
  handleOptionPress,
}: {
  item: MenuOption;
  index: number;
  theme: any;
  handleOptionPress: (item: MenuOption) => void;
}) => (
  <Animated.View
    entering={FadeInRight.delay(index * 50)}
    layout={Layout.springify()}
  >
    <TouchableOpacity
      onPress={() => item.type !== "toggle" && handleOptionPress(item)}
      activeOpacity={item.type === "toggle" ? 1 : 0.7}
      style={[
        styles.menuItem,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>

      <Text style={[styles.menuLabel, { color: theme.text }]}>
        {item.label}
      </Text>

      {item.type === "toggle" ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={Platform.OS === "android" ? "#fff" : undefined}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.textSecondary}
        />
      )}
    </TouchableOpacity>
  </Animated.View>
);