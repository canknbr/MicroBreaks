/**
 * Routine Builder Screen (Pro)
 * Create or edit a custom routine: name it, pick 2–8 library moves, and
 * order them. Saved routines play as one chained session from the library.
 */

import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';
import { analytics } from '@/services/analytics';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';
import { tierIncludes } from '@/services/subscription/tiers';
import { ScreenErrorBoundary } from '@/components/error';
import { SearchBar } from '@/components/breaks/SearchBar';
import {
  ROUTINE_MAX_MOVES,
  ROUTINE_MIN_MOVES,
  ROUTINE_NAME_MAX_LENGTH,
  useRoutinesStore,
} from '@/store/routinesStore';
import {
  filterLibraryExercises,
  getLibraryExerciseRecord,
  getLibraryMedia,
  localizedName,
  toLibraryLocale,
  zoneMetaForRecord,
} from '@/features/exercise-library/catalog';
import { estimateChainedSeconds } from '@/features/exercise-library/chaining';
import type { LibraryExerciseRecord } from '@/features/exercise-library/types';

function RoutineBuilderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useTranslation();
  const locale = toLibraryLocale(language);

  const { routineId } = useLocalSearchParams<{ routineId?: string | string[] }>();
  const resolvedRoutineId = Array.isArray(routineId) ? routineId[0] : routineId;

  const routines = useRoutinesStore((state) => state.routines);
  const createRoutine = useRoutinesStore((state) => state.createRoutine);
  const updateRoutine = useRoutinesStore((state) => state.updateRoutine);
  const deleteRoutine = useRoutinesStore((state) => state.deleteRoutine);

  const editingRoutine = useMemo(
    () => routines.find((routine) => routine.id === resolvedRoutineId) ?? null,
    [routines, resolvedRoutineId]
  );
  const isEditing = editingRoutine !== null;

  const [name, setName] = useState(() => editingRoutine?.name ?? '');
  const [moveIds, setMoveIds] = useState<string[]>(
    () => editingRoutine?.moveIds ?? []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Defense in depth: routines are a Pro surface; bounce free users to the
  // paywall even if they deep-link here.
  const { tier, loaded: tierLoaded } = useEffectiveTier();
  const hasAccess = !tierLoaded || tierIncludes(tier, 'full_break_library');
  React.useEffect(() => {
    if (tierLoaded && !tierIncludes(tier, 'full_break_library')) {
      router.replace(
        ({ pathname: '/subscription', params: { placement: 'library' } } as never)
      );
    }
  }, [router, tier, tierLoaded]);

  const selectedRecords = useMemo(
    () =>
      moveIds
        .map((id) => getLibraryExerciseRecord(id))
        .filter((record): record is LibraryExerciseRecord => record != null),
    [moveIds]
  );

  const pickerRecords = useMemo(
    () => filterLibraryExercises({ query: deferredQuery }),
    [deferredQuery]
  );

  const minutes = useMemo(
    () =>
      selectedRecords.length > 0
        ? Math.max(1, Math.round(estimateChainedSeconds(selectedRecords) / 60))
        : 0,
    [selectedRecords]
  );

  const isValid =
    name.trim().length > 0 &&
    moveIds.length >= ROUTINE_MIN_MOVES &&
    moveIds.length <= ROUTINE_MAX_MOVES;

  const toggleMove = useCallback((id: string) => {
    Haptics.selectionAsync();
    setMoveIds((current) => {
      if (current.includes(id)) {
        return current.filter((moveId) => moveId !== id);
      }
      if (current.length >= ROUTINE_MAX_MOVES) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return current;
      }
      return [...current, id];
    });
  }, []);

  const moveBy = useCallback((id: string, delta: -1 | 1) => {
    Haptics.selectionAsync();
    setMoveIds((current) => {
      const index = current.indexOf(id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = current.slice();
      next[index] = current[target];
      next[target] = current[index];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const saved = isEditing
      ? updateRoutine(editingRoutine.id, { name, moveIds })
      : createRoutine(name, moveIds) !== null;
    if (saved) {
      analytics.track('routine_saved', {
        move_count: moveIds.length,
        is_edit: isEditing,
      });
      router.back();
    }
  }, [createRoutine, editingRoutine, isEditing, isValid, moveIds, name, router, updateRoutine]);

  const handleDelete = useCallback(() => {
    if (!editingRoutine) return;
    Alert.alert(
      t('library.routines.deleteConfirmTitle'),
      t('library.routines.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('library.routines.delete'),
          style: 'destructive',
          onPress: () => {
            deleteRoutine(editingRoutine.id);
            router.back();
          },
        },
      ]
    );
  }, [deleteRoutine, editingRoutine, router, t]);

  const renderPickerRow = useCallback(
    ({ item }: { item: LibraryExerciseRecord }) => {
      const zone = zoneMetaForRecord(item);
      const media = getLibraryMedia(item);
      const selected = moveIds.includes(item.id);
      const displayName = localizedName(item, locale);
      return (
        <Pressable
          onPress={() => toggleMove(item.id)}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={displayName}
          style={[
            styles.pickerRow,
            {
              backgroundColor: selected
                ? `${theme.accent.tertiary}14`
                : theme.isDark
                  ? 'rgba(25, 25, 35, 0.9)'
                  : theme.background.card,
              borderColor: selected ? `${theme.accent.tertiary}60` : theme.border.subtle,
            },
          ]}
        >
          <View style={styles.pickerThumbWrap}>
            {media ? (
              <Image
                source={media.thumb}
                style={styles.pickerThumb}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <Text style={styles.pickerThumbFallback}>{zone.icon}</Text>
            )}
          </View>
          <Text
            style={[styles.pickerName, { color: theme.text.primary }]}
            numberOfLines={2}
          >
            {displayName}
          </Text>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'add-circle-outline'}
            size={22}
            color={selected ? theme.accent.tertiary : theme.text.muted}
          />
        </Pressable>
      );
    },
    [locale, moveIds, theme, toggleMove]
  );

  const listHeader = (
    <View>
      {/* Name */}
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('library.routines.namePlaceholder')}
        placeholderTextColor={theme.text.muted}
        maxLength={ROUTINE_NAME_MAX_LENGTH}
        style={[
          styles.nameInput,
          {
            color: theme.text.primary,
            backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card,
            borderColor: theme.border.subtle,
          },
        ]}
        accessibilityLabel={t('library.routines.namePlaceholder')}
      />

      {/* Selected moves */}
      <View style={styles.selectedHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          {t('library.routines.selectedTitle')}
        </Text>
        <Text style={[styles.selectedMeta, { color: isValid ? theme.accent.primary : theme.text.muted }]}>
          {moveIds.length}/{ROUTINE_MAX_MOVES}
          {minutes > 0 ? ` · ~${minutes}m` : ''}
        </Text>
      </View>
      <Text style={[styles.limitHint, { color: theme.text.muted }]}>
        {t('library.routines.limitHint', {
          min: ROUTINE_MIN_MOVES,
          max: ROUTINE_MAX_MOVES,
        })}
      </Text>

      {selectedRecords.map((record, index) => {
        const zone = zoneMetaForRecord(record);
        const media = getLibraryMedia(record);
        return (
          <View
            key={record.id}
            style={[
              styles.selectedRow,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(25, 25, 35, 0.9)'
                  : theme.background.card,
                borderColor: `${zone.color}35`,
              },
            ]}
          >
            <Text style={[styles.selectedIndex, { color: zone.color }]}>
              {index + 1}
            </Text>
            <View style={styles.pickerThumbWrap}>
              {media ? (
                <Image
                  source={media.thumb}
                  style={styles.pickerThumb}
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.pickerThumbFallback}>{zone.icon}</Text>
              )}
            </View>
            <Text
              style={[styles.pickerName, { color: theme.text.primary }]}
              numberOfLines={2}
            >
              {localizedName(record, locale)}
            </Text>
            <View style={styles.selectedActions}>
              <Pressable
                onPress={() => moveBy(record.id, -1)}
                disabled={index === 0}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('library.routines.moveUp')}
                style={{ opacity: index === 0 ? 0.3 : 1 }}
              >
                <Ionicons name="chevron-up" size={18} color={theme.text.secondary} />
              </Pressable>
              <Pressable
                onPress={() => moveBy(record.id, 1)}
                disabled={index === selectedRecords.length - 1}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('library.routines.moveDown')}
                style={{ opacity: index === selectedRecords.length - 1 ? 0.3 : 1 }}
              >
                <Ionicons name="chevron-down" size={18} color={theme.text.secondary} />
              </Pressable>
              <Pressable
                onPress={() => toggleMove(record.id)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('library.routines.remove')}
              >
                <Ionicons name="close-circle" size={18} color={theme.text.muted} />
              </Pressable>
            </View>
          </View>
        );
      })}

      {/* Picker header */}
      <Text style={[styles.sectionTitle, styles.pickerTitle, { color: theme.text.primary }]}>
        {t('library.routines.pickerTitle')}
      </Text>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        theme={theme}
        placeholder={t('library.searchPlaceholder')}
      />
      <View style={styles.pickerSpacer} />
    </View>
  );

  if (!hasAccess) {
    return <View style={[styles.container, { backgroundColor: theme.background.primary }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.headerButton,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={theme.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {isEditing
              ? t('library.routines.editTitle')
              : t('library.routines.createTitle')}
          </Text>
          {isEditing ? (
            <Pressable
              onPress={handleDelete}
              style={[
                styles.headerButton,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(255,107,107,0.12)'
                    : 'rgba(255,59,48,0.08)',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('library.routines.delete')}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={18} color={theme.accent.error} />
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>

        {/* Content */}
        <FlashList
          data={pickerRecords}
          renderItem={renderPickerRow}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          extraData={moveIds}
        />

        {/* Save */}
        <Pressable
          onPress={handleSave}
          disabled={!isValid}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid }}
          accessibilityLabel={t('library.routines.save')}
          style={[
            styles.saveButton,
            {
              backgroundColor: isValid
                ? theme.accent.tertiary
                : theme.isDark
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(0,0,0,0.10)',
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={18}
            color={isValid ? '#000000' : theme.text.muted}
          />
          <Text
            style={[
              styles.saveButtonText,
              { color: isValid ? '#000000' : theme.text.muted },
            ]}
          >
            {t('library.routines.save')}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 16,
  },
  nameInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectedMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  limitHint: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  selectedIndex: {
    fontSize: 13,
    fontWeight: '800',
    width: 18,
    textAlign: 'center',
  },
  selectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pickerSpacer: {
    height: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  pickerThumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerThumb: {
    width: 40,
    height: 40,
  },
  pickerThumbFallback: {
    fontSize: 20,
  },
  pickerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default function RoutineBuilderWithErrorBoundary() {
  return (
    <ScreenErrorBoundary screenName="RoutineBuilder">
      <RoutineBuilderScreen />
    </ScreenErrorBoundary>
  );
}
