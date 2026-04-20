import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Preloader() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Opacity pulse
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      true
    );

    // Subtle rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Background Orbs for glassmorphism feel */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          {/* Outer Rotating Ring */}
          <Animated.View style={[styles.ring, animatedRingStyle]} />
          
          {/* Main Pulsing Logo */}
          <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
            <Ionicons name="flash" size={50} color="#fff" />
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(500)}>
          <Text style={styles.title}>ToDo CHAMP</Text>
          <Text style={styles.subtitle}>Peak Productivity Awaits</Text>
        </Animated.View>
        
        <View style={styles.loaderBarContainer}>
          <Animated.View 
            entering={FadeIn.delay(800)}
            style={styles.loaderBar}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Deep Slate Blue
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#6366f1', // Indigo
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  loaderBarContainer: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  loaderBar: {
    height: '100%',
    width: '40%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  orb: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.15,
  },
  orb1: {
    top: -100,
    left: -100,
    backgroundColor: '#6366f1',
  },
  orb2: {
    bottom: -100,
    right: -100,
    backgroundColor: '#10b981',
  },
});
