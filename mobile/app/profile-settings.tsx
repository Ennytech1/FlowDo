import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useColorScheme } from "../hooks/use-color-scheme";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { authApi } from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../components/Toast";

export default function ProfileSettings() {
  const router = useRouter();
  const { showToast } = useToast();
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

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const data = await authApi.getProfile();
      
      if (data) {
        setName(data.fullName || "");
        setEmail(data.email || "");
        setBio(data.bio || ""); 
        setAvatarUrl(data.avatarUrl || null);
      }
    } catch (error: any) {
      showToast(error.message || "Error fetching profile", "error");
    } finally {
      setLoading(false);
    }
  }

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
        
        // Create FormData
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
          setAvatarUrl(data.avatarUrl);
          showToast("Photo uploaded!", "success");
          
          // Update local storage
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

  const handleAction = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isEditing) {
      try {
        setLoading(true);
        const updates = {
          fullName: name,
          bio: bio,
        };

        const data = await authApi.updateProfile(updates);
        
        // Update local user info
        await AsyncStorage.setItem("user_info", JSON.stringify(data));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsEditing(false);
        showToast("Profile updated successfully!", "success");
      } catch (error: any) {
        showToast(error.message || "Error updating profile", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isEditing) {
                Alert.alert(
                  "Discard Changes",
                  "Are you sure you want to discard your unsaved changes?",
                  [
                    { text: "Keep Editing", style: "cancel" },
                    { text: "Discard", style: "destructive", onPress: () => router.back() }
                  ]
                );
              } else {
                router.back();
              }
            }} 
            style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Info</Text>
          <TouchableOpacity 
            onPress={handleAction}
            disabled={loading}
            style={[styles.actionBtn, isEditing && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={isEditing ? "#fff" : theme.primary} />
            ) : (
              <Text style={[styles.saveText, { color: theme.primary }, isEditing && { color: "#fff" }]}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.avatarSection}>
            <TouchableOpacity 
              style={styles.avatarWrapper} 
              onPress={pickImage} 
              disabled={uploading || !isEditing}
            >
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{getInitials(name)}</Text>
                )}
                {uploading && (
                  <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </View>
              {isEditing && (
                <View style={[styles.cameraBadge, { backgroundColor: theme.card }]}>
                  <Ionicons name="camera" size={18} color={theme.primary} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.changePhoto, { color: theme.primary, opacity: isEditing ? 1 : 0 }]}>
              {isEditing ? "Change Profile Photo" : ""}
            </Text>
          </Animated.View>


          <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
            <InputField 
              label="FULL NAME" 
              value={name} 
              onChangeText={setName} 
              icon="person-outline" 
              placeholder="John Doe"
              isEditing={isEditing}
              theme={theme}
            />
            <InputField 
              label="EMAIL ADDRESS" 
              value={email} 
              onChangeText={setEmail} 
              icon="mail-outline" 
              placeholder="john@example.com"
              isEditing={isEditing}
              theme={theme}
            />
            <InputField 
              label="PHONE NUMBER" 
              value={phone} 
              onChangeText={setPhone} 
              icon="call-outline" 
              placeholder="+1 234 567 890"
              isEditing={isEditing}
              theme={theme}
            />
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>BIO</Text>
              <View 
                style={[
                  styles.inputWrapper, 
                  styles.textArea, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  !isEditing && { backgroundColor: "transparent", opacity: 0.8 }
                ]}
              >
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text, height: 100, textAlignVertical: "top" }]}
                  editable={isEditing}
                />
              </View>
            </View>
          </Animated.View>

          {isEditing && (
            <TouchableOpacity 
              onPress={() => setIsEditing(false)}
              style={styles.cancelBtn}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel Changes</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({ label, value, onChangeText, icon, placeholder, isEditing, theme }: any) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View 
      style={[
        styles.inputWrapper, 
        { backgroundColor: theme.card, borderColor: theme.border },
        !isEditing && { backgroundColor: "transparent", opacity: 0.8 }
      ]}
    >
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
        editable={isEditing}
      />
    </View>
  </View>
);

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
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  saveText: { fontSize: 15, fontWeight: "800" },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 20 },
  avatarSection: { alignItems: "center", marginBottom: 40 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  uploadingOverlay: { 
    backgroundColor: "rgba(0,0,0,0.4)", 
    borderRadius: 50, 
    justifyContent: "center", 
    alignItems: "center",
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  changePhoto: { fontSize: 14, fontWeight: "700" },
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
  textArea: { height: 120, alignItems: "flex-start", paddingTop: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: "600" },
  cancelBtn: { marginTop: 30, alignItems: "center", paddingVertical: 10 },
  cancelText: { fontSize: 14, fontWeight: "700" },
});
