/**
 * Premium Custom Tab Bar
 * Floating glassmorphism design with animated indicator
 */

import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme, ThemeColors } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabItemProps {
  label: string;
  icon: string;
  iconFocused: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  theme: ThemeColors;
}

function TabItem({ label, icon, iconFocused, isFocused, onPress, onLongPress, theme }: TabItemProps) {
  const scale = useSharedValue(1);
  const animatedFocus = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    animatedFocus.value = withTiming(isFocused ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedFocus, isFocused]);

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolateColor(
      animatedFocus.value,
      [0, 1],
      ['rgba(255,255,255,0.5)', 'rgba(255,255,255,1)']
    ) === 'rgba(255,255,255,1)' ? 1 : 0.5,
    transform: [
      { scale: 0.95 + animatedFocus.value * 0.05 },
      { translateY: -animatedFocus.value * 2 },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: animatedFocus.value,
    transform: [
      { translateY: (1 - animatedFocus.value) * 5 },
      { scale: 0.9 + animatedFocus.value * 0.1 },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: animatedFocus.value * 0.6,
    transform: [{ scale: 0.8 + animatedFocus.value * 0.4 }],
  }));

  return (
    <AnimatedPressable
      style={[styles.tabItem, containerStyle]}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Glow effect - only for dark mode */}
      {theme.isDark && (
        <Animated.View style={[styles.glow, glowStyle]}>
          <LinearGradient
            colors={['#06FFA5', 'transparent']}
            style={styles.glowGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
      )}

      {/* Icon */}
      <Animated.View style={iconStyle}>
        <Ionicons
          name={(isFocused ? iconFocused : icon) as any}
          size={22}
          color={isFocused ? theme.accent.primary : theme.text.muted}
        />
      </Animated.View>

      {/* Label */}
      <Animated.Text style={[styles.label, { color: isFocused ? theme.accent.primary : theme.text.muted }, labelStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const TAB_CONFIG: Record<string, { icon: string; iconFocused: string }> = {
  index: { icon: 'home-outline', iconFocused: 'home' },
  breaks: { icon: 'body-outline', iconFocused: 'body' },
  stats: { icon: 'stats-chart-outline', iconFocused: 'stats-chart' },
  profile: { icon: 'person-outline', iconFocused: 'person' },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={[
        styles.tabBarWrapper,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme.isDark ? 0.3 : 0.12,
          shadowRadius: 12,
          elevation: theme.isDark ? 0 : 10,
        }
      ]}>
        {/* BlurView only for dark mode */}
        {theme.isDark && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 15, 20, 0.95)' }]} />
          )
        )}

        {/* Border highlight - only for dark mode */}
        {theme.isDark && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.borderHighlight}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        )}

        {/* Tabs */}
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const isFocused = state.index === index;

            const config = TAB_CONFIG[route.name] || { icon: 'ellipse-outline', iconFocused: 'ellipse' };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                label={label}
                icon={config.icon}
                iconFocused={config.iconFocused}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                theme={theme}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabBarWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -8,
    width: 50,
    height: 36,
    alignItems: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
});
