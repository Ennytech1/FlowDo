import { Ionicons } from "@expo/vector-icons";
import { taskApi, authApi } from "../lib/api";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import * as Haptics from "expo-haptics";
import React, {
  useRef,
  useMemo,
  useState,
  useEffect
} from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from "react-native";

import { useColorScheme } from "../hooks/use-color-scheme";


import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";

import { scheduleLocalNotification, addNotificationListener, requestNotificationPermissions, addNotificationReceivedListener } from "../lib/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useToast } from "../components/Toast";
import Preloader from "../components/Preloader";



// Types
type Category = "Work" | "Personal" | "Shopping" | "Health";
type Priority = "Low" | "Medium" | "High";

interface ToDo {
  id: string; 
  title: string;  
  isDone: boolean;
  category: Category;
  priority: Priority;
  createdAt: string;
  reminderAt?: string;
}


// Constants
const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High"];
const FREE_TASK_LIMIT = 10;

const MOTIVATIONAL_QUOTES = [
  "Turn your 'to-do' into 'done'.",
  "Focus on being productive, not busy.",
  "Your future self will thank you.",
  "One task at a time. You've got this!",
  "Big things have small beginnings.",
  "Make today worth remembering."
];

// Helpers
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getCategoryColor = (category: Category) => {
  switch (category) {
    case "Work": return "#6366f1";
    case "Personal": return "#10b981";
    case "Shopping": return "#f59e0b";
    case "Health": return "#ef4444";
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "High": return "#ef4444";
    case "Medium": return "#f59e0b";
    case "Low": return "#10b981";
  }
};

// Themes
const lightTheme = {
  background: "#f8fafc",
  card: "#ffffff",
  cardSolid: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  primary: "#6366f1",
  border: "#f1f5f9",
  shadow: "#00000008",
};

const darkTheme = {
  background: "#0f172a", // Match Preloader
  card: "rgba(30, 41, 59, 0.7)", // Glassy
  cardSolid: "#1e293b", // Solid Deep Slate
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  primary: "#6366f1", // Preloader Indigo
  border: "rgba(255, 255, 255, 0.1)",
  shadow: "#00000060",
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: { flex: 1 },
  orb: {
    position: 'absolute',
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    borderRadius: Dimensions.get('window').width * 0.4,
    opacity: 0.15,
  },
  orb1: {
    top: -100,
    left: -100,
    backgroundColor: '#6366f1',
  },
  orb2: {
    bottom: -50,
    right: -100,
    backgroundColor: '#10b981',
  },
  orb3: {
    top: '40%',
    left: '30%',
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').width * 0.4,
    borderRadius: Dimensions.get('window').width * 0.2,
    backgroundColor: '#f59e0b',
    opacity: 0.1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  greetingText: { fontSize: 20, fontWeight: "900" },
  subGreetingText: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statsContainer: { paddingHorizontal: 24, marginBottom: 12 },
  statCardPrimary: {
    backgroundColor: "#6366f1",
    padding: 16,
    borderRadius: 24,
    marginBottom: 10,
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  statHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  statLabelMain: { color: "#ffffffa0", fontSize: 12, fontWeight: "800" },
  statValueMain: { color: "#fff", fontSize: 28, fontWeight: "900" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#ffffff30",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#fff", borderRadius: 4 },
  statRow: { flexDirection: "row", gap: 12 },
  statCardSmall: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  statLabelSmall: { fontSize: 11, fontWeight: "800", marginBottom: 4 },
  statValueSmall: { fontSize: 20, fontWeight: "900" },
  searchSection: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: "600" },
  categoryFilterList: { gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryChipActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  categoryText: { fontSize: 13, fontWeight: "700" },
  resultsBadge: { paddingHorizontal: 24, marginBottom: 12 },
  resultsText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: { paddingHorizontal: 24, paddingBottom: 200 },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  todoContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  checkbox: { width: 22, height: 22, borderRadius: 6 },
  textContainer: { flex: 1, marginLeft: 16 },
  todoText: { fontSize: 16, fontWeight: "700" },
  todoTextDone: { textDecorationLine: "line-through", opacity: 0.5 },
  
  // Add / Edit Task Modal styles
  addTaskContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16, // Reduced from 24
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 30,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    zIndex: 200, 
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 150,
  },
  addTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 20
  },
  addTaskTitle: { fontSize: 20, fontWeight: '900' },
  modalInput: {
    height: 70, // Slightly shorter
    borderRadius: 18,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    textAlignVertical: 'top',
    marginBottom: 12, // Reduced from 20
  },
  modalOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12, // Reduced from 20
  },
  optionLabel: { fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reminderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Reduced from 24
  },
  reminderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  reminderText: { fontSize: 14, fontWeight: '700' },
  saveButton: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  }
});


