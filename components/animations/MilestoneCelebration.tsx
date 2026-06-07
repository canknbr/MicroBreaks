/**
 * MilestoneCelebration
 *
 * Single unified entry point for every milestone moment in the app. Pass
 * a milestone key (e.g. `streak_day_30`) and a value (e.g. `30`) and the
 * component figures out everything else:
 *
 *   - If a Lottie .json asset is registered for that key, the Lottie
 *     plays in a full-screen overlay (auto-dismiss at `durationMs`).
 *   - If no Lottie is registered yet, falls back to the existing
 *     `ConfettiCelebration` so the user still sees a real moment.
 *
 * Haptics are routed through `useHapticChoreography`:
 *   - `completionFanfare()` on mount (3-beat cascade)
 *   - `milestone(meta.hapticIntensity)` on the first frame so heavier
 *     milestones feel heavier.
 *
 * Reduce Motion is respected indirectly: the choreography hook downgrades
 * the haptic chain, and the Lottie loop count is honoured by the platform.
 * The fallback `ConfettiCelebration` already handles Reduce Motion itself.
 *
 * Example:
 *   <MilestoneCelebration
 *     name="streak_day_7"
 *     value={7}
 *     onDismiss={() => setShown(false)}
 *   />
 */

import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LottieView, { type AnimationObject } from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTranslation } from '@/i18n/hooks';
import { useHapticChoreography } from '@/hooks/useHapticChoreography';
import {
  getMilestoneLottieSource,
  getMilestoneMeta,
  type MilestoneCelebrationKey,
} from '@/assets/animations';
import ConfettiCelebration from '@/components/ui/ConfettiCelebration';

interface MilestoneCelebrationProps {
  name: MilestoneCelebrationKey;
  value?: number | string;
  onDismiss: () => void;
  /** Override the auto-dismiss timeout. Defaults to the registry value. */
  autoDismissMs?: number;
}

export default function MilestoneCelebration({
  name,
  value,
  onDismiss,
  autoDismissMs,
}: MilestoneCelebrationProps) {
  const meta = getMilestoneMeta(name);
  const lottieSource = getMilestoneLottieSource(name);

  // No Lottie asset bundled yet — fall back to the existing confetti
  // experience so the user still gets a real celebration today. When the
  // .json drops into the registry the same call site auto-upgrades.
  if (!lottieSource) {
    return (
      <ConfettiCelebration
        type={meta.fallbackType}
        value={value}
        onDismiss={onDismiss}
        autoHide
        autoHideDelay={autoDismissMs ?? meta.durationMs + 1200}
      />
    );
  }

  return (
    <LottieMilestoneOverlay
      meta={meta}
      lottieSource={lottieSource}
      milestoneKey={name}
      value={value}
      onDismiss={onDismiss}
      autoDismissMs={autoDismissMs ?? meta.durationMs}
    />
  );
}

interface LottieMilestoneOverlayProps {
  meta: ReturnType<typeof getMilestoneMeta>;
  lottieSource: AnimationObject;
  milestoneKey: MilestoneCelebrationKey;
  value?: number | string;
  onDismiss: () => void;
  autoDismissMs: number;
}

function LottieMilestoneOverlay({
  meta,
  lottieSource,
  milestoneKey,
  value,
  onDismiss,
  autoDismissMs,
}: LottieMilestoneOverlayProps) {
  const { t } = useTranslation();
  const { completionFanfare, milestone, tapBack } = useHapticChoreography();
  const dismissedRef = useRef(false);

  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.92);
  const contentOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(24);

  // Falls back to ConfettiCelebration's i18n keys so we share copy with
  // the existing celebration surface — one source of truth for all
  // celebration strings.
  const title = t(`home.celebrations.${meta.fallbackType}.title`, {
    defaultValue: 'You did it!',
  });
  const subtitleBase = t(`home.celebrations.${meta.fallbackType}.subtitle`, {
    defaultValue: 'Milestone unlocked',
  });
  const subtitle =
    meta.fallbackType === 'streak_milestone' && value
      ? `${value} ${subtitleBase}`
      : subtitleBase;
  const dismissHint = t('home.celebrations.dismissHint', {
    defaultValue: 'Tap anywhere to continue',
  });

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 350 });
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 400 }));
    contentScale.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 110 }));
    textTranslateY.value = withDelay(250, withTiming(0, { duration: 500 }));

    completionFanfare();
    milestone(meta.hapticIntensity);

    const timeout = setTimeout(() => {
      if (!dismissedRef.current) {
        handleDismiss();
      }
    }, autoDismissMs);

    return () => clearTimeout(timeout);
    // We intentionally only fire the entrance choreography once per
    // mount. The milestone key is captured in `meta` already, so the
    // empty dep list reflects the real semantic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    tapBack();
    overlayOpacity.value = withTiming(0, { duration: 250 });
    contentOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onDismiss, 260);
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: 1 - textTranslateY.value / 24,
  }));

  return (
    <Pressable
      style={styles.container}
      onPress={handleDismiss}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}. ${dismissHint}.`}
      accessibilityHint={dismissHint}
      // Stable key for testing — components mount once per celebration.
      testID={`milestone-celebration-${milestoneKey}`}
    >
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.lottieWrapper}>
          <LottieView
            source={lottieSource}
            autoPlay
            loop={false}
            style={styles.lottie}
            resizeMode="contain"
          />
        </View>

        <Animated.View style={textStyle}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>

        <Text style={styles.dismissHint}>{dismissHint}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  scrim: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lottieWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 28,
  },
  dismissHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
    marginTop: 4,
  },
});
