/**
 * Today's Plan Rail — editorial. A titled horizontal rail of the three daily
 * suggested moves (deterministic per day). GIF thumb + type, no card chrome /
 * number badges / emoji fallback.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
import type { LibraryExerciseRecord } from '@/features/exercise-library/types';
import {
  getLibraryMedia,
  localizedName,
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
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.text.muted }]}>{subtitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {plan.map((record, index) => {
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
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.thumbWrap}>
                {media ? (
                  <Image
                    source={media.thumb}
                    style={styles.thumb}
                    contentFit="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Text style={styles.thumbFallback}>{name.charAt(0)}</Text>
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
    marginBottom: 20,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  rail: {
    gap: 18,
    paddingRight: 16,
  },
  card: {
    width: 120,
  },
  thumbWrap: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumb: {
    width: 112,
    height: 112,
  },
  thumbFallback: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 40,
    color: '#0B0A0D',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 14,
    letterSpacing: -0.2,
    lineHeight: 18,
    minHeight: 36,
  },
  meta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});
