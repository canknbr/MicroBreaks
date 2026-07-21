/**
 * WheelSelect — a subtle picker wheel in the editorial type language.
 *
 * Options scroll vertically; the centered option is the selection (full white,
 * full size), neighbours fade + shrink with distance. Snaps to center. A single
 * thin pink accent bar marks the center. No boxes / borders / chrome.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

export interface WheelOption {
  id: string;
  label: string;
}

interface WheelSelectProps {
  options: WheelOption[];
  value: string | null;
  onChange: (id: string) => void;
  itemHeight?: number;
  visibleCount?: number;
}

function WheelItem({
  label,
  index,
  scrollY,
  itemHeight,
  onPress,
}: {
  label: string;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const dist = index * itemHeight - scrollY.value;
    const scale = interpolate(
      dist,
      [-2 * itemHeight, -itemHeight, 0, itemHeight, 2 * itemHeight],
      [0.7, 0.86, 1, 0.86, 0.7],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      dist,
      [-2 * itemHeight, -itemHeight, 0, itemHeight, 2 * itemHeight],
      [0.18, 0.45, 1, 0.45, 0.18],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[{ height: itemHeight }, styles.item, style]}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function WheelSelect({
  options,
  value,
  onChange,
  itemHeight = 58,
  visibleCount = 5,
}: WheelSelectProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const containerHeight = itemHeight * visibleCount;
  const padV = (containerHeight - itemHeight) / 2;

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value)
  );

  useEffect(() => {
    // Position on the current value without animation on mount.
    const y = selectedIndex * itemHeight;
    const t = setTimeout(() => scrollRef.current?.scrollTo({ y, animated: false }), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (offsetY: number) => {
    const idx = Math.max(0, Math.min(options.length - 1, Math.round(offsetY / itemHeight)));
    const next = options[idx];
    if (next && next.id !== value) {
      Haptics.selectionAsync();
      onChange(next.id);
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    commit(e.nativeEvent.contentOffset.y);
  };

  return (
    <View style={{ height: containerHeight }}>
      {/* Fixed center accent */}
      <View pointerEvents="none" style={[styles.centerBand, { top: padV, height: itemHeight }]}>
        <View style={styles.bar} />
      </View>

      <Animated.ScrollView
        ref={scrollRef as any}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{ paddingVertical: padV }}
      >
        {options.map((o, i) => (
          <WheelItem
            key={o.id}
            label={o.label}
            index={i}
            scrollY={scrollY}
            itemHeight={itemHeight}
            onPress={() => scrollRef.current?.scrollTo({ y: i * itemHeight, animated: true })}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    justifyContent: 'center',
    paddingLeft: 34,
  },
  label: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 27,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  centerBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
});
