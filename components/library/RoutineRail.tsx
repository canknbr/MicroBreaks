/**
 * Routine Rail — editorial. User-authored custom routines (Pro): flat routine
 * cards with a play/edit affordance, a dashed "new" tile, and a hairline
 * locked teaser band for free users. No card chrome / section-header icons.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
import type { CustomRoutine } from '@/store/routinesStore';
import { estimateChainedSeconds } from '@/features/exercise-library/chaining';
import { getRoutineMembers } from '@/features/exercise-library/customRoutines';

interface RoutineRailProps {
  title: string;
  subtitle: string;
  newLabel: string;
  emptyHint: string;
  moveCountLabel: (_count: number) => string;
  teaser: { title: string; subtitle: string } | null;
  routines: readonly CustomRoutine[];
  theme: ThemeColors;
  onPressNew: () => void;
  onPressPlay: (_routine: CustomRoutine) => void;
  onPressEdit: (_routine: CustomRoutine) => void;
  onPressTeaser: () => void;
}

export function RoutineRail({
  title,
  subtitle,
  newLabel,
  emptyHint,
  moveCountLabel,
  teaser,
  routines,
  theme,
  onPressNew,
  onPressPlay,
  onPressEdit,
  onPressTeaser,
}: RoutineRailProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.text.muted }]}>{subtitle}</Text>

      {teaser ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPressTeaser();
          }}
          accessibilityRole="button"
          accessibilityLabel={`${teaser.title}. ${teaser.subtitle}`}
          style={({ pressed }) => [
            styles.teaserBand,
            { borderColor: theme.border.subtle, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="lock-closed" size={18} color={theme.accent.tertiary} />
          <View style={styles.teaserText}>
            <Text style={[styles.teaserTitle, { color: theme.text.primary }]}>
              {teaser.title}
            </Text>
            <Text style={[styles.teaserSubtitle, { color: theme.text.muted }]}>
              {teaser.subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.text.muted} />
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPressNew();
            }}
            accessibilityRole="button"
            accessibilityLabel={newLabel}
            style={({ pressed }) => [
              styles.newCard,
              { borderColor: `${theme.accent.tertiary}55`, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="add" size={24} color={theme.accent.tertiary} />
            <Text style={[styles.newCardText, { color: theme.accent.tertiary }]}>
              {newLabel}
            </Text>
          </Pressable>

          {routines.length === 0 ? (
            <View style={styles.emptyHintWrap}>
              <Text style={[styles.emptyHint, { color: theme.text.muted }]}>
                {emptyHint}
              </Text>
            </View>
          ) : (
            routines.map((routine) => {
              const members = getRoutineMembers(routine);
              const minutes = Math.max(
                1,
                Math.round(estimateChainedSeconds(members) / 60)
              );
              return (
                <Pressable
                  key={routine.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onPressPlay(routine);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${routine.name}. ${moveCountLabel(members.length)}, ${minutes}m`}
                  style={({ pressed }) => [styles.routineCard, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={styles.routineTopRow}>
                    <Ionicons name="play-circle" size={26} color={theme.accent.tertiary} />
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        onPressEdit(routine);
                      }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={routine.name}
                    >
                      <Ionicons name="pencil" size={16} color={theme.text.muted} />
                    </Pressable>
                  </View>
                  <Text
                    style={[styles.routineName, { color: theme.text.primary }]}
                    numberOfLines={2}
                  >
                    {routine.name}
                  </Text>
                  <Text style={[styles.routineMeta, { color: theme.text.muted }]}>
                    {moveCountLabel(members.length)} · ~{minutes}m
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  rail: {
    gap: 24,
    paddingRight: 16,
    alignItems: 'stretch',
  },
  newCard: {
    width: 120,
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  newCardText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyHintWrap: {
    justifyContent: 'center',
    maxWidth: 200,
  },
  emptyHint: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  routineCard: {
    width: 150,
    justifyContent: 'flex-start',
  },
  routineTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routineName: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 15,
    letterSpacing: -0.2,
    lineHeight: 19,
    minHeight: 38,
  },
  routineMeta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
    marginTop: 8,
  },
  teaserBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  teaserText: {
    flex: 1,
  },
  teaserTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  teaserSubtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    marginTop: 3,
  },
});
