// src/modules/StatsOverview.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const StatsOverview = () => {
  const {theme, isDark} = useTheme();
  const {stats, profile} = useTasks();

  const firstName = (profile.name || 'Friend').split(' ')[0];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? theme.surface : '#1E40AF', // Deep Royal Blue hero card
          },
          theme.cardShadow,
        ]}>
        {/* Header Greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Hello, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>
              {stats.pending > 0
                ? `You have ${stats.pending} pending ${
                    stats.pending === 1 ? 'task' : 'tasks'
                  } today`
                : 'All caught up! Excellent work 🎉'}
            </Text>
          </View>

          {stats.streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {stats.streak}d streak</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressTitle}>Productivity Rate</Text>
            <Text style={styles.progressPercent}>{stats.completionRate}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {width: `${Math.max(stats.completionRate, 4)}%`},
              ]}
            />
          </View>
        </View>

        {/* 3 Metric Pills */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{stats.total}</Text>
            <Text style={styles.metricLabel}>Total Tasks</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, {color: '#34D399'}]}>
              {stats.completed}
            </Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, {color: '#FBBF24'}]}>
              {stats.pending}
            </Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_16,
  },
  card: {
    borderRadius: 24,
    padding: spacing.PADDING_18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.MARGIN_16,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
  },
  subGreeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 3,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  progressSection: {
    marginBottom: spacing.MARGIN_16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
  },
  progressPercent: {
    color: '#FFFFFF',
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  progressBarBackground: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34D399', // Emerald accent
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 10,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    color: '#FFFFFF',
    fontSize: textScale(17),
    fontFamily: fontFamily.bold,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: textScale(10),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default StatsOverview;
