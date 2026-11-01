// src/modules/StatsOverview.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';

export const StatsOverview = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {stats, profile} = useTasks();

  const firstName = (profile.name || 'Friend').split(' ')[0];
  const calculatedXP = stats.completed * 25 + stats.streak * 50;

  return (
    <View style={styles.container}>
      {/* Elevate Top Metric Chips Row */}
      <View style={styles.topChipsRow}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#2D2305' : '#FEF3C7',
              borderColor: isDark ? '#78350F' : '#FDE68A',
              borderBottomColor: isDark ? '#451A03' : '#F59E0B',
            },
          ]}>
          <Text style={styles.chipEmoji}>🔥</Text>
          <Text
            style={[
              styles.chipText,
              {color: isDark ? '#FBBF24' : '#B45309'},
            ]}>
            {stats.streak}d Streak
          </Text>
        </View>

        <View
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#1E1B4B' : '#FEF9C3',
              borderColor: isDark ? '#3730A3' : '#FEF08A',
              borderBottomColor: isDark ? '#1E1B4B' : '#EAB308',
            },
          ]}>
          <Text style={styles.chipEmoji}>⭐</Text>
          <Text
            style={[
              styles.chipText,
              {color: isDark ? '#A5B4FC' : '#A16207'},
            ]}>
            {calculatedXP} XP
          </Text>
        </View>

        <View
          style={[
            styles.chip,
            {
              backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
              borderColor: isDark ? '#065F46' : '#BBF7D0',
              borderBottomColor: isDark ? '#022C22' : '#22C55E',
            },
          ]}>
          <Text style={styles.chipEmoji}>🛡️</Text>
          <Text
            style={[
              styles.chipText,
              {color: isDark ? '#34D399' : '#15803D'},
            ]}>
            Emerald
          </Text>
        </View>
      </View>

      {/* Elevate Sky Blue 3D Tactile Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#0369A1' : '#00A3FF',
            borderBottomColor: isDark ? '#075985' : '#0082CC',
          },
        ]}>
        {/* Top Label */}
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>RECOMMENDED</Text>
          </View>
          <Text style={styles.heroGreeting}>Hi, {firstName} 👋</Text>
        </View>

        <Text style={styles.heroTitle}>Daily Focus Journey</Text>
        <Text style={styles.heroSubtitle}>
          {stats.pending > 0
            ? `${stats.completed} of ${stats.total} tasks completed • ${stats.completionRate}% finished`
            : '✨ You crushed all daily objectives! Outstanding focus.'}
        </Text>

        {/* Elevate Thick Cyan/Mint Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {width: `${Math.max(stats.completionRate, 6)}%`},
            ]}
          />
        </View>

        {/* Tactile White 3D Resume Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Resume Daily Focus"
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Focus')}
          style={styles.resumeButton}>
          <Text style={styles.resumeButtonText}>Start Focus Session</Text>
          <Feather name="arrow-right" size={16} color="#00A3FF" />
        </TouchableOpacity>

        {/* Sub-Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{stats.total}</Text>
            <Text style={styles.metricLabel}>Total Tasks</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, {color: '#FFFFFF'}]}>
              {stats.completed}
            </Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, {color: '#FEF08A'}]}>
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  topChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.2,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomWidth: 5, // Elevate signature 3D bottom bevel
    shadowColor: '#0082CC',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroGreeting: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34D399', // Bright emerald mint
    borderRadius: 5,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    marginBottom: 16,
  },
  resumeButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
    marginRight: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default StatsOverview;
