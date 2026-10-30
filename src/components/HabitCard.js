// src/components/HabitCard.js
// Verified Habit Card Component aligned with docs/Design.md and docs/PRD.md Phase 5

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {
  useHabits,
  formatDateStr,
  getDayOfWeek,
  isHabitScheduledForDate,
} from '../context/HabitContext';
import {categoryMeta} from '../styles/theme';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {CategoryBadge} from './Badge';

export const HabitCard = ({habit, onEdit}) => {
  const {theme} = useTheme();
  const {toggleHabitDay, skipHabitDay, deleteHabit, todayStr} = useHabits();

  const meta = categoryMeta[habit.category] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  const isScheduledToday = isHabitScheduledForDate(habit, todayStr);
  const todayEntry = habit.history?.[todayStr];
  const isDoneToday = todayEntry?.status === 'completed';
  const isSkippedToday = todayEntry?.status === 'skipped';

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"? Your streak and history will be saved in your undo stack.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(habit.id),
        },
      ],
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Today',
      `Mark "${habit.title}" as skipped for today? This freezes and protects your ${habit.currentStreak}-day streak from resetting.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Skip Session',
          onPress: () =>
            skipHabitDay(habit.id, todayStr, 'User skipped session'),
        },
      ],
    );
  };

  // Build the 7-day mini-timeline (last 6 days + today)
  const timelineDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDateStr(d);
    const dayLabel = getDayOfWeek(d).slice(0, 2); // 'Su', 'Mo', etc.
    const isScheduled = isHabitScheduledForDate(habit, d);
    const entry = habit.history?.[dateStr];
    const isDone = entry?.status === 'completed';
    const isSkipped = entry?.status === 'skipped';
    const isToday = dateStr === todayStr;

    timelineDays.push({
      dateStr,
      dayLabel,
      isScheduled,
      isDone,
      isSkipped,
      isToday,
    });
  }

  // Format recurrence label
  let frequencyLabel = 'Daily';
  if (habit.frequency === 'weekdays') {
    frequencyLabel = 'Weekdays';
  } else if (habit.frequency === 'weekends') {
    frequencyLabel = 'Weekends';
  } else if (habit.frequency === 'custom') {
    frequencyLabel = (habit.targetDays || []).join(', ');
  }

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.surface,
          borderColor: isDoneToday ? theme.success : theme.border,
        },
      ]}
      accessible={true}
      accessibilityLabel={`Habit ${habit.title}, ${frequencyLabel}, ${habit.currentStreak} day streak`}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <CategoryBadge category={habit.category} color={meta.color} />
          <View
            style={[
              styles.frequencyBadge,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <Text style={[styles.frequencyText, {color: theme.textSecondary}]}>
              🗓️ {frequencyLabel}
            </Text>
          </View>
        </View>

        {/* Streak Flame Badge */}
        <View
          style={[
            styles.streakBadge,
            {
              backgroundColor:
                habit.currentStreak > 0
                  ? theme.primaryLight
                  : theme.surfaceSecondary,
            },
          ]}>
          <Text
            style={[
              styles.streakBadgeText,
              {
                color:
                  habit.currentStreak > 0 ? theme.primary : theme.textSecondary,
              },
            ]}>
            🔥 {habit.currentStreak}d
          </Text>
        </View>
      </View>

      {/* Main Title & Action Row */}
      <View style={styles.contentRow}>
        <View style={styles.titleColumn}>
          <Text
            style={[
              styles.title,
              {color: theme.textPrimary},
              isDoneToday && styles.titleDone,
            ]}
            numberOfLines={2}>
            {habit.title}
          </Text>

          {habit.description ? (
            <Text
              style={[styles.description, {color: theme.textSecondary}]}
              numberOfLines={2}>
              {habit.description}
            </Text>
          ) : null}

          {habit.reminderTime && habit.reminderEnabled ? (
            <View style={styles.reminderRow}>
              <Text style={[styles.reminderText, {color: theme.textSecondary}]}>
                🔔 Reminder: {habit.reminderTime}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Main Checkmark / Today Toggle Button */}
        {isScheduledToday ? (
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: isDoneToday
                  ? theme.success
                  : isSkippedToday
                  ? theme.surfaceSecondary
                  : theme.primaryLight,
                borderColor: isDoneToday ? theme.success : theme.primary,
              },
            ]}
            onPress={() => toggleHabitDay(habit.id, todayStr)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${habit.title} as ${
              isDoneToday ? 'incomplete' : 'complete'
            } for today`}>
            <Text
              style={[
                styles.checkButtonIcon,
                isDoneToday ? styles.iconWhite : {color: theme.primary},
              ]}>
              {isDoneToday ? '✓' : isSkippedToday ? '⏸' : '○'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.offDayBadge,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <Text style={[styles.offDayText, {color: theme.textSecondary}]}>
              Rest Day
            </Text>
          </View>
        )}
      </View>

      {/* 7-Day Mini Timeline Bar */}
      <View style={styles.timelineContainer}>
        <Text style={[styles.timelineLabel, {color: theme.textSecondary}]}>
          Last 7 Days
        </Text>
        <View style={styles.timelineRow}>
          {timelineDays.map(item => {
            let dotBg = theme.surfaceSecondary;
            let textColor = theme.textSecondary;

            if (item.isDone) {
              dotBg = theme.success;
              textColor = '#FFFFFF';
            } else if (item.isSkipped) {
              dotBg = theme.warningLight;
              textColor = theme.warning;
            } else if (!item.isScheduled) {
              dotBg = 'transparent';
              textColor = theme.textSecondary;
            } else if (item.isToday) {
              dotBg = theme.primaryLight;
              textColor = theme.primary;
            }

            return (
              <TouchableOpacity
                key={item.dateStr}
                style={[
                  styles.timelineDot,
                  item.isToday ? styles.dotToday : styles.dotNormal,
                  {
                    backgroundColor: dotBg,
                    borderColor: item.isToday ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => toggleHabitDay(habit.id, item.dateStr)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${item.dateStr}: ${
                  item.isDone
                    ? 'completed'
                    : item.isSkipped
                    ? 'skipped'
                    : 'not completed'
                }`}>
                <Text
                  style={[
                    styles.timelineDotText,
                    {
                      color: textColor,
                      fontFamily: item.isToday
                        ? fontFamily.bold
                        : fontFamily.regular,
                    },
                  ]}>
                  {item.isDone ? '✓' : item.dayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer Info & Action Row */}
      <View style={[styles.footerRow, {borderTopColor: theme.divider}]}>
        <View style={styles.statsRow}>
          <Text style={[styles.statsText, {color: theme.textSecondary}]}>
            Best: ★ {habit.bestStreak}d • Total: {habit.totalCompleted} done
          </Text>
        </View>

        <View style={styles.actionGroup}>
          {isScheduledToday && !isDoneToday && !isSkippedToday ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSkip}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Skip today's session">
              <Text style={[styles.actionButtonText, {color: theme.warning}]}>
                Skip
              </Text>
            </TouchableOpacity>
          ) : null}

          {onEdit ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(habit)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Edit habit ${habit.title}`}>
              <Text style={[styles.actionButtonText, {color: theme.primary}]}>
                Edit
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Delete habit ${habit.title}`}>
            <Text style={[styles.actionButtonText, {color: theme.danger}]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: moderateScale(14),
    padding: spacing.M,
    marginVertical: spacing.XS,
    marginHorizontal: spacing.M,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.S,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.XS,
  },
  frequencyBadge: {
    paddingHorizontal: spacing.S,
    paddingVertical: spacing.XXS,
    borderRadius: moderateScale(6),
  },
  frequencyText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  streakBadge: {
    paddingHorizontal: spacing.S,
    paddingVertical: spacing.XXS,
    borderRadius: moderateScale(12),
  },
  streakBadgeText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.M,
  },
  titleColumn: {
    flex: 1,
    paddingRight: spacing.M,
  },
  title: {
    fontSize: textScale(16),
    fontFamily: fontFamily.semiBold,
    marginBottom: spacing.XXS,
  },
  description: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    lineHeight: textScale(18),
    marginBottom: spacing.XXS,
  },
  reminderRow: {
    marginTop: spacing.XXS,
  },
  reminderText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  checkButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonIcon: {
    fontSize: textScale(22),
    fontFamily: fontFamily.bold,
  },
  offDayBadge: {
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.S,
    borderRadius: moderateScale(8),
  },
  offDayText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  timelineContainer: {
    marginBottom: spacing.M,
  },
  timelineLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
    marginBottom: spacing.XS,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineDot: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotText: {
    fontSize: textScale(11),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.S,
    borderTopWidth: 1,
  },
  statsRow: {
    flex: 1,
  },
  statsText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.S,
  },
  actionButton: {
    paddingVertical: spacing.XXS,
    paddingHorizontal: spacing.XS,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.semiBold,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  iconWhite: {
    color: '#FFFFFF',
  },
  dotToday: {
    borderWidth: 1.5,
  },
  dotNormal: {
    borderWidth: 0.5,
  },
});

export default HabitCard;
