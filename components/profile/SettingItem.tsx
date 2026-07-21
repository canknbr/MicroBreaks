import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';

export function SettingItem({
  label,
  type,
  value,
  isEnabled,
  onToggle,
  onPress,
  delay,
  index,
  disabled,
  theme,
}: {
  // `icon` is accepted for call-site compatibility but no longer rendered —
  // the editorial rows are type-driven, not icon-in-a-box.
  icon?: IoniconsName;
  label: string;
  type: 'toggle' | 'value' | 'arrow';
  value?: string;
  isEnabled?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  delay: number;
  index: number;
  disabled?: boolean;
  theme: ThemeColors;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(16);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay + index * 50, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay + index * 50, withTiming(0, { duration: 400 }));
  }, [delay, index, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (type !== 'toggle') {
      scale.value = withSpring(0.99);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (type !== 'toggle' && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const accessibilityProps = (() => {
    switch (type) {
      case 'toggle':
        return {
          accessibilityRole: 'switch' as const,
          accessibilityState: { checked: isEnabled },
          accessibilityLabel: label,
        };
      case 'value':
        return {
          accessibilityRole: 'button' as const,
          accessibilityLabel: `${label}, current value ${value}`,
        };
      case 'arrow':
        return {
          accessibilityRole: 'button' as const,
          accessibilityLabel: label,
          accessibilityHint: 'Opens settings page',
        };
    }
  })();

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={type === 'toggle' || disabled}
      {...accessibilityProps}
    >
      <Animated.View
        style={[
          styles.settingItem,
          index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
          animatedStyle,
          disabled && styles.settingItemDisabled,
        ]}
      >
        <Text
          style={[
            styles.settingLabel,
            { color: theme.text.primary },
            disabled && { color: theme.text.muted },
          ]}
        >
          {label}
        </Text>
        {type === 'toggle' && (
          <Switch
            value={isEnabled}
            onValueChange={() => {
              Haptics.selectionAsync();
              onToggle?.();
            }}
            trackColor={{
              false: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border.medium,
              true: theme.accent.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={
              theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border.medium
            }
            disabled={disabled}
          />
        )}
        {type === 'value' && (
          <Text style={[styles.settingValue, { color: theme.text.muted }]}>{value}</Text>
        )}
        {type === 'arrow' && (
          <Ionicons name="chevron-forward" size={20} color={theme.text.muted} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingLabel: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 16,
    letterSpacing: -0.2,
    marginRight: 12,
  },
  settingValue: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 15,
  },
});
