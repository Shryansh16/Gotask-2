// src/screens/AnalyticsScreen.js
// Analytics, Progress & Motivation Dashboard (docs/PRD.md Phase 8 — P8.1 to P8.9)

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
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
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

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
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topHeader, {borderBottomColor: theme.border}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <Text style={[styles.backBtnText, {color: theme.textPrimary}]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, {color: theme.textPrimary}]}>
          📊 Analytics & Insights
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}>
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
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.timeTabText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isSelected
                        ? fontFamily.poppinsSemiBold
                        : fontFamily.poppinsRegular,
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
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <Text style={[styles.greetingTitle, {color: theme.textPrimary}]}>
            {motivation.title}
          </Text>
          <Text style={[styles.greetingSubtitle, {color: theme.textSecondary}]}>
            {motivation.subtitle}
          </Text>

          <View style={styles.statsSummaryRow}>
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryNumber, {color: theme.primary}]}>
                {taskMetrics.completionRate}%
              </Text>
              <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>
                Completion Rate
              </Text>
            </View>

            <View
              style={[styles.summaryDivider, {backgroundColor: theme.border}]}
            />

            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryNumber, {color: '#10b981'}]}>
                {taskMetrics.completed}/{taskMetrics.total}
              </Text>
              <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>
                Tasks Done
              </Text>
            </View>

            <View
              style={[styles.summaryDivider, {backgroundColor: theme.border}]}
            />

            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryNumber, {color: '#f59e0b'}]}>
                {timeStats.actualFocusMinutes}m
              </Text>
              <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>
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
            📈 Weekly Completion Velocity
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
                          ? fontFamily.poppinsSemiBold
                          : fontFamily.poppinsRegular,
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
            ⏱️ Planned vs. Actual Focus Time
          </Text>
          <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
            Compare estimated workload against logged focus sessions
          </Text>

          <View style={styles.timeCompareRow}>
            <View style={styles.timeBox}>
              <Text style={[styles.timeBoxVal, {color: theme.textPrimary}]}>
                {timeStats.plannedMinutes} mins
              </Text>
              <Text style={[styles.timeBoxLabel, {color: theme.textSecondary}]}>
                Estimated Plan
              </Text>
            </View>

            <Text style={{fontSize: textScale(20), color: theme.textSecondary}}>
              vs
            </Text>

            <View style={styles.timeBox}>
              <Text style={[styles.timeBoxVal, {color: theme.primary}]}>
                {timeStats.actualFocusMinutes} mins
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
              🏷️ Category Workload Distribution
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
              🔁 Habits & Streaks Consistency
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
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>
                    🔥 {h.currentStreak}d
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
              <View>
                <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
                  🏆 Achievements & Milestones
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
                    color: theme.textPlaceholder,
                    fontSize: textScale(11),
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
                      opacity: badge.unlocked ? 1 : 0.55,
                    },
                  ]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
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
                      ✓ Unlocked
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
              marginBottom: spacing.xl,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            📝 Analytical Review
          </Text>
          {review.highlights.map((item, idx) => (
            <View key={idx} style={styles.highlightBulletRow}>
              <Text style={{color: theme.primary, fontSize: textScale(14)}}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backBtnText: {
    fontSize: textScale(20),
    fontFamily: fontFamily.poppinsBold,
  },
  screenTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.poppinsBold,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: spacing.md,
    gap: spacing.md,
  },
  timeTabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  timeTab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(8),
    alignItems: 'center',
  },
  timeTabText: {
    fontSize: textScale(11),
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: moderateScale(20),
    padding: spacing.md,
  },
  greetingTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.poppinsBold,
    marginBottom: moderateScale(2),
  },
  greetingSubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsRegular,
    lineHeight: textScale(18),
    marginBottom: spacing.md,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: textScale(18),
    fontFamily: fontFamily.poppinsBold,
  },
  summaryLabel: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsRegular,
    marginTop: moderateScale(2),
  },
  summaryDivider: {
    width: 1,
    height: moderateScale(28),
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: moderateScale(18),
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: textScale(15),
    fontFamily: fontFamily.poppinsSemiBold,
    marginBottom: moderateScale(2),
  },
  sectionSubtitle: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsRegular,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: moderateScale(120),
    paddingTop: spacing.xs,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: moderateScale(16),
    height: '75%',
    justifyContent: 'flex-end',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: moderateScale(8),
  },
  barValueText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsMedium,
    marginBottom: moderateScale(2),
  },
  barLabel: {
    fontSize: textScale(11),
    marginTop: moderateScale(4),
  },
  timeCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  timeBox: {
    alignItems: 'center',
  },
  timeBoxVal: {
    fontSize: textScale(18),
    fontFamily: fontFamily.poppinsBold,
  },
  timeBoxLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsRegular,
    marginTop: moderateScale(2),
  },
  categoryItemRow: {
    marginBottom: spacing.sm,
  },
  categoryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(4),
  },
  categoryName: {
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsMedium,
  },
  categoryPercent: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsRegular,
  },
  categoryProgressBar: {
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: moderateScale(3),
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: '#88888820',
  },
  habitTitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.poppinsMedium,
  },
  habitSub: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsRegular,
  },
  streakBadge: {
    backgroundColor: '#f59e0b20',
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
  },
  streakBadgeText: {
    color: '#f59e0b',
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsBold,
  },
  achieveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  toggleHideBtn: {
    padding: spacing.xs,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badgeCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: moderateScale(12),
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  badgeIcon: {
    fontSize: textScale(22),
    marginBottom: moderateScale(3),
  },
  badgeTitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsSemiBold,
    marginBottom: moderateScale(2),
  },
  badgeDesc: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsRegular,
    lineHeight: textScale(14),
    marginBottom: moderateScale(4),
  },
  badgeStatus: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsMedium,
  },
  highlightBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginVertical: moderateScale(3),
  },
  highlightText: {
    flex: 1,
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsRegular,
    lineHeight: textScale(17),
  },
});
