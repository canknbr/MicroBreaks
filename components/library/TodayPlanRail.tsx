/**
 * Today's Plan Rail
 * Horizontal rail of the three daily suggested moves. Deterministic per
 * day (see features/exercise-library/suggestions.ts); tapping opens the
 * movement detail.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';
import type { LibraryExerciseRecord } from '@/features/exercise-library/types';
import {
  getLibraryMedia,
  localizedName,
  zoneMetaForRecord,
  type LibraryLocale,
} from '@/features/exercise-library/catalog';
import { estimateSessionSeconds } from '@/features/exercise-library/session';

interface TodayPlanRailProps {
  title: string;
  subtitle: string;
  plan: readonly LibraryExerciseRecord[];
  locale: LibraryLocale;
  theme: ThemeColors;
  isLocked: (_id: string) => boolean;
  onPressMove: (_record: LibraryExerciseRecord) => void;
}

export function TodayPlanRail({
  title,
  subtitle,
  plan,
  locale,
  theme,
  isLocked,
  onPressMove,
}: TodayPlanRailProps) {
  if (plan.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={15} color={theme.accent.primary} />
        <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      </View>
      <Text style={[styles.subtitle, { color: theme.text.muted }]}>{subtitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {plan.map((record, index) => {
          const zone = zoneMetaForRecord(record);
          const media = getLibraryMedia(record);
          const name = localizedName(record, locale);
          const minutes = Math.max(1, Math.round(estimateSessionSeconds(record) / 60));
          const locked = isLocked(record.id);

          return (
            <Pressable
              key={record.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPressMove(record);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${title} ${index + 1}: ${name}, ${minutes}m`}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(25, 25, 35, 0.9)'
                    : theme.background.card,
                  borderColor: `${zone.color}35`,
                  opacity: pressed ? 0.85 : 1,
                  ...cardShadow(theme.isDark, {
                    height: 2,
                    opacity: 0.08,
                    radius: 6,
                    elevation: 3,
                  }),
                },
              ]}
            >
              <View style={[styles.badge, { backgroundColor: zone.color }]}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>
              <View style={styles.thumbWrap}>
                {media ? (
                  <Image
                    source={media.thumb}
                    style={styles.thumb}
                    contentFit="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Text style={styles.thumbFallback}>{zone.icon}</Text>
                )}
                {locked && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text
                style={[styles.name, { color: theme.text.primary }]}
                numberOfLines={2}
              >
                {name}
              </Text>
              <Text style={[styles.meta, { color: theme.text.muted }]}>{minutes}m</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
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
  },
  card: {
    width: 128,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  thumb: {
    width: 60,
    height: 60,
  },
  thumbFallback: {
    fontSize: 26,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
    minHeight: 34,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
