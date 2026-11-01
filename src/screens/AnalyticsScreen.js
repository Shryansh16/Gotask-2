// src/screens/AnalyticsScreen.js
// Analytics, Progress & Motivation Dashboard (docs/PRD.md Phase 8 — P8.1 to P8.9)

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {useGoal} from '../context/GoalContext';
import {useHabit} from '../context/HabitContext';
import {usePlanning} from '../context/PlanningContext';
import {
  computeTaskMetrics,
  computeWeeklyActivity,
  computeHabitConsistency,
  computeGoalMetrics,
  computeTimeComparison,
  generateReviewSummary,
} from '../services/analyticsService';
import {
  evaluateAchievements,
  getMotivationalGreeting,
} from '../services/motivationService';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import ElevateTabBar from '../components/ElevateTabBar';

const EMPTY_ARRAY = [];

export const AnalyticsScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();

  const taskCtx = useTasks();
  const goalCtx = useGoal();
  const habitCtx = useHabit();
  const planningCtx = usePlanning();

  const tasks = taskCtx?.tasks || EMPTY_ARRAY;
  const goals = goalCtx?.goals || EMPTY_ARRAY;
  const habits = habitCtx?.habits || EMPTY_ARRAY;
  const focusSessions = planningCtx?.focusHistory || EMPTY_ARRAY;

  const [timeWindow, setTimeWindow] = useState('7d'); // '7d' | '30d' | 'all'
  const [showAchievements, setShowAchievements] = useState(true);

  // Filter tasks by selected time window
  const filteredTasks = useMemo(() => {
    if (timeWindow === 'all') {
      return tasks;
    }
    const now = Date.now();
    const daysLimit = timeWindow === '7d' ? 7 : 30;
    const cutoff = now - daysLimit * 24 * 3600000;
    return tasks.filter(t => {
      const timestamp = t.completedAt
        ? new Date(t.completedAt).getTime()
        : t.createdAt
        ? new Date(t.createdAt).getTime()
        : now;
      return timestamp >= cutoff;
    });
  }, [tasks, timeWindow]);

  const taskMetrics = useMemo(
    () => computeTaskMetrics(filteredTasks),
    [filteredTasks],
  );
  const weeklyActivity = useMemo(() => computeWeeklyActivity(tasks), [tasks]);
  const habitStats = useMemo(() => computeHabitConsistency(habits), [habits]);
  const goalStats = useMemo(() => computeGoalMetrics(goals), [goals]);
  const timeStats = useMemo(
    () => computeTimeComparison(tasks, focusSessions),
    [tasks, focusSessions],
  );
  const achievements = useMemo(
    () => evaluateAchievements({tasks, habits, goals, focusSessions}),
    [tasks, habits, goals, focusSessions],
  );
  const review = useMemo(
    () =>
      generateReviewSummary({
        tasks: filteredTasks,
        habits,
        goals,
        focusSessions,
      }),
    [filteredTasks, habits, goals, focusSessions],
  );

  const motivation = useMemo(() => {
    return getMotivationalGreeting({
      completedTasks: taskMetrics.completed,
      pendingTasks: taskMetrics.pending,
      streak: habitStats.longestStreak,
    });
  }, [taskMetrics, habitStats]);

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title="Analytics & Velocity"
        subtitle="Historical metrics, habits & achievement tracking"
        navigation={navigation}
        showBack={true}
      />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}>
        {/* Time Window Tabs */}
        <View style={styles.timeTabsRow}>
          {[
            {key: '7d', label: 'Last 7 Days'},
            {key: '30d', label: 'Last 30 Days'},
            {key: 'all', label: 'All Time'},
          ].map(tab => {
            const isSelected = timeWindow === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setTimeWindow(tab.key)}
                style={[
                  styles.timeTab,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected
                      ? theme.primary
                      : isDark ? '#334155' : '#E2E8F0',
                    borderBottomColor: isSelected
                      ? '#3730A3'
                      : isDark ? '#0F172A' : '#CBD5E1',
                  },
                ]}>
                <Text
                  style={[
                    styles.timeTabText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isSelected
                        ? fontFamily.bold
                        : fontFamily.medium,
                    },
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Motivational Greeting Hero */}
        <View
          style={[
            styles.heroCard,
            {backgroundColor: theme.primary},
            theme.cardShadow,
          ]}>
          <View style={styles.heroBadge}>
            <Feather name="trending-up" size={13} color="#FEF08A" style={{marginRight: 5}} />
            <Text style={styles.heroBadgeText}>PERFORMANCE PULSE</Text>
          </View>
          <Text style={styles.greetingTitle}>
            {motivation.title}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {motivation.subtitle}
          </Text>

          <View style={styles.statsSummaryRow}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryNumber}>
                {taskMetrics.completionRate}%
              </Text>
              <Text style={styles.summaryLabel}>
                Completion Rate
              </Text>
            </View>

            <View
              style={styles.summaryDivider}
            />

            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryNumber, {color: '#A7F3D0'}]}>
                {taskMetrics.completed}/{taskMetrics.total}
              </Text>
              <Text style={styles.summaryLabel}>
                Tasks Done
              </Text>
            </View>

            <View
              style={styles.summaryDivider}
            />

            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryNumber, {color: '#FEF08A'}]}>
                {timeStats.actualFocusMinutes}m
              </Text>
              <Text style={styles.summaryLabel}>
                Deep Focus
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity Bar Chart */}
        <View
          style={[
            styles.sectionCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            Weekly Completion Velocity
          </Text>
          <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
            Tasks completed per day of the week
          </Text>

          <View style={styles.chartContainer}>
            {weeklyActivity.days.map((item, idx) => {
              const heightPercent =
                weeklyActivity.maxCount > 0
                  ? Math.max(
                      12,
                      Math.round(
                        (item.completedCount / weeklyActivity.maxCount) * 100,
                      ),
                    )
                  : 12;
              const isPeak =
                item.day === weeklyActivity.peakDay && item.completedCount > 0;

              return (
                <View key={idx} style={styles.chartColumn}>
                  <Text
                    style={[styles.barValueText, {color: theme.textSecondary}]}>
                    {item.completedCount > 0 ? item.completedCount : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: isPeak
                            ? theme.primary
                            : `${theme.primary}50`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        color: isPeak ? theme.primary : theme.textSecondary,
                        fontFamily: isPeak
                          ? fontFamily.bold
                          : fontFamily.regular,
                      },
                    ]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Planned vs Actual Focus Time */}
        <View
          style={[
            styles.sectionCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            Planned vs. Actual Focus Time
          </Text>
          <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
            Compare estimated workload against logged focus sessions
          </Text>

          <View style={styles.timeCompareRow}>
            <View style={styles.timeBox}>
              <Text style={[styles.timeBoxVal, {color: theme.textPrimary}]}>
                {timeStats.plannedMinutes}m
              </Text>
              <Text style={[styles.timeBoxLabel, {color: theme.textSecondary}]}>
                Estimated Plan
              </Text>
            </View>

            <Text style={{fontSize: 16, color: theme.textSecondary}}>vs</Text>

            <View style={styles.timeBox}>
              <Text style={[styles.timeBoxVal, {color: theme.primary}]}>
                {timeStats.actualFocusMinutes}m
              </Text>
              <Text style={[styles.timeBoxLabel, {color: theme.textSecondary}]}>
                Actual Logged
              </Text>
            </View>
          </View>
        </View>

        {/* Category Workload Distribution */}
        {taskMetrics.categoryBreakdown.length > 0 && (
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}>
            <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
              Category Workload Distribution
            </Text>

            {taskMetrics.categoryBreakdown.map((cat, idx) => (
              <View key={idx} style={styles.categoryItemRow}>
                <View style={styles.categoryMetaRow}>
                  <Text
                    style={[styles.categoryName, {color: theme.textPrimary}]}>
                    {cat.category}
                  </Text>
                  <Text
                    style={[
                      styles.categoryPercent,
                      {color: theme.textSecondary},
                    ]}>
                    {cat.completed}/{cat.total} ({cat.rate}%)
                  </Text>
                </View>
                <View
                  style={[
                    styles.categoryProgressBar,
                    {backgroundColor: theme.surfaceSecondary},
                  ]}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${cat.rate}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Habits Consistency */}
        {habitStats.hasData && (
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}>
            <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
              Habits & Consistency
            </Text>
            <Text
              style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
              Peak streak: {habitStats.longestStreak} days • Average:{' '}
              {habitStats.averageStreak} days
            </Text>

            {habitStats.habitsList.map(h => (
              <View key={h.id} style={styles.habitRow}>
                <View style={{flex: 1}}>
                  <Text style={[styles.habitTitle, {color: theme.textPrimary}]}>
                    {h.title}
                  </Text>
                  <Text style={[styles.habitSub, {color: theme.textSecondary}]}>
                    Consistency: {h.consistencyRate}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.streakBadge,
                    {backgroundColor: theme.primaryLight},
                  ]}>
                  <Feather
                    name="zap"
                    size={11}
                    color={theme.primary}
                    style={{marginRight: 4}}
                  />
                  <Text
                    style={[styles.streakBadgeText, {color: theme.primary}]}>
                    {h.currentStreak}d
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Personal Milestones & Badges (P8.6, P8.8) */}
        {showAchievements && (
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}>
            <View style={styles.achieveHeaderRow}>
              <View style={{flex: 1}}>
                <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
                  Achievements & Milestones
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    {color: theme.textSecondary},
                  ]}>
                  Personal milestones unlocked through verified consistency
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAchievements(false)}
                accessibilityLabel="Hide Achievements"
                style={styles.toggleHideBtn}>
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: 11,
                  }}>
                  Hide
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgesGrid}>
              {achievements.map(badge => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    {
                      backgroundColor: badge.unlocked
                        ? `${theme.primary}12`
                        : theme.surfaceSecondary,
                      borderColor: badge.unlocked
                        ? theme.primary
                        : theme.border,
                      opacity: badge.unlocked ? 1 : 0.6,
                    },
                  ]}>
                  <Feather
                    name={badge.unlocked ? 'award' : 'lock'}
                    size={20}
                    color={badge.unlocked ? theme.primary : theme.textMuted}
                    style={{marginBottom: 6}}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.badgeTitle, {color: theme.textPrimary}]}>
                    {badge.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.badgeDesc, {color: theme.textSecondary}]}>
                    {badge.description}
                  </Text>
                  {badge.unlocked ? (
                    <Text style={[styles.badgeStatus, {color: theme.primary}]}>
                      Unlocked
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.badgeStatus,
                        {color: theme.textSecondary},
                      ]}>
                      {badge.percent}%
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Narrative Review */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              marginBottom: spacing.large,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            Analytical Review
          </Text>
          {review.highlights.map((item, idx) => (
            <View key={idx} style={styles.highlightBulletRow}>
              <Text
                style={{color: theme.primary, fontSize: 14, marginRight: 8}}>
                •
              </Text>
              <Text
                style={[styles.highlightText, {color: theme.textSecondary}]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="quests" navigation={navigation} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: spacing.medium,
    paddingBottom: 130, // Clearance for navigation
  },
  timeTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeTab: {
    flex: 1,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  timeTabText: {
    fontSize: 12,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 5, // Elevate 3D bevel
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: spacing.medium,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionCard: {
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    borderRadius: 20,
    padding: spacing.medium,
    marginBottom: 16,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginBottom: spacing.medium,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barValueText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    marginBottom: 4,
  },
  barTrack: {
    width: 16,
    height: 80,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 3,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  timeCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  timeBox: {
    alignItems: 'center',
  },
  timeBoxVal: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
  },
  timeBoxLabel: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  categoryItemRow: {
    marginBottom: 10,
  },
  categoryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  categoryPercent: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  categoryProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  habitTitle: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
  },
  habitSub: {
    fontSize: 12,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  streakBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  achieveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  toggleHideBtn: {
    padding: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeStatus: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  highlightBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});

export default AnalyticsScreen;
