// src/components/HabitCard.js
// Verified Habit Card Component aligned with docs/Design.md and docs/PRD.md Phase 5

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {
  useHabits,
  formatDateStr,
  getDayOfWeek,
  isHabitScheduledForDate,
} from '../context/HabitContext';
import {categoryMeta} from '../styles/theme';
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
          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
          borderColor: isDoneToday ? '#10B981' : isDark ? '#1E293B' : '#E2E8F0',
          borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
        },
      ]}
      accessible={true}
      accessibilityLabel={`Habit ${habit.title}, ${frequencyLabel}, ${habit.currentStreak} day streak`}>
      {/* 6px Signature Category Color Accent Strip */}
      <View
        style={[
          styles.accentStrip,
          {backgroundColor: meta.color},
        ]}
      />

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
              {frequencyLabel}
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
                  ? isDark
                    ? '#2D2305'
                    : '#FFFBEB'
                  : isDark
                  ? '#1E293B'
                  : theme.surfaceSecondary,
            },
          ]}>
          <Feather
            name="zap"
            size={13}
            color={
              habit.currentStreak > 0 ? '#F59E0B' : theme.textSecondary
            }
            style={{marginRight: 4}}
          />
          <Text
            style={[
              styles.streakBadgeText,
              {
                color:
                  habit.currentStreak > 0 ? '#F59E0B' : theme.textSecondary,
              },
            ]}>
            {habit.currentStreak}d streak
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
              <Feather
                name="bell"
                size={11}
                color={theme.textSecondary}
                style={{marginRight: 4}}
              />
              <Text style={[styles.reminderText, {color: theme.textSecondary}]}>
                Reminder: {habit.reminderTime}
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
            {isDoneToday ? (
              <Feather name="check" size={20} color="#FFFFFF" />
            ) : isSkippedToday ? (
              <Feather name="pause" size={16} color={theme.textSecondary} />
            ) : (
              <Feather name="circle" size={18} color={theme.primary} />
            )}
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
                {item.isDone ? (
                  <Feather name="check" size={12} color="#FFFFFF" />
                ) : (
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
                    {item.dayLabel}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer Info & Action Row */}
      <View style={[styles.footerRow, {borderTopColor: theme.divider}]}>
        <View style={styles.statsRow}>
          <Text style={[styles.statsText, {color: theme.textSecondary}]}>
            Best: {habit.bestStreak}d • Total: {habit.totalCompleted} done
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
    borderRadius: 20,
    padding: 16,
    paddingLeft: 20,
    marginVertical: 6,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  frequencyText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  streakBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  titleColumn: {
    flex: 1,
    marginRight: spacing.medium,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  description: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    lineHeight: 18,
    marginTop: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reminderText: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offDayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  offDayText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  timelineContainer: {
    marginBottom: spacing.small,
  },
  timelineLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginBottom: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotToday: {
    borderWidth: 2,
  },
  dotNormal: {},
  timelineDotText: {
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  statsRow: {
    flex: 1,
  },
  statsText: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 6,
    minHeight: 28,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
});

export default HabitCard;
