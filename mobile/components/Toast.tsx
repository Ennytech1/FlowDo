import React, { createContext, useContext, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  Layout, 
  SlideInUp, 
  SlideOutUp 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <View style={styles.toastContainer} pointerEvents="none">
           <SafeAreaView>
            <Animated.View 
              entering={SlideInUp.springify().damping(15)}
              exiting={SlideOutUp}
              layout={Layout.springify()}
              style={[
                styles.toastCard,
                styles[toast.type],
                Platform.OS === 'ios' ? styles.shadowIos : styles.shadowAndroid
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={
                    toast.type === 'success' ? 'checkmark-circle' : 
                    toast.type === 'error' ? 'alert-circle' : 'information-circle'
                  } 
                  size={24} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.toastText}>{toast.message}</Text>
            </Animated.View>
          </SafeAreaView>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  toastCard: {
    width: width * 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  success: {
    backgroundColor: '#10b981',
  },
  error: {
    backgroundColor: '#ef4444',
  },
  info: {
    backgroundColor: '#6366f1',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  shadowIos: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  shadowAndroid: {
    elevation: 8,
  }
});
