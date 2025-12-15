/**
 * Motivational Quote Component
 * Daily wellness quotes with fade animation
 */

import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const QUOTES = [
  { text: "Small breaks lead to big breakthroughs.", author: "Wellness Wisdom" },
  { text: "Your body keeps the score. Listen to it.", author: "Movement Matters" },
  { text: "Rest is not idleness, it's recharging.", author: "Mindful Living" },
  { text: "Every stretch is a step toward better health.", author: "Body Balance" },
  { text: "Pause. Breathe. Continue stronger.", author: "Focus Flow" },
  { text: "The best time to take a break was 5 minutes ago. The second best time is now.", author: "Break Better" },
  { text: "Your future self will thank you for this break.", author: "Self Care" },
  { text: "Movement is medicine for the mind.", author: "Active Mind" },
];

interface MotivationalQuoteProps {
  delay?: number;
}

export default function MotivationalQuote({ delay = 0 }: MotivationalQuoteProps) {
  const theme = useTheme();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={[styles.quoteIcon, { color: `${theme.accent.primary}50` }]}>"</Text>
      <Text style={[styles.quoteText, { color: theme.text.secondary }]}>{quote.text}</Text>
      <Text style={[styles.author, { color: theme.text.muted }]}>— {quote.author}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  quoteIcon: {
    fontSize: 32,
    color: 'rgba(6, 255, 165, 0.3)',
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: -8,
  },
  quoteText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  author: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
});
