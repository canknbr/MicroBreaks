/**
 * Stats Screen Skeleton
 * Loading placeholder for the stats screen
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { useTheme } from '@/hooks/useTheme';

export function StatsSkeleton() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Period Selector Skeleton */}
      <View style={styles.periodSelector}>
        <SkeletonBox width={80} height={36} borderRadius={18} delay={0} />
        <SkeletonBox width={80} height={36} borderRadius={18} delay={50} />
        <SkeletonBox width={80} height={36} borderRadius={18} delay={100} />
      </View>

      {/* Stats Cards Skeleton */}
      <View style={styles.statsGrid}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.background.card,
              },
            ]}
          >
            <SkeletonBox width={40} height={40} borderRadius={12} delay={150 + index * 50} />
            <SkeletonBox width="60%" height={24} delay={200 + index * 50} style={styles.statValue} />
            <SkeletonBox width="80%" height={14} delay={250 + index * 50} />
          </View>
        ))}
      </View>

      {/* Chart Skeleton */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.background.card,
          },
        ]}
      >
        <SkeletonBox width={120} height={20} delay={300} style={styles.chartTitle} />
        <View style={styles.chartBars}>
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <SkeletonBox
              key={index}
              width={24}
              height={60 + Math.random() * 60}
              borderRadius={8}
              delay={350 + index * 30}
            />
          ))}
        </View>
      </View>

      {/* Category Distribution Skeleton */}
      <View
        style={[
          styles.distributionCard,
          {
            backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.background.card,
          },
        ]}
      >
        <SkeletonBox width={160} height={20} delay={500} style={styles.sectionTitle} />
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={styles.distributionRow}>
            <SkeletonBox width={40} height={40} borderRadius={20} delay={550 + index * 50} />
            <View style={styles.distributionInfo}>
              <SkeletonBox width="50%" height={16} delay={575 + index * 50} />
              <SkeletonBox width="30%" height={12} delay={600 + index * 50} style={styles.distributionValue} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  statValue: {
    marginTop: 12,
    marginBottom: 4,
  },
  chartCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  chartTitle: {
    marginBottom: 20,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
  },
  distributionCard: {
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  distributionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  distributionValue: {
    marginTop: 4,
  },
});

export default StatsSkeleton;
