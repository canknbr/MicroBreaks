/**
 * Streak Buddies Screen
 *
 * Surfaces the existing `services/buddies` engine. The current
 * implementation is intentionally minimal:
 *
 *   - Own snapshot — what the user would publish today.
 *   - Invite code — generate / copy a code to share.
 *   - Accept code — type a buddy's code; stored as pending until the
 *     sync layer back-fills the actual relationship.
 *   - Buddy list — empty by default; populated by the future
 *     Firestore sync.
 *
 * Built so the engine has a touchpoint *now* and the sync layer can
 * graft onto the same store without UI churn.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme';
import {
  buildBuddySnapshot,
  describeBuddyState,
  sortBuddiesForDisplay,
} from '@/services/buddies/snapshot';
import { MAX_BUDDIES } from '@/services/buddies/types';
import { getBreakHistory, getStreakData } from '@/services/breakHistory';
import type { BuddyStreakSnapshot } from '@/services/buddies/types';
import { useBuddiesStore } from '@/store/buddiesStore';

export default function BuddiesScreen() {
  const theme = useTheme();
  const ownCode = useBuddiesStore((s) => s.ownCode);
  const pendingCodes = useBuddiesStore((s) => s.pendingAcceptedCodes);
  const buddies = useBuddiesStore((s) => s.buddies);
  const refreshOwnCode = useBuddiesStore((s) => s.refreshOwnCode);
  const acceptCode = useBuddiesStore((s) => s.acceptCode);
  const dropPendingCode = useBuddiesStore((s) => s.dropPendingCode);

  const [snapshot, setSnapshot] = useState<BuddyStreakSnapshot | null>(null);
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [history, streak] = await Promise.all([
        getBreakHistory(),
        getStreakData(),
      ]);
      if (cancelled) return;
      setSnapshot(
        buildBuddySnapshot({ now: new Date(), history, streak }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ensure the user always has an invite code visible.
  useEffect(() => {
    if (!ownCode) refreshOwnCode();
  }, [ownCode, refreshOwnCode]);

  const buddyEntries = useMemo(
    () =>
      sortBuddiesForDisplay(
        buddies.map((b) => ({ buddy: b, snapshot: null })),
      ),
    [buddies],
  );

  const onShareCode = async () => {
    if (!ownCode) return;
    try {
      await Share.share({
        message: `Be my Unwind streak buddy — pair with this code: ${ownCode}`,
      });
    } catch {
      Alert.alert(
        'Share failed',
        `You can read out the code instead: ${ownCode}`,
      );
    }
  };

  const onSubmitCode = () => {
    const trimmed = inputCode.trim();
    if (!trimmed) return;
    const accepted = acceptCode(trimmed);
    if (!accepted) {
      Alert.alert(
        'Invalid code',
        "That code doesn't look right, you've already added it, or you've hit the buddy limit.",
      );
      return;
    }
    setInputCode('');
    Alert.alert(
      'Saved',
      `We'll pair you with ${accepted} when their account syncs. You can leave the screen — the pairing will land automatically.`,
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[
              styles.backButton,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255,255,255,0.08)'
                  : theme.border.subtle,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text.primary} />
          </Pressable>
          <Text
            style={[styles.title, { color: theme.text.primary }]}
            accessibilityRole="header"
          >
            Streak Buddies
          </Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Quiet accountability with up to {MAX_BUDDIES} friends. We share
            today&apos;s break status and current streak — never categories,
            pain areas, or exact times.
          </Text>

          {/* Own snapshot */}
          <View
            style={[
              styles.card,
            ]}
            accessibilityRole="summary"
          >
            <Text style={[styles.cardLabel, { color: theme.text.muted }]}>
              YOU TODAY
            </Text>
            <Text
              style={[styles.cardValue, { color: theme.text.primary }]}
              accessibilityLabel={
                snapshot
                  ? `Current streak ${snapshot.currentStreak} days. ${describeBuddyState(snapshot)}`
                  : 'Loading your snapshot'
              }
            >
              {snapshot
                ? `${snapshot.currentStreak}-day streak`
                : 'Loading…'}
            </Text>
            <Text style={[styles.cardHint, { color: theme.text.secondary }]}>
              {snapshot ? describeBuddyState(snapshot) : ''}
            </Text>
          </View>

          {/* Invite code */}
          <View
            style={[
              styles.card,
            ]}
          >
            <Text style={[styles.cardLabel, { color: theme.text.muted }]}>
              YOUR INVITE CODE
            </Text>
            <Text
              style={[styles.bigCode, { color: theme.text.primary }]}
              accessibilityLabel={`Invite code ${ownCode ?? 'not yet generated'}`}
            >
              {ownCode ?? '······'}
            </Text>
            <View style={styles.rowActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share invite code"
                onPress={onShareCode}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.accent.primary },
                ]}
              >
                <Ionicons name="share-outline" size={16} color={theme.background.primary} />
                <Text
                  style={[styles.actionButtonText, { color: theme.background.primary }]}
                >
                  Share
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Regenerate invite code"
                onPress={() => {
                  Alert.alert(
                    'Regenerate code?',
                    'Your existing code will stop working. Anyone you already shared it with will need the new one.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Regenerate',
                        style: 'destructive',
                        onPress: () => refreshOwnCode(),
                      },
                    ],
                  );
                }}
                style={[
                  styles.actionButton,
                  styles.secondaryButton,
                  { borderColor: theme.border.subtle },
                ]}
              >
                <Ionicons name="refresh-outline" size={16} color={theme.text.primary} />
                <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                  New code
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Accept a code */}
          <View
            style={[
              styles.card,
            ]}
          >
            <Text style={[styles.cardLabel, { color: theme.text.muted }]}>
              ADD A BUDDY
            </Text>
            <TextInput
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
              autoCorrect={false}
              spellCheck={false}
              maxLength={10}
              placeholder="6-character code"
              placeholderTextColor={theme.text.muted}
              accessibilityLabel="Enter a buddy invite code"
              style={[
                styles.input,
                {
                  borderColor: theme.border.subtle,
                  color: theme.text.primary,
                },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pair with this code"
              onPress={onSubmitCode}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.accent.primary,
                  marginTop: Spacing.sm,
                },
              ]}
            >
              <Ionicons name="person-add-outline" size={16} color={theme.background.primary} />
              <Text
                style={[styles.actionButtonText, { color: theme.background.primary }]}
              >
                Pair
              </Text>
            </Pressable>
          </View>

          {/* Pending */}
          {pendingCodes.length > 0 && (
            <View
              style={[
                styles.card,
              ]}
            >
              <Text style={[styles.cardLabel, { color: theme.text.muted }]}>
                WAITING FOR SYNC
              </Text>
              {pendingCodes.map((code) => (
                <View key={code} style={styles.pendingRow}>
                  <Text style={[styles.pendingCode, { color: theme.text.primary }]}>
                    {code}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove pending code ${code}`}
                    onPress={() => dropPendingCode(code)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.text.muted}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Buddies list */}
          <View
            style={[
              styles.card,
            ]}
          >
            <Text style={[styles.cardLabel, { color: theme.text.muted }]}>
              YOUR BUDDIES ({buddies.length}/{MAX_BUDDIES})
            </Text>
            {buddyEntries.length === 0 ? (
              <Text style={[styles.empty, { color: theme.text.secondary }]}>
                No buddies yet. Share your code or enter a friend&apos;s code
                to pair.
              </Text>
            ) : (
              buddyEntries.map(({ buddy, snapshot: bs }) => (
                <View key={buddy.id} style={styles.buddyRow}>
                  <Text style={[styles.buddyAvatar, { color: theme.text.primary }]}>
                    {(buddy.displayName?.charAt(0) ?? '?').toUpperCase()}
                  </Text>
                  <View style={styles.buddyMeta}>
                    <Text style={[styles.buddyName, { color: theme.text.primary }]}>
                      {buddy.displayName}
                    </Text>
                    <Text style={[styles.buddyState, { color: theme.text.secondary }]}>
                      {describeBuddyState(bs)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: 'GeneralSans-Bold', fontSize: 20, letterSpacing: -0.4 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    marginBottom: 30,
  },
  cardLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  cardValue: { fontFamily: 'GeneralSans-Bold', fontSize: 26, letterSpacing: -0.6 },
  cardHint: { fontFamily: 'GeneralSans-Regular', fontSize: 14, marginTop: 5 },
  bigCode: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 34,
    letterSpacing: 8,
    marginVertical: Spacing.sm,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: { fontFamily: 'GeneralSans-Bold' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  pendingCode: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 16,
    letterSpacing: 2,
  },
  empty: { fontFamily: 'GeneralSans-Regular', fontSize: 14, lineHeight: 20, marginTop: 4 },
  buddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  buddyAvatar: { fontFamily: 'GeneralSans-Bold', fontSize: 22 },
  buddyMeta: { flex: 1 },
  buddyName: { fontFamily: 'GeneralSans-Semibold', fontSize: 16 },
  buddyState: { fontFamily: 'GeneralSans-Regular', fontSize: 13, marginTop: 3 },
});
