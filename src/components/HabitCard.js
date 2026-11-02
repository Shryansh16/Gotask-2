// src/components/HabitCard.js
// Verified Habit Card Component aligned with docs/Design.md Section 18 and docs/PRD.md Phase 5
// Stitch & Elevate Labs Tactile Momentum Redesign (Screen 5: Habits & Rituals)
// Matched 1:1 against user reference media_1793629762862_f07baea9.jpg & media_1793629762660_8c2874a5.html

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import {
  useHabits,
  formatDateStr,
  getDayOfWeek,
  isHabitScheduledForDate,
} from '../context/HabitContext';
import { fontFamily } from '../common/fonts';

// Theme configuration per category matching Elevate Game/Workout tiles
const TILE_THEMES = {
  Health: {
    bg: '#064E3B',
    border: '#022C22',
    iconBg: '#059669',
    iconBorder: '#34D399',
    accent: '#34D399',
    tagBg: 'rgba(52, 211, 153, 0.25)',
    tagBorder: 'rgba(110, 231, 183, 0.3)',
    tagColor: '#A7F3D0',
    icon: 'smile',
    todayButtonBg: '#FBBF24',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'hand',
    doneBeadBg: '#34D399',
    doneBeadText: '#022C22',
    actionText: 'LOG DETAILS',
    defaultXp: '+50 XP READY',
  },
  Fitness: {
    bg: '#064E3B',
    border: '#022C22',
    iconBg: '#059669',
    iconBorder: '#34D399',
    accent: '#34D399',
    tagBg: 'rgba(52, 211, 153, 0.25)',
    tagBorder: 'rgba(110, 231, 183, 0.3)',
    tagColor: '#A7F3D0',
    icon: 'activity',
    todayButtonBg: '#FBBF24',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'hand',
    doneBeadBg: '#34D399',
    doneBeadText: '#022C22',
    actionText: 'LOG DETAILS',
    defaultXp: '+50 XP READY',
  },
  Mindfulness: {
    bg: '#064E3B',
    border: '#022C22',
    iconBg: '#059669',
    iconBorder: '#34D399',
    accent: '#34D399',
    tagBg: 'rgba(52, 211, 153, 0.25)',
    tagBorder: 'rgba(110, 231, 183, 0.3)',
    tagColor: '#A7F3D0',
    icon: 'smile',
    todayButtonBg: '#FBBF24',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'hand',
    doneBeadBg: '#34D399',
    doneBeadText: '#022C22',
    actionText: 'LOG DETAILS',
    defaultXp: '+50 XP READY',
  },
  Study: {
    bg: '#5B1446',
    border: '#25041A',
    iconBg: '#7D1D58',
    iconBorder: '#F472B6',
    accent: '#F472B6',
    tagBg: 'rgba(244, 114, 182, 0.25)',
    tagBorder: 'rgba(249, 168, 212, 0.3)',
    tagColor: '#FBCFE8',
    icon: 'book-open',
    todayButtonBg: '#FBBF24',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'book',
    doneBeadBg: '#F472B6',
    doneBeadText: '#0F172A',
    actionText: 'PAGE TRACKER',
    defaultXp: '+75 XP READY',
  },
  Learning: {
    bg: '#5B1446',
    border: '#25041A',
    iconBg: '#7D1D58',
    iconBorder: '#F472B6',
    accent: '#F472B6',
    tagBg: 'rgba(244, 114, 182, 0.25)',
    tagBorder: 'rgba(249, 168, 212, 0.3)',
    tagColor: '#FBCFE8',
    icon: 'book-open',
    todayButtonBg: '#FBBF24',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'book',
    doneBeadBg: '#F472B6',
    doneBeadText: '#0F172A',
    actionText: 'PAGE TRACKER',
    defaultXp: '+75 XP READY',
  },
  Work: {
    bg: '#92400E',
    border: '#451A03',
    iconBg: '#B45309',
    iconBorder: '#FCD34D',
    accent: '#FCD34D',
    tagBg: 'rgba(252, 211, 77, 0.25)',
    tagBorder: 'rgba(253, 230, 138, 0.3)',
    tagColor: '#FEF3C7',
    icon: 'check-circle',
    todayButtonBg: '#FCD34D',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'check',
    doneBeadBg: '#FCD34D',
    doneBeadText: '#0F172A',
    actionText: 'SHIELDED',
    defaultXp: '5/5 WEEKLY GOAL',
  },
  Productivity: {
    bg: '#92400E',
    border: '#451A03',
    iconBg: '#B45309',
    iconBorder: '#FCD34D',
    accent: '#FCD34D',
    tagBg: 'rgba(252, 211, 77, 0.25)',
    tagBorder: 'rgba(253, 230, 138, 0.3)',
    tagColor: '#FEF3C7',
    icon: 'check-circle',
    todayButtonBg: '#FCD34D',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'check',
    doneBeadBg: '#FCD34D',
    doneBeadText: '#0F172A',
    actionText: 'SHIELDED',
    defaultXp: '5/5 WEEKLY GOAL',
  },
  Default: {
    bg: '#0369A1',
    border: '#082F49',
    iconBg: '#0284C7',
    iconBorder: '#38BDF8',
    accent: '#38BDF8',
    tagBg: 'rgba(56, 189, 248, 0.25)',
    tagBorder: 'rgba(186, 230, 253, 0.3)',
    tagColor: '#BAE6FD',
    icon: 'zap',
    todayButtonBg: '#FBBF24',
    todayButtonShadow: '#B45309',
    todayButtonIcon: 'zap',
    doneBeadBg: '#38BDF8',
    doneBeadText: '#0F172A',
    actionText: 'LOG DETAILS',
    defaultXp: '+50 XP READY',
  },
};