export default function Index() {
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  // Background Animations
  const orb1TranslateY = useSharedValue(0);
  const orb1TranslateX = useSharedValue(0);
  const orb2TranslateY = useSharedValue(0);
  const orb2TranslateX = useSharedValue(0);
  const orb3TranslateY = useSharedValue(0);
  const orb3TranslateX = useSharedValue(0);
  const orb1Scale = useSharedValue(1);
  const orb2Scale = useSharedValue(1);
  const orb3Scale = useSharedValue(1);

  useEffect(() => {
    // Orb 1: Top-Left (Indigo)
    orb1TranslateY.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 6000 }),
        withTiming(40, { duration: 7000 }),
        withTiming(0, { duration: 6000 })
      ),
      -1,
      true
    );
    orb1TranslateX.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 8000 }),
        withTiming(-20, { duration: 6000 }),
        withTiming(0, { duration: 8000 })
      ),
      -1,
      true
    );
    orb1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000 }),
        withTiming(0.9, { duration: 4000 })
      ),
      -1,
      true
    );

    // Orb 2: Bottom-Right (Emerald)
    orb2TranslateY.value = withRepeat(
      withSequence(
        withTiming(70, { duration: 9000 }),
        withTiming(-30, { duration: 8000 }),
        withTiming(0, { duration: 9000 })
      ),
      -1,
      true
    );
    orb2TranslateX.value = withRepeat(
      withSequence(
        withTiming(-50, { duration: 7000 }),
        withTiming(30, { duration: 9000 }),
        withTiming(0, { duration: 7000 })
      ),
      -1,
      true
    );
    orb2Scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 5500 }),
        withTiming(1, { duration: 5500 })
      ),
      -1,
      true
    );

    // Orb 3: Center-Left (Amber)
    orb3TranslateY.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 11000 }),
        withTiming(60, { duration: 10000 }),
        withTiming(0, { duration: 11000 })
      ),
      -1,
      true
    );
    orb3TranslateX.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 12000 }),
        withTiming(50, { duration: 11000 }),
        withTiming(0, { duration: 12000 })
      ),
      -1,
      true
    );
    orb3Scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 7000 }),
        withTiming(0.8, { duration: 7000 })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: orb1TranslateY.value },
      { translateX: orb1TranslateX.value },
      { scale: orb1Scale.value }
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: orb2TranslateY.value },
      { translateX: orb2TranslateX.value },
      { scale: orb2Scale.value }
    ],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: orb3TranslateY.value },
      { translateX: orb3TranslateX.value },
      { scale: orb3Scale.value }
    ],
  }));

  const [todos, setTodos] = useState<ToDo[]>([]);
  const [todoText, setTodoText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState<Category>("Work");
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>("Medium");
  const [selectedFilterCategory, setSelectedFilterCategory] =
    useState<string>("All");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState("Champ");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [reminderAt, setReminderAt] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        await requestNotificationPermissions();
        
        const token = await AsyncStorage.getItem("auth_token");
        const userInfo = await AsyncStorage.getItem("user_info");
        
        if (token && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          await Promise.all([fetchTodos(), fetchProfile()]);
        } else {
          router.replace("/login");
        }
      } catch (e) {
        router.replace("/login");
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    }
    initialize();

    // 👂 Listen for notifications that arrive while the app IS open (foreground)
    const arrivalListener = addNotificationReceivedListener((notification) => {
      const { todoId, todoTitle } = notification.request.content.data;
      if (todoId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert("🚨 Task Alert!", `It's time for: ${todoTitle}`, [
          { text: "Done!", onPress: () => handleDone(todoId) },
          { text: "Continue (5m)", onPress: () => handleSnooze(todoId, todoTitle, 5) },
          { text: "Continue (10m)", onPress: () => handleSnooze(todoId, todoTitle, 10) },
          { text: "Dismiss", style: "cancel" }
        ]);
      }
    });

    // 👂 Listen for when a user clicks a notification from the top bar
    const responseListener = addNotificationListener((response) => {
      const { todoId, todoTitle } = response.notification.request.content.data;
      if (todoId) {
        Alert.alert("Time's Up!", `Did you finish "${todoTitle}"?`, [
          { text: "Yes, Done!", onPress: () => handleDone(todoId) },
          { text: "Continue (5m)", onPress: () => handleSnooze(todoId, todoTitle, 5) },
          { text: "Dismiss", style: "cancel" }
        ]);
      }
    });

    return () => { 
      arrivalListener.remove();
      responseListener.remove(); 
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getProfile();
      if (data?.fullName) setProfileName(data.fullName.split(" ")[0]);
    } catch (e) {}
  };

  const handleSnooze = async (id: string, title: string, minutes: number) => {
    try {
      const newTime = new Date(Date.now() + minutes * 60000);
      await scheduleLocalNotification(
        "Task Still Pending 🔔",
        `Checking back in on: ${title}`,
        { todoId: id, todoTitle: title },
        newTime
      );
      showToast(`Reminder set for ${minutes}m from now.`, "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Snooze error:", e);
    }
  };

  const fetchTodos = async () => {
    try {
      const data = await taskApi.getAll();
      const formattedTodos: ToDo[] = (data as any[]).map(item => ({
        id: item._id,
        title: item.title,
        isDone: item.completed,
        category: item.category as Category,
        priority: item.priority as Priority,
        createdAt: item.createdAt,
        reminderAt: item.reminderAt,
      }));
      setTodos(formattedTodos);
    } catch (e) {}
  };

  const handleEdit = (todo: ToDo) => {
    setEditingTodoId(todo.id);
    setTodoText(todo.title);
    setNewTodoCategory(todo.category);
    setNewTodoPriority(todo.priority);
    setReminderAt(todo.reminderAt ? new Date(todo.reminderAt) : null);
    setIsAdding(true);
    setIsEditingTask(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveTodo = async () => {
    if (!isEditingTask && !isPremium && todos.length >= FREE_TASK_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    if (todoText.trim().length > 0 && user) {
      if (!reminderAt && !isEditingTask) {
        Alert.alert("Set a Reminder?", "Would you like to be notified?", [
          { text: "No, Just Save", onPress: () => performSave() },
          { text: "Yes, Set Time", onPress: () => setShowTimePicker(true) }
        ]);
        return;
      }
      performSave();
    }
  };

  const performSave = async () => {
    Keyboard.dismiss();
    try {
      const todoData = {
        title: todoText,
        category: newTodoCategory,
        priority: newTodoPriority,
        completed: false,
        reminderAt: reminderAt ? reminderAt.toISOString() : null,
      };

      let data;
      if (isEditingTask && editingTodoId) {
        data = await taskApi.update(editingTodoId, todoData);
      } else {
        data = await taskApi.create(todoData);
      }

      if (data) {
        const savedTodo: ToDo = {
          id: data._id,
          title: data.title,
          isDone: data.completed,
          category: data.category as Category,
          priority: data.priority as Priority,
          createdAt: data.createdAt,
          reminderAt: data.reminderAt,
        };

        if (isEditingTask) {
          setTodos(prev => prev.map(t => t.id === editingTodoId ? savedTodo : t));
        } else {
          setTodos(prev => [savedTodo, ...prev]);
        }

        if (reminderAt && reminderAt > new Date()) {
          await scheduleLocalNotification("Task Reminder 🔔", `It's time for: ${savedTodo.title}`, { todoId: savedTodo.id, todoTitle: savedTodo.title }, reminderAt);
        }

        setTodoText("");
        setReminderAt(null);
        setEditingTodoId(null);
        setIsEditingTask(false);
        setIsAdding(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(isEditingTask ? "Task updated!" : "Task added!", "success");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to save task.");
    }
  };

  const deleteTodo = async (id: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await taskApi.delete(id);
          setTodos(prev => prev.filter(t => t.id !== id));
      }}
    ]);
  };

  const handleDone = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    await taskApi.update(id, { completed: !todo.isDone });
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredTodos = useMemo(() => {
    return todos.filter(t => (
      t.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (selectedFilterCategory === "All" || t.category === selectedFilterCategory)
    ));
  }, [todos, searchText, selectedFilterCategory]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.isDone).length;
    return {
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      completed,
      pending: total - completed,
    };
  }, [todos]);

  if (isLoading) return <Preloader />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.mainContent}>
            <View style={[styles.header, { display: isSearchFocused ? "none" : "flex" }]}>
              <TouchableOpacity onPress={() => router.push("/menu")} style={[styles.menuButton, { borderColor: theme.border, backgroundColor: theme.card }]}>
                <Ionicons name="menu-outline" size={24} color={theme.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.greetingText, { color: theme.text }]}>{getTimeGreeting()}</Text>
                <Text style={[styles.subGreetingText, { color: theme.textSecondary }]}>{profileName ? `Ready to win, ${profileName}?` : "Let's organize your day"}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                Alert.alert("Clear All?", "Delete all completed tasks?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: async () => {
                    const completedIds = todos.filter(t => t.isDone).map(t => t.id);
                    for (const id of completedIds) await taskApi.delete(id);
                    setTodos(prev => prev.filter(t => !t.isDone));
                  }}
                ]);
              }} style={styles.clearButton}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
            >
              {/* Stats Card - Hidden during search */}
              {!isSearchFocused && (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.statsContainer}>
                  <View style={styles.statCardPrimary}>
                    <View style={styles.statHeaderRow}>
                      <View>
                        <Text style={styles.statLabelMain}>PROGRESS</Text>
                        <Text style={styles.statValueMain}>{stats.progress}%</Text>
                      </View>
                      <Ionicons name="rocket" size={32} color="#fff" />
                    </View>
                    <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${stats.progress}%` }]} /></View>
                  </View>
                  <View style={styles.statRow}>
                    <View style={[styles.statCardSmall, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>DONE</Text><Text style={[styles.statValueSmall, { color: theme.text }]}>{stats.completed}</Text></View>
                    <View style={[styles.statCardSmall, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>PENDING</Text><Text style={[styles.statValueSmall, { color: theme.text }]}>{stats.pending}</Text></View>
                  </View>
                </Animated.View>
              )}

              <View style={styles.searchSection}>
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: isSearchFocused ? theme.primary : theme.border }]}>
                  <Ionicons name="search" size={20} color={theme.textSecondary} />
                  <TextInput 
                    placeholder="Search..." 
                    placeholderTextColor={theme.textSecondary} 
                    style={[styles.searchInput, { color: theme.text }]} 
                    value={searchText} 
                    onChangeText={setSearchText} 
                    onFocus={() => {
                        setIsSearchFocused(true);
                    }} 
                    onBlur={() => setIsSearchFocused(false)} 
                  />
                  {isSearchFocused && (
                    <TouchableOpacity 
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSearchText("");
                        setIsSearchFocused(false);
                        Keyboard.dismiss();
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="close-circle" size={22} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFilterList}>
                  <TouchableOpacity onPress={() => setSelectedFilterCategory("All")} style={[styles.categoryChip, selectedFilterCategory === "All" ? styles.categoryChipActive : { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.categoryText, { color: selectedFilterCategory === "All" ? "#fff" : theme.text }]}>All</Text></TouchableOpacity>
                  {CATEGORIES.map(cat => (<TouchableOpacity key={cat} onPress={() => setSelectedFilterCategory(cat)} style={[styles.categoryChip, selectedFilterCategory === cat ? { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat) } : { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.categoryText, { color: selectedFilterCategory === cat ? "#fff" : theme.text }]}>{cat}</Text></TouchableOpacity>))}
                </ScrollView>
              </View>

              <FlatList data={filteredTodos} keyExtractor={t => t.id} scrollEnabled={false} renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 50)} style={[styles.todoItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TouchableOpacity style={styles.todoContent} onPress={() => handleDone(item.id)}>
                    <Checkbox value={item.isDone} onValueChange={() => handleDone(item.id)} color={item.isDone ? theme.primary : theme.textSecondary} style={styles.checkbox} />
                    <View style={styles.textContainer}>
                      <Text style={[styles.todoText, { color: theme.text, textDecorationLine: item.isDone ? "line-through" : "none", opacity: item.isDone ? 0.5 : 1 }]}>{item.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: getCategoryColor(item.category) }}>{item.category.toUpperCase()}</Text>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: getPriorityColor(item.priority) }}>• {item.priority.toUpperCase()}</Text>
                        {item.reminderAt && <Ionicons name="notifications" size={10} color={theme.primary} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEdit(item)}><Ionicons name="create-outline" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTodo(item.id)}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
                </Animated.View>
              )} contentContainerStyle={styles.listContent} />
            </ScrollView>
          </View>

          {/* Backdrop Overlay */}
          {isAdding && (
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => setIsAdding(false)}
              style={styles.backdrop}
            >
              <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1 }} />
            </TouchableOpacity>
          )}

          {isAdding && (
            <Animated.View entering={FadeInDown} exiting={FadeOut} style={[styles.addTaskContainer, { backgroundColor: theme.cardSolid, borderTopColor: theme.border, borderLeftColor: theme.border, borderRightColor: theme.border }]}>
              <View style={styles.addTaskHeader}>
                <Text style={[styles.addTaskTitle, { color: theme.text }]}>{isEditingTask ? "Edit Task" : "New Task"}</Text>
                <TouchableOpacity onPress={() => { setIsAdding(false); setTodoText(""); setReminderAt(null); setIsEditingTask(false); }}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
              </View>
              <TextInput style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} placeholder="Task title..." placeholderTextColor={theme.textSecondary} value={todoText} onChangeText={setTodoText} autoFocus />
              <View style={styles.modalOptions}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {CATEGORIES.map(cat => (<TouchableOpacity key={cat} onPress={() => setNewTodoCategory(cat)} style={[styles.smallChip, { backgroundColor: newTodoCategory === cat ? getCategoryColor(cat) : theme.background }]}><Text style={{ fontSize: 10, color: newTodoCategory === cat ? '#fff' : theme.text, fontWeight: '800' }}>{cat}</Text></TouchableOpacity>))}
                  </View>
                </View>
              </View>
              <View style={styles.reminderSection}>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.reminderButton, { backgroundColor: theme.background }]}>
                  <Ionicons name="time-outline" size={20} color={theme.primary} />
                  <Text style={[styles.reminderText, { color: theme.text }]}>{reminderAt ? reminderAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Add Reminder"}</Text>
                </TouchableOpacity>
              </View>
              {showTimePicker && <DateTimePicker value={reminderAt || new Date()} mode="time" onChange={(e, d) => { setShowTimePicker(false); if (d) setReminderAt(d); }} />}
              <TouchableOpacity onPress={saveTodo} style={[styles.saveButton, { backgroundColor: theme.primary }]}><Text style={styles.saveButtonText}>{isEditingTask ? "Update" : "Create"}</Text></TouchableOpacity>
            </Animated.View>
          )}

          {!isAdding && (
            <TouchableOpacity onPress={() => setIsAdding(true)} style={[styles.fab, { backgroundColor: theme.primary }]}>
              <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {showUpgradeModal && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }]}>
          <TouchableOpacity onPress={() => setShowUpgradeModal(false)} style={{ backgroundColor: theme.card, padding: 30, borderRadius: 24, width: '80%', alignItems: 'center' }}>
            <Ionicons name="diamond" size={48} color={theme.primary} />
            <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text, marginVertical: 10 }}>Pro Required</Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>Free limit reached. Upgrade for unlimited tasks!</Text>
            <TouchableOpacity onPress={() => { setShowUpgradeModal(false); router.push("/subscription"); }} style={{ backgroundColor: theme.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 }}><Text style={{ color: '#fff', fontWeight: '800' }}>Explore Pro</Text></TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
