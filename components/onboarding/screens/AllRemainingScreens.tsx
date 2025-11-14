/**
 * Remaining Onboarding Screens
 * Simplified implementations of remaining screens
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionCard } from '../SelectionCard';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { useColorScheme } from '../../../hooks/useColorScheme';

// ========== Phase 2: Ergonomic Setup (Screen 8) ==========
export const ErgoSetupScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress, data } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [checklist, setChecklist] = useState(data.ergoChecklist);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const score = checklist.filter((item) => item.checked).length;

  const handleContinue = () => {
    updateData({ ergoChecklist: checklist });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Check your setup basics" subtitle="Good ergonomics prevent pain" emoji="🪑" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.scoreCard, { backgroundColor: colors.background.secondary }, Shadows.md]}>
            <Text style={[styles.scoreText, Typography.displaySmall, { color: score >= 4 ? colors.status.success : score >= 3 ? colors.status.warning : colors.status.error }]}>
              {score}/5
            </Text>
            <Text style={[styles.scoreLabel, Typography.bodyMedium, { color: colors.text.secondary }]}>
              Setup Score
            </Text>
          </Animated.View>

          <View style={styles.checklistItems}>
            {checklist.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(300 + index * 100).duration(600)}>
                <TouchableOpacity
                  onPress={() => toggleItem(item.id)}
                  style={[styles.checklistItem, { backgroundColor: colors.background.secondary, borderColor: item.checked ? colors.brand.primary : colors.border.default }, item.checked && Shadows.sm]}
                >
                  <View style={[styles.checkbox, { backgroundColor: item.checked ? colors.brand.primary : 'transparent', borderColor: colors.border.default }]}>
                    {item.checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checklistLabel, Typography.bodyMedium, { color: colors.text.primary }]}>{item.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 2: Notification Preference (Screen 9) ==========
export const NotificationPreferenceScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { value: 'gentle', label: 'Gentle', subtitle: 'Subtle reminders, easy to snooze', icon: '🔔' },
    { value: 'balanced', label: 'Balanced', subtitle: 'Regular reminders with flexibility', icon: '⚖️' },
    { value: 'strict', label: 'Strict', subtitle: 'Keep me accountable', icon: '⏰' },
    { value: 'smart', label: 'Smart', subtitle: 'AI-adjusted based on behavior', icon: '🤖' },
  ];

  const handleContinue = () => {
    if (selected) {
      updateData({ notificationPreference: selected as any });
      goToNextScreen();
    }
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="How should we remind you?" subtitle="You can change this anytime" emoji="🔔" />

        <View style={styles.content}>
          {options.map((option, index) => (
            <Animated.View key={option.value} entering={FadeInDown.delay(200 + index * 100).duration(600)}>
              <SelectionCard title={option.label} subtitle={option.subtitle} icon={option.icon} selected={selected === option.value} onPress={() => setSelected(option.value)} />
            </Animated.View>
          ))}
        </View>

        <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" disabled={!selected} />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 2: Energy Pattern (Screen 10) ==========
export const EnergyPatternScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { value: 'morning_person', label: 'Morning Person', icon: '☀️' },
    { value: 'night_owl', label: 'Night Owl', icon: '🦉' },
    { value: 'afternoon_slump', label: 'Afternoon Slump', icon: '😴' },
    { value: 'steady_energy', label: 'Steady Energy', icon: '⚡' },
  ];

  const handleContinue = () => {
    if (selected) {
      updateData({ energyPattern: { pattern: selected as any } });
      goToNextScreen();
    }
  };

  const handleSkip = () => {
    updateData({ energyPattern: { pattern: 'steady_energy' } });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="When do you feel most energetic?" subtitle="Helps us optimize break timing" emoji="⚡" />

        <View style={styles.content}>
          {options.map((option, index) => (
            <Animated.View key={option.value} entering={FadeInDown.delay(200 + index * 100).duration(600)}>
              <SelectionCard title={option.label} icon={option.icon} selected={selected === option.value} onPress={() => setSelected(option.value)} />
            </Animated.View>
          ))}
        </View>

        <View style={styles.actions}>
          <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" disabled={!selected} />
          <OnboardingButton title="I'm not sure" onPress={handleSkip} variant="ghost" />
        </View>
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 2: Break Style (Screen 11) ==========
export const BreakStyleScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);

  const options = [
    { value: 'movement', label: 'Movement Breaks', subtitle: 'Stand, stretch, walk', icon: '🚶' },
    { value: 'desk_exercises', label: 'Desk Exercises', subtitle: 'Stay seated, gentle stretches', icon: '🧘' },
    { value: 'breathing', label: 'Breathing/Mindfulness', subtitle: 'Calm, focused, mental reset', icon: '🫁' },
    { value: 'eye_micro', label: 'Eye & Micro-movements', subtitle: 'Quick, subtle, effective', icon: '👁️' },
    { value: 'mixed_variety', label: 'Mixed Variety', subtitle: 'Surprise me with different types', icon: '🎲' },
  ];

  const handleToggle = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleContinue = () => {
    updateData({ breakStyles: selected as any });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="What break style appeals to you?" subtitle="Select all that interest you" emoji="💆" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {options.map((option, index) => (
            <Animated.View key={option.value} entering={FadeInDown.delay(200 + index * 100).duration(600)}>
              <SelectionCard title={option.label} subtitle={option.subtitle} icon={option.icon} selected={selected.includes(option.value)} onPress={() => handleToggle(option.value)} multiSelect />
            </Animated.View>
          ))}
        </ScrollView>

        <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" disabled={selected.length === 0} />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 3: AI Recommendation (Screen 12) ==========
export const AIRecommendationScreen: React.FC = () => {
  const { goToNextScreen, data, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const primaryPain = data.painAreas[0]?.area || 'neck';

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Your Personalized Plan" emoji="✨" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.planCard, { backgroundColor: `${colors.brand.primary}15` }, Shadows.lg]}>
            <Text style={[styles.matchText, Typography.displaySmall, { color: colors.brand.primary }]}>87% match</Text>
            <View style={styles.planDetails}>
              <View style={styles.planRow}>
                <Text style={[Typography.labelLarge, { color: colors.text.secondary }]}>Primary focus:</Text>
                <Text style={[Typography.bodyLarge, { color: colors.text.primary }]}>{primaryPain} relief</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={[Typography.labelLarge, { color: colors.text.secondary }]}>Schedule:</Text>
                <Text style={[Typography.bodyLarge, { color: colors.text.primary }]}>25-min work, 2-min breaks</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={[Typography.labelLarge, { color: colors.text.secondary }]}>First week goal:</Text>
                <Text style={[Typography.bodyLarge, { color: colors.text.primary }]}>Build consistency</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <OnboardingButton title="Try Your First Break" onPress={goToNextScreen} variant="primary" />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 3: Live Demo (Screen 13) ==========
export const LiveDemoScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [feedback, setFeedback] = useState<'positive' | 'neutral' | 'negative' | null>(null);

  const handleFeedback = (value: 'positive' | 'neutral' | 'negative') => {
    setFeedback(value);
    updateData({ demoCompleted: true, demoFeedback: value });
  };

  const handleContinue = () => {
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Let's try a quick stretch" subtitle="30-second neck relief" emoji="🧘‍♀️" />

        <View style={styles.demoContainer}>
          <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.demoEmoji}>
            🔄
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={[styles.demoText, Typography.bodyLarge]}>
            Gently rotate your neck
            {'\n'}
            clockwise 5 times
          </Animated.Text>

          {!feedback && (
            <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.feedbackButtons}>
              <TouchableOpacity onPress={() => handleFeedback('positive')} style={styles.emojiButton}>
                <Text style={styles.emojiFeedback}>😊</Text>
                <Text style={[Typography.bodySmall]}>Felt great</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleFeedback('neutral')} style={styles.emojiButton}>
                <Text style={styles.emojiFeedback}>😐</Text>
                <Text style={[Typography.bodySmall]}>Okay</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleFeedback('negative')} style={styles.emojiButton}>
                <Text style={styles.emojiFeedback}>😟</Text>
                <Text style={[Typography.bodySmall]}>Not great</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <OnboardingButton title={feedback ? 'Continue' : 'Skip'} onPress={handleContinue} variant={feedback ? 'primary' : 'ghost'} />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 3: Value Display (Screen 14) ==========
export const ValueDisplayScreen: React.FC = () => {
  const { goToNextScreen, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="That 30-second break just..." emoji="✨" />

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.benefitItem, { backgroundColor: colors.background.secondary }, Shadows.sm]}>
            <Text style={styles.benefitEmoji}>↓</Text>
            <Text style={[Typography.bodyLarge, { color: colors.text.primary }]}>Reduced muscle tension by ~12%</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.benefitItem, { backgroundColor: colors.background.secondary }, Shadows.sm]}>
            <Text style={styles.benefitEmoji}>↑</Text>
            <Text style={[Typography.bodyLarge, { color: colors.text.primary }]}>Increased blood flow to your neck</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={[styles.benefitItem, { backgroundColor: colors.background.secondary }, Shadows.sm]}>
            <Text style={styles.benefitEmoji}>👁</Text>
            <Text style={[Typography.bodyLarge, { color: colors.text.primary }]}>Gave your eyes a needed rest</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(600)} style={[styles.socialCard, { backgroundColor: `${colors.brand.primary}10` }]}>
            <Text style={[Typography.bodyMedium, { color: colors.text.secondary, textAlign: 'center' }]}>You just joined 10,847 people{'\n'}taking a break right now</Text>
          </Animated.View>
        </View>

        <OnboardingButton title="Set Up My Breaks" onPress={goToNextScreen} variant="primary" />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 3: Education (Screen 15) ==========
export const EducationScreen: React.FC = () => {
  const { goToNextScreen, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const facts = [
    { icon: '👁️', title: '20-20-20 Rule', text: 'Look 20ft away for 20 seconds every 20 minutes' },
    { icon: '💪', title: 'Muscle Memory', text: 'Regular stretches prevent chronic tension' },
    { icon: '🧠', title: 'Focus Boost', text: '2-min breaks improve concentration by 23%' },
  ];

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="The science behind micro-breaks" emoji="🔬" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {facts.map((fact, index) => (
            <Animated.View key={index} entering={FadeInDown.delay(200 + index * 200).duration(600)} style={[styles.factCard, { backgroundColor: colors.background.secondary }, Shadows.sm]}>
              <Text style={styles.factEmoji}>{fact.icon}</Text>
              <Text style={[styles.factTitle, Typography.labelLarge, { color: colors.text.primary }]}>{fact.title}</Text>
              <Text style={[styles.factText, Typography.bodyMedium, { color: colors.text.secondary }]}>{fact.text}</Text>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <OnboardingButton title="Continue" onPress={goToNextScreen} variant="primary" />
          <OnboardingButton title="Got it" onPress={goToNextScreen} variant="ghost" />
        </View>
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 4: Timer Config (Screen 16) ==========
export const TimerConfigScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [selected, setSelected] = useState('pomodoro');

  const presets = [
    { value: 'pomodoro', label: 'Pomodoro Classic', subtitle: '25 min work → 5 min break', icon: '🍅' },
    { value: 'deep_work', label: 'Deep Work', subtitle: '50 min work → 10 min break', icon: '🎯' },
    { value: 'micro_session', label: 'Micro-Session', subtitle: '15 min work → 2 min break', icon: '⚡' },
  ];

  const handleContinue = () => {
    updateData({ timerPreset: selected as any });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Choose your work rhythm" subtitle="Recommended based on your profile" emoji="⏰" />

        <View style={styles.content}>
          {presets.map((preset, index) => (
            <Animated.View key={preset.value} entering={FadeInDown.delay(200 + index * 100).duration(600)}>
              <SelectionCard title={preset.label} subtitle={preset.subtitle} icon={preset.icon} selected={selected === preset.value} onPress={() => setSelected(preset.value)} />
            </Animated.View>
          ))}
        </View>

        <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 4: Notification Permission (Screen 17) ==========
export const NotificationPermissionScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEnable = () => {
    // TODO: Request actual notification permission
    updateData({ notificationsEnabled: true });
    goToNextScreen();
  };

  const handleLater = () => {
    updateData({ notificationsEnabled: false });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Stay healthy without thinking about it" emoji="🔔" />

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.permissionCard, { backgroundColor: colors.background.secondary }, Shadows.md]}>
            <Text style={[styles.permissionTitle, Typography.headlineSmall, { color: colors.text.primary }]}>✓ Gentle reminders between tasks</Text>
            <Text style={[styles.permissionTitle, Typography.headlineSmall, { color: colors.text.primary }]}>✓ Skip when in meetings</Text>
            <Text style={[styles.permissionTitle, Typography.headlineSmall, { color: colors.text.primary }]}>✓ Full control over frequency</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.trustBadge, { backgroundColor: `${colors.brand.primary}10` }]}>
            <Text style={[Typography.bodySmall, { color: colors.text.secondary, textAlign: 'center' }]}>No spam, ever • Snooze anytime • Smart detection</Text>
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <OnboardingButton title="Enable Smart Reminders" onPress={handleEnable} variant="primary" />
          <OnboardingButton title="Maybe later" onPress={handleLater} variant="ghost" />
        </View>
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 4: Calendar Integration (Screen 18) ==========
export const CalendarIntegrationScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();

  const handleSkip = () => {
    updateData({ calendarIntegrated: false });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Breaks that respect your calendar" subtitle="Auto-pause during meetings" emoji="📅" />

        <View style={styles.content}>
          <SelectionCard title="Google Calendar" icon="📧" onPress={() => {}} />
          <SelectionCard title="Outlook/Office 365" icon="📨" onPress={() => {}} />
          <SelectionCard title="Apple Calendar" icon="📆" onPress={() => {}} />
        </View>

        <OnboardingButton title="Skip for now" onPress={handleSkip} variant="ghost" />
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 4: First Session (Screen 19) ==========
export const FirstSessionScreen: React.FC = () => {
  const { goToNextScreen, progress } = useOnboarding();

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Ready for your first focused session?" emoji="🚀" />

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.timerDisplay}>
            <Text style={styles.timerText}>25:00</Text>
            <Text style={[Typography.bodyLarge]}>Your first break in 25 minutes</Text>
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <OnboardingButton title="Start Working" onPress={goToNextScreen} variant="primary" />
          <OnboardingButton title="Explore first" onPress={goToNextScreen} variant="ghost" />
        </View>
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 5: Premium Pitch (Screen 20) ==========
export const PremiumPitchScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleTrial = () => {
    updateData({ trialStarted: true, selectedPlan: 'premium' });
    goToNextScreen();
  };

  const handleFree = () => {
    updateData({ selectedPlan: 'free' });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title="Your personalized plan is ready!" emoji="🎉" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.pricingCard, { backgroundColor: `${colors.brand.primary}15` }, Shadows.lg]}>
            <Text style={[styles.pricingTitle, Typography.displaySmall, { color: colors.brand.primary }]}>Premium</Text>
            <Text style={[styles.pricingPrice, Typography.headlineLarge, { color: colors.text.primary }]}>$4.99/month</Text>
            <Text style={[Typography.bodyMedium, { color: colors.text.secondary }]}>7-day free trial • Cancel anytime</Text>

            <View style={styles.featureList}>
              <Text style={[Typography.bodyMedium, { color: colors.text.primary }]}>✓ Unlimited breaks</Text>
              <Text style={[Typography.bodyMedium, { color: colors.text.primary }]}>✓ 200+ exercises</Text>
              <Text style={[Typography.bodyMedium, { color: colors.text.primary }]}>✓ AI coaching</Text>
              <Text style={[Typography.bodyMedium, { color: colors.text.primary }]}>✓ Advanced analytics</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.freeCard, { backgroundColor: colors.background.secondary }]}>
            <Text style={[Typography.labelLarge, { color: colors.text.primary }]}>Free Plan</Text>
            <Text style={[Typography.bodySmall, { color: colors.text.secondary }]}>3 breaks/day • 20 exercises</Text>
          </Animated.View>
        </ScrollView>

        <View style={styles.actions}>
          <OnboardingButton title="Start Free Trial" onPress={handleTrial} variant="primary" />
          <OnboardingButton title="Continue with Free" onPress={handleFree} variant="ghost" />
        </View>
      </View>
    </OnboardingContainer>
  );
};

// ========== Phase 5: Completion (Screen 21) ==========
export const CompletionScreen: React.FC = () => {
  const { completeOnboarding, progress } = useOnboarding();
  const { useRouter } = require('expo-router');
  const router = useRouter();

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <View style={styles.celebrationContainer}>
          <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.celebrationEmoji}>
            🎉
          </Animated.Text>
          <ScreenHeader title="You're all set!" subtitle="Your health journey starts now" />

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={[Typography.bodyMedium]}>First break in</Text>
              <Text style={[Typography.headlineMedium]}>25 min</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={[Typography.bodyMedium]}>Weekly goal</Text>
              <Text style={[Typography.headlineMedium]}>10 breaks</Text>
            </View>
          </Animated.View>
        </View>

        <OnboardingButton title="Go to Dashboard" onPress={handleFinish} variant="primary" />
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  // Ergonomic Setup
  scoreCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreText: {
    marginBottom: 4,
  },
  scoreLabel: {},
  checklistItems: {
    gap: Spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  checklistLabel: {},
  // AI Recommendation
  planCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
  },
  matchText: {
    marginBottom: Spacing.lg,
  },
  planDetails: {
    width: '100%',
    gap: Spacing.md,
  },
  planRow: {
    gap: Spacing.xs,
  },
  // Live Demo
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  demoEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  demoText: {
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  emojiButton: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emojiFeedback: {
    fontSize: 48,
  },
  // Value Display
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  benefitEmoji: {
    fontSize: 32,
  },
  socialCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    marginTop: Spacing.lg,
  },
  // Education
  factCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  factEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  factTitle: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  factText: {
    textAlign: 'center',
  },
  // Timer Config & First Session
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  // Notification Permission
  permissionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  permissionTitle: {},
  trustBadge: {
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  // Premium Pitch
  pricingCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pricingTitle: {
    marginBottom: Spacing.xs,
  },
  pricingPrice: {
    marginBottom: Spacing.xs,
  },
  featureList: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
    alignSelf: 'stretch',
  },
  freeCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  // Completion
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 100,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statEmoji: {
    fontSize: 32,
  },
});
