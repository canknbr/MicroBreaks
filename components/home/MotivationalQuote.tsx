/**
 * Motivational Quote Component
 * Daily wellness quotes with fade animation
 */

import { useEffect, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';

interface Quote {
  text: string;
  author: string;
}

const FALLBACK_QUOTE: Quote = {
  text: 'Small breaks lead to big breakthroughs.',
  author: 'Wellness Wisdom',
};

interface MotivationalQuoteProps {
  delay?: number;
}

// React.memo wrapper removed (audit D-PERF5): with the React Compiler
// enabled in app.json experiments, prop-equality memoization for primitive
// props is handled automatically. The manual wrapper was redundant.
function MotivationalQuote({ delay = 0 }: MotivationalQuoteProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const quote = useMemo<Quote>(() => {
    const list = t('home.motivationalQuotes', { returnObjects: true }) as unknown;
    const quotes = Array.isArray(list) ? (list as Quote[]) : [];
    if (quotes.length === 0) return FALLBACK_QUOTE;
    return quotes[Math.floor(Math.random() * quotes.length)] ?? FALLBACK_QUOTE;
  }, [t]);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={[styles.quoteIcon, { color: `${theme.accent.primary}50` }]}>&quot;</Text>
      <Text style={[styles.quoteText, { color: theme.text.secondary }]}>{quote.text}</Text>
      <Text style={[styles.author, { color: theme.text.muted }]}>— {quote.author}</Text>
    </Animated.View>
  );
}

export default MotivationalQuote;

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