export const HabitCard = ({ habit, onEdit }) => {
  const { isDark } = useTheme();
  const { toggleHabitDay, skipHabitDay, deleteHabit, todayStr } = useHabits();

  // Pick theme styling
  const theme =
    TILE_THEMES[habit.category] ||
    (habit.themeVariant === 'magenta'
      ? TILE_THEMES.Study
      : habit.themeVariant === 'amber'
      ? TILE_THEMES.Work
      : habit.themeVariant === 'emerald'
      ? TILE_THEMES.Health
      : TILE_THEMES.Default);

  const todayEntry = habit.history?.[todayStr];
  const isDoneToday = todayEntry?.status === 'completed';
  const isSkippedToday = todayEntry?.status === 'skipped';

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"? Your streak and history will be saved in your undo stack.`,
      [
        { text: 'Cancel', style: 'cancel' },
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
      'Freeze Streak',
      `Mark "${habit.title}" as frozen for today? This protects your ${habit.currentStreak}-day streak from resetting.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Freeze Streak ❄️',
          onPress: () =>
            skipHabitDay(habit.id, todayStr, 'User frozen session'),
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
    const dayLabel = getDayOfWeek(d).slice(0, 1).toUpperCase(); // 'M', 'T', 'W', etc.
    const isScheduled = isHabitScheduledForDate(habit, d);
    const entry = habit.history?.[dateStr];
    const isDone = entry?.status === 'completed';
    const isSkipped = entry?.status === 'skipped';
    const isToday = dateStr === todayStr;

    timelineDays.push({
      dateStr,
      dayLabel: isToday ? 'SUN' : dayLabel,
      isScheduled,
      isDone,
      isSkipped,
      isToday,
    });
  }

  // Format recurrence label
  let frequencySubtitle = habit.description;
  if (!frequencySubtitle) {
    if (habit.frequency === 'weekdays') {
      frequencySubtitle = 'Weekdays • 5:30 PM review';
    } else if (habit.frequency === 'weekends') {
      frequencySubtitle = 'Weekends routine';
    } else if (habit.frequency === 'custom') {
      frequencySubtitle = `${(habit.targetDays || []).join('/')}`;
    } else {
      frequencySubtitle = 'Every morning routine';
    }
  }

  const streakDays = habit.currentStreak || 0;
  const xpReward = habit.xpReward ? `+${habit.xpReward} XP READY` : theme.defaultXp;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.bg,
          borderBottomColor: theme.border,
        },
      ]}
      accessible={true}
      accessibilityLabel={`Habit ${habit.title}, ${habit.category}, ${streakDays} day streak`}>
      {/* Ambient subtle watermark badge */}
      <View style={styles.watermarkHalo} />

      {/* 1. Top Header Row: 3D Squircle Icon, Title, Category, Streak Pill */}
      <View style={styles.topRow}>
        <View style={styles.leftInfoGroup}>
          {/* 3D Tactile Icon Squircle */}
          <View
            style={[
              styles.iconSquircle3D,
              {
                backgroundColor: theme.iconBg,
                borderColor: theme.iconBorder,
              },
            ]}>
            <Feather
              name={habit.iconName || theme.icon}
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.titleColumn}>
            <View style={styles.titleRow}>
              <Text style={styles.habitTitle} numberOfLines={1}>
                {habit.title}
              </Text>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: theme.tagBg,
                    borderColor: theme.tagBorder,
                  },
                ]}>
                <Text style={[styles.categoryPillText, { color: theme.tagColor }]}>
                  {(habit.category || 'HEALTH').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.scheduleRow}>
              <Feather
                name="clock"
                size={11}
                color="rgba(255, 255, 255, 0.75)"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.scheduleText} numberOfLines={1}>
                {frequencySubtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* Milestone Streak Pill (Flame + Days) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onEdit && onEdit(habit)}
          onLongPress={handleSkip}
          style={styles.streakPill}>
          <Text style={styles.flameEmoji}>🔥</Text>
          <Text style={styles.streakDaysText}>{streakDays}d</Text>
        </TouchableOpacity>
      </View>

      {/* 2. 7-Day Tracker Beads inside Tile */}
      <View style={styles.trackerBox}>
        <View style={styles.trackerRow}>
          {timelineDays.map((item, index) => {
            const isWeekendRest =
              !item.isScheduled && (habit.frequency === 'weekdays' || habit.frequency === 'custom');

            return (
              <View key={item.dateStr || index} style={styles.beadColumn}>
                <Text
                  style={[
                    styles.beadDayLabel,
                    item.isToday
                      ? { color: '#FCD34D', fontFamily: fontFamily.bold }
                      : { color: 'rgba(255, 255, 255, 0.7)' },
                  ]}>
                  {item.dayLabel}
                </Text>

                {item.isToday ? (
                  /* Today Interactive Button */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleHabitDay(habit.id, item.dateStr)}
                    style={[
                      styles.todayInteractiveBtn,
                      isDoneToday
                        ? {
                            backgroundColor: theme.doneBeadBg,
                            borderColor: theme.accent,
                            shadowColor: theme.border,
                          }
                        : {
                            backgroundColor: theme.todayButtonBg,
                            borderColor: '#FEF08A',
                            shadowColor: theme.todayButtonShadow,
                          },
                    ]}>
                    <Feather
                      name={isDoneToday ? 'check' : 'touch_app' === 'touch_app' ? 'zap' : 'check'}
                      size={15}
                      color={isDoneToday ? '#022C22' : '#0F172A'}
                    />
                  </TouchableOpacity>
                ) : isWeekendRest ? (
                  /* Rest / Weekend Off Bead */
                  <View style={styles.restBead}>
                    <Text style={styles.restText}>Rest</Text>
                  </View>
                ) : item.isDone ? (
                  /* Completed Past Day Bead */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleHabitDay(habit.id, item.dateStr)}
                    style={[
                      styles.doneBead,
                      { backgroundColor: theme.doneBeadBg },
                    ]}>
                    <Feather
                      name="check"
                      size={14}
                      color={theme.doneBeadText}
                    />
                  </TouchableOpacity>
                ) : (
                  /* Incomplete / Unscheduled Bead */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleHabitDay(habit.id, item.dateStr)}
                    style={styles.emptyBead}>
                    <View style={styles.emptyBeadDot} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* 3. Footer Row: XP Status on Left, Action on Right */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>
              {isDoneToday ? '+50 XP CLAIMED' : xpReward}
            </Text>
          </View>
          <Text style={styles.statusLabel}>
            {isDoneToday
              ? 'Completed! 🔥'
              : habit.statusLabel || (isSkippedToday ? 'Streak Frozen ❄️' : 'Pending today')}
          </Text>
        </View>

        {habit.isShielded || theme.actionText === 'SHIELDED' ? (
          <View style={styles.shieldedRow}>
            <Feather
              name="check-circle"
              size={13}
              color="#34D399"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.shieldedText}>SHIELDED</Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit && onEdit(habit)}
            style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>
              {habit.actionText || theme.actionText}
            </Text>
            <Feather
              name="chevron-right"
              size={14}
              color="#FCD34D"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderBottomWidth: 4, // 3D Tactile Bevel
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  watermarkHalo: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconSquircle3D: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  titleColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitTitle: {
    fontSize: 16.5,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scheduleText: {
    fontSize: 11.5,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flameEmoji: {
    fontSize: 13,
    marginRight: 3,
  },
  streakDaysText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#FCD34D',
  },
  trackerBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  trackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beadColumn: {
    alignItems: 'center',
    flex: 1,
  },
  beadDayLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    marginBottom: 5,
  },
  doneBead: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  todayInteractiveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 3,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  restBead: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  restText: {
    fontSize: 9,
    fontFamily: fontFamily.bold,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  emptyBead: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyBeadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  statusLabel: {
    fontSize: 11.5,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bold,
    color: '#FCD34D',
    letterSpacing: 0.3,
  },
  shieldedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldedText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
});

export default HabitCard;
