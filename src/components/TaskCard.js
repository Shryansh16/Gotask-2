// src/components/TaskCard.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {PriorityBadge, CategoryBadge} from './Badge';
import {categoryMeta} from '../styles/theme';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const TaskCard = ({task, onPress, onEdit}) => {
  const {theme, isDark} = useTheme();
  const {toggleTaskComplete, togglePin, deleteTask} = useTasks();

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const hasSubtasks = subtasks.length > 0;
  const subtaskProgress = hasSubtasks
    ? (completedSubtasks / subtasks.length) * 100
    : 0;

  const catMeta = categoryMeta[task.category] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => (onPress ? onPress(task) : onEdit ? onEdit(task) : null)}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: task.isPinned ? theme.primary : theme.border,
          borderWidth: task.isPinned ? 1.5 : 1,
        },
        theme.cardShadow,
      ]}>
      {/* Top Meta Row */}
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <CategoryBadge
            category={task.category || 'General'}
            color={catMeta.color}
            bgColor={catMeta.bgColor}
          />
          <View style={styles.badgeSpacing} />
          <PriorityBadge priority={task.priority} />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => togglePin(task.id)}
            style={styles.pinButton}>
            <Text
              style={[
                styles.pinIcon,
                {color: task.isPinned ? theme.primary : theme.textMuted},
              ]}>
              {task.isPinned ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Row */}
      <View style={styles.contentRow}>
        {/* Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleTaskComplete(task.id)}
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? theme.success : theme.border,
              backgroundColor: task.completed ? theme.success : 'transparent',
            },
          ]}>
          {task.completed && <Text style={styles.checkmarkText}>✓</Text>}
        </TouchableOpacity>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {color: task.completed ? theme.textMuted : theme.textPrimary},
              task.completed && styles.strikethrough,
            ]}>
            {task.title}
          </Text>

          {Boolean(task.description) && (
            <Text
              numberOfLines={2}
              style={[
                styles.description,
                {color: theme.textSecondary},
                task.completed && styles.strikethrough,
              ]}>
              {task.description}
            </Text>
          )}
        </View>
      </View>

      {/* Subtasks Progress Bar (if task has subtasks) */}
      {hasSubtasks && (
        <View style={styles.subtaskSection}>
          <View style={styles.subtaskHeader}>
            <Text style={[styles.subtaskLabel, {color: theme.textMuted}]}>
              Checklist: {completedSubtasks}/{subtasks.length}
            </Text>
            <Text style={[styles.subtaskPercent, {color: theme.textSecondary}]}>
              {Math.round(subtaskProgress)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarBg,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${subtaskProgress}%`,
                  backgroundColor:
                    subtaskProgress === 100 ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Bottom Footer Row */}
      <View style={[styles.footerRow, {borderTopColor: theme.divider}]}>
        <View style={styles.dueContainer}>
          <Text style={[styles.dueIcon, {color: theme.textMuted}]}>📅</Text>
          <Text style={[styles.dueText, {color: theme.textSecondary}]}>
            {task.dueDate || 'Today'}
          </Text>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            onPress={() => (onEdit ? onEdit(task) : null)}
            style={[
              styles.smallBtn,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <Text style={[styles.smallBtnText, {color: theme.primary}]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteTask(task.id)}
            style={[
              styles.smallBtn,
              {backgroundColor: theme.dangerLight, marginLeft: 8},
            ]}>
            <Text style={[styles.smallBtnText, {color: theme.danger}]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacing: {
    width: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinButton: {
    padding: 4,
  },
  pinIcon: {
    fontSize: textScale(18),
    lineHeight: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: spacing.MARGIN_12,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
    marginTop: -1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: textScale(15),
    fontFamily: fontFamily.bold,
    lineHeight: 22,
  },
  description: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    marginTop: 4,
    lineHeight: 18,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  subtaskSection: {
    marginTop: spacing.MARGIN_12,
    marginBottom: 4,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subtaskLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
  subtaskPercent: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: spacing.MARGIN_12,
    paddingTop: spacing.MARGIN_10,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueIcon: {
    fontSize: textScale(12),
    marginRight: 4,
  },
  dueText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  smallBtnText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
});

export default TaskCard;
