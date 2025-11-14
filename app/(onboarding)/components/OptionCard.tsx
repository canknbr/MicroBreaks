/**
 * Option Card Component
 * Clean, minimal selectable card with smooth animations
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

interface OptionCardProps {
  icon?: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  style?: any;
}

export default function OptionCard({
  icon,
  title,
  description,
  selected = false,
  onPress,
  style,
}: OptionCardProps) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98, { damping: 20 });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 20 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <View style={[styles.card, selected && styles.cardSelected]}>
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={[styles.title, selected && styles.titleSelected]}>
                {title}
              </Text>
              {description && (
                <Text style={styles.description}>{description}</Text>
              )}
            </View>
          </View>
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.card.background,
    borderWidth: 2,
    borderColor: Colors.dark.border.default,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    minHeight: 72,
  },
  cardSelected: {
    borderColor: Colors.dark.brand.primary,
    backgroundColor: Colors.dark.background.secondary,
  },
  content: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.bodyLargeBold,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.xxs,
  },
  titleSelected: {
    color: Colors.dark.text.primary,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  checkboxSelected: {
    borderColor: Colors.dark.brand.primary,
    backgroundColor: Colors.dark.brand.primary,
  },
  checkmark: {
    color: Colors.dark.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
