import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Detect if we're on an emulator vs physical device
// Detect if we're on an emulator vs physical device
const getBaseUrl = () => {
  // 💡 SEARCH FOR YOUR IP ADDRESS (usually 192.168.1.XX) and put it here:
  const COMPUTER_IP = '10.219.119.11'; 
  
  // Real devices need the IP. Emulators can sometimes use localhost but IP is safer.
  return `http://${COMPUTER_IP}:5050/api`;
};

const BASE_URL = getBaseUrl();
console.log("📍 API CONNECTED TO:", BASE_URL);

export const apiCall = async (endpoint: string, options: any = {}) => {
  const token = await AsyncStorage.getItem("auth_token");

  const isFormData = options.body instanceof FormData;
  
  const headers: any = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s for uploads

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Server Error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch (e) {
        // Not JSON, use raw text or status
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check if your server is running.');
    }
    console.error(`API Call Error (${BASE_URL}${endpoint}):`, error);
    throw error;
  }
};

export const authApi = {
  login: (credentials: any) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  signup: (userData: any) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getProfile: () => apiCall('/auth/profile'),
  updateProfile: (data: any) => apiCall('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  changePassword: (data: any) => apiCall('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  uploadAvatar: (formData: FormData) => apiCall("/auth/upload-avatar", { 
    method: "POST", 
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
};

export const taskApi = {
  getAll: () => apiCall('/tasks'),
  create: (taskData: any) => apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  update: (id: string, taskData: any) => apiCall(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(taskData),
  }),
  delete: (id: string) => apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};
