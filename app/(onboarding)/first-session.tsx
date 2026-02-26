/**
 * ONB_019: First Session Start
 * Premium zen design with smooth animations
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

export default function FirstSessionScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  // Animation values
  const timerScale = useSharedValue(0.9);
  const timerOpacity = useSharedValue(0);
  const timerPulse = useSharedValue(1);
  const settingsOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);

    timerOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    timerScale.value = withDelay(200, withTiming(1, { duration: 600, easing }));
    settingsOpacity.value = withDelay(400, withTiming(1, { duration: 400, easing }));
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 400, easing }));

    // Subtle pulse animation for timer
    timerPulse.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1.01, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: timerOpacity.value,
    transform: [{ scale: timerScale.value * timerPulse.value }],
  }));

  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: settingsOpacity.value,
    transform: [{ translateY: interpolate(settingsOpacity.value, [0, 1], [20, 0]) }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleStart = () => {
    router.push('./completion');
  };

  const handleExplore = () => {
    router.push('./completion');
  };

  return (
    <OnboardingLayout currentStep={19} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Ready for your first focused session?
        </HeadlineText>

        {/* Timer Display */}
        <Animated.View style={[styles.timerCard, timerAnimatedStyle]}>
          <LinearGradient
            colors={[ZenColors.primary.glow, 'transparent']}
            style={styles.timerGlow}
          />
          <View style={styles.timerRing}>
            <LinearGradient
              colors={[ZenColors.primary.main, ZenColors.secondary.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ringGradient}
            />
            <View style={styles.timerInner}>
              <Text style={styles.timerValue}>50:00</Text>
              <Text style={styles.timerLabel}>Deep Work Session</Text>
            </View>
          </View>
          <Text style={styles.timerSubtext}>Your first break in 50 minutes</Text>
        </Animated.View>

        {/* Quick Settings */}
        <Animated.View style={[styles.settings, settingsAnimatedStyle]}>
          <Text style={styles.settingsTitle}>Quick Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={20} color={ZenColors.primary.main} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{
                false: ZenColors.border.default,
                true: ZenColors.primary.main,
              }}
              thumbColor={ZenColors.text.inverse}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name="volume-high-outline" size={20} color={ZenColors.primary.main} />
            </View>
            <Text style={styles.settingLabel}>Sound</Text>
            <Switch
              value={soundOn}
              onValueChange={setSoundOn}
              trackColor={{
                false: ZenColors.border.default,
                true: ZenColors.primary.main,
              }}
              thumbColor={ZenColors.text.inverse}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingIcon}>
              <Ionicons name="phone-portrait-outline" size={20} color={ZenColors.primary.main} />
            </View>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={vibrationOn}
              onValueChange={setVibrationOn}
              trackColor={{
                false: ZenColors.border.default,
                true: ZenColors.primary.main,
              }}
              thumbColor={ZenColors.text.inverse}
            />
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={buttonsAnimatedStyle}>
          <PrimaryButton
            title="Start Working"
            onPress={handleStart}
            size="large"
            variant="primary"
          />
          <SecondaryButton title="Explore first" onPress={handleExplore} variant="muted" />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timerCard: {
    alignItems: 'center',
    marginTop: ZenSpacing.xl,
    marginBottom: ZenSpacing.lg,
  },
  timerGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    padding: 6,
    marginBottom: ZenSpacing.md,
  },
  ringGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
  },
  timerInner: {
    flex: 1,
    backgroundColor: ZenColors.background.pure,
    borderRadius: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    ...ZenTypography.display.large,
    color: ZenColors.primary.main,
  },
  timerLabel: {
    ...ZenTypography.label.medium,
    color: ZenColors.text.secondary,
    marginTop: ZenSpacing.xxs,
  },
  timerSubtext: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
  },
  settings: {
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.md,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  settingsTitle: {
    ...ZenTypography.label.large,
    color: ZenColors.text.primary,
    marginBottom: ZenSpacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ZenSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZenColors.border.subtle,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: ZenRadius.md,
    backgroundColor: ZenColors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.sm,
  },
  settingLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
});
