/**
 * OfflineBanner Component
 * Shows a subtle banner when the device is offline
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function OfflineBanner() {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOffline) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-50, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents={isOffline ? 'auto' : 'none'}
      accessibilityRole="alert"
      accessibilityLabel="You are offline. Changes will sync when reconnected."
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={16} color="#FFF" />
        <Text style={styles.text}>Offline — changes will sync later</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
});
