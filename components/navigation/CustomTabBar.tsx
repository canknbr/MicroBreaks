/**
 * Floating pill tab bar — "Outsiders" redesign.
 * A dark, rounded, blurred pill containing icon-over-label items. The active
 * item sits on a raised inner pill and is tinted with the brand pink.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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
  const focus = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [focus, isFocused]);

  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 90 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 180 });
  };
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: 0.9 + focus.value * 0.1 }],
  }));

  const tint = isFocused ? theme.accent.primary : theme.text.muted;

  return (
    <AnimatedPressable
      style={[styles.tabItem, containerStyle]}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
    >
      {/* Raised inner pill behind the active item */}
      <Animated.View
        pointerEvents="none"
        style={[styles.activePill, { backgroundColor: theme.background.elevated }, pillStyle]}
      />
      <Ionicons name={(isFocused ? iconFocused : icon) as any} size={21} color={tint} />
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
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
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.pill, { borderColor: theme.border.subtle }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28, 25, 34, 0.82)' }]} />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = (options.title ?? route.name) as string;
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
              navigation.emit({ type: 'tabLongPress', target: route.key });
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pill: {
    alignSelf: 'center',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 3,
  },
  activePill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 6,
    right: 6,
    borderRadius: 999,
  },
  label: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
