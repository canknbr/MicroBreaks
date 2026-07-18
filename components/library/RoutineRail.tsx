/**
 * Routine Rail
 * Horizontal rail of user-authored custom routines (Pro). Tapping a routine
 * plays it as a chained session; the pencil edits it. Free users see a
 * locked teaser card routing to the paywall.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';
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
  const cardBackground = theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="albums" size={15} color={theme.accent.tertiary} />
        <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      </View>
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
            styles.teaserCard,
            {
              backgroundColor: cardBackground,
              borderColor: `${theme.accent.tertiary}45`,
              opacity: pressed ? 0.85 : 1,
              ...cardShadow(theme.isDark, { height: 1, opacity: 0.07, radius: 5, elevation: 2 }),
            },
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
          <Ionicons name="chevron-forward" size={16} color={theme.text.muted} />
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
              {
                borderColor: `${theme.accent.tertiary}60`,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="add" size={22} color={theme.accent.tertiary} />
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
                  style={({ pressed }) => [
                    styles.routineCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: `${theme.accent.tertiary}35`,
                      opacity: pressed ? 0.85 : 1,
                      ...cardShadow(theme.isDark, { height: 2, opacity: 0.08, radius: 6, elevation: 3 }),
                    },
                  ]}
                >
                  <View style={styles.routineTopRow}>
                    <Ionicons name="play-circle" size={20} color={theme.accent.tertiary} />
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        onPressEdit(routine);
                      }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={routine.name}
                    >
                      <Ionicons name="pencil" size={15} color={theme.text.muted} />
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
    marginTop: 14,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  rail: {
    gap: 10,
    paddingRight: 16,
    alignItems: 'stretch',
  },
  newCard: {
    width: 108,
    minHeight: 108,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  newCardText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyHintWrap: {
    justifyContent: 'center',
    maxWidth: 200,
  },
  emptyHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  routineCard: {
    width: 150,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  routineTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 36,
  },
  routineMeta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  teaserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  teaserText: {
    flex: 1,
  },
  teaserTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  teaserSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
