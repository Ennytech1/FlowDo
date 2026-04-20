import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Check if we are running in Expo Go (which doesn't support notifications in SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

// Configure how notifications should behave when the app is in the foreground
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * 🔔 Request permissions and schedule a local alarm
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: any,
  date: Date
) {
  // Allow local notifications even in Expo Go for testing
  // 1. Check/Request Permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("❌ Notification permissions not granted!");
    return null;
  }

  // 2. Schedule the notification
  const trigger = new Date(date);
  
  // If the date is in the past, don't schedule
  if (trigger.getTime() <= Date.now()) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });

  console.log(`✅ Alarm scheduled for ${trigger.toLocaleString()} with ID: ${identifier}`);
  return identifier;
}

/**
 * 👂 Listen for notification clicks or arrivals
 */
export function addNotificationListener(callback: (response: Notifications.NotificationResponse) => void) {
  // Listen for when a user interacts with a notification (e.g., taps it)
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return subscription;
}

/**
 * 📋 Cancel a specific notification
 */
/**
 * 📋 Cancel a specific notification
 */
export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * 🔐 Request permissions explicitly
 */
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export function addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(callback);
}
