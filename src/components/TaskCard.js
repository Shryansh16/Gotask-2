// src/components/TaskCard.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {PriorityBadge} from './Badge';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';

const CATEGORY_ICONS = {
  All: 'layers',
  Work: 'briefcase',
  Personal: 'user',
  Shopping: 'shopping-bag',
  Health: 'activity',
  Study: 'book-open',
  Finance: 'dollar-sign',
  Ideas: 'compass',
};

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
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  };
  const categoryIcon = CATEGORY_ICONS[task.category] || 'tag';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}, priority ${
        task.priority
      }, status ${task.completed ? 'completed' : 'pending'}`}
      activeOpacity={0.82}
      onPress={() => (onPress ? onPress(task) : onEdit ? onEdit(task) : null)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
          borderColor: isDark ? '#1E293B' : '#E2E8F0',
          borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
        },
      ]}>
      {/* 6px Signature Category Color Accent Strip (clipping cleanly to card radius) */}
      <View
        style={[
          styles.accentStrip,
          {backgroundColor: catMeta.color},
        ]}
      />

      {/* Top Meta Header: Distinct Color Medallion & Priority */}
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          {/* Category Medallion with solid signature color */}
          <View
            style={[
              styles.categoryMedallion,
              {backgroundColor: isDark ? catMeta.color : catMeta.bgColor},
            ]}>
            <Feather
              name={categoryIcon}
              size={13}
              color={isDark ? '#FFFFFF' : catMeta.color}
              style={{marginRight: 5}}
            />
            <Text
              style={[
                styles.categoryName,
                {color: isDark ? '#FFFFFF' : catMeta.color},
              ]}>
              {task.category || 'General'}
            </Text>
          </View>

          <View style={styles.badgeSpacing} />
          <PriorityBadge priority={task.priority} />
        </View>

        {/* Pin / Star Action */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={task.isPinned ? 'Unpin task' : 'Pin task'}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={() => togglePin(task.id)}
          style={styles.pinButton}>
          <Feather
            name="star"
            size={18}
            color={task.isPinned ? '#F59E0B' : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Row: Checkbox + Bold Title */}
      <View style={styles.contentRow}>
        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{checked: Boolean(task.completed)}}
          accessibilityLabel={
            task.completed ? 'Mark task incomplete' : 'Mark task complete'
          }
          activeOpacity={0.7}
          onPress={() => toggleTaskComplete(task.id)}
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? '#10B981' : catMeta.color,
              backgroundColor: task.completed ? '#10B981' : 'transparent',
            },
          ]}>
          {task.completed && <Feather name="check" size={16} color="#FFFFFF" />}
        </TouchableOpacity>

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

      {/* Subtasks Progress Bar (Thick, Vibrant Track) */}
      {hasSubtasks && (
        <View style={styles.subtaskSection}>
          <View style={styles.subtaskHeader}>
            <Text style={[styles.subtaskLabel, {color: theme.textSecondary}]}>
              Subtasks: {completedSubtasks}/{subtasks.length}
            </Text>
            <Text
              style={[
                styles.subtaskPercent,
                {color: subtaskProgress === 100 ? '#10B981' : catMeta.color},
              ]}>
              {Math.round(subtaskProgress)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarBg,
              {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
            ]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${subtaskProgress}%`,
                  backgroundColor:
                    subtaskProgress === 100 ? '#10B981' : catMeta.color,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Bottom Footer Row with Due Date & Clean Action Pills */}
      <View
        style={[
          styles.footerRow,
          {borderTopColor: isDark ? '#1E293B' : '#F1F5F9'},
        ]}>
        <View
          style={[
            styles.dueContainer,
            {backgroundColor: isDark ? '#1E293B' : '#F8FAFC'},
          ]}>
          <Feather name="calendar" size={13} color={theme.textMuted} />
          <Text style={[styles.dueText, {color: theme.textSecondary}]}>
            {task.dueDate || 'Today'}
          </Text>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit task"
            onPress={() => (onEdit ? onEdit(task) : null)}
            style={[
              styles.actionPill,
              {backgroundColor: isDark ? '#1E293B' : '#EEF2FF'},
            ]}>
            <Feather
              name="edit-2"
              size={12}
              color="#4F46E5"
              style={{marginRight: 4}}
            />
            <Text style={[styles.actionPillText, {color: '#4F46E5'}]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Delete task"
            onPress={() => deleteTask(task.id)}
            style={[
              styles.actionPill,
              {
                backgroundColor: isDark ? '#2C1515' : '#FEF2F2',
                marginLeft: 8,
              },
            ]}>
            <Feather
              name="trash-2"
              size={12}
              color="#EF4444"
              style={{marginRight: 4}}
            />
            <Text style={[styles.actionPillText, {color: '#EF4444'}]}>
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
    padding: 16,
    paddingLeft: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderBottomWidth: 4, // 3D Tactile Elevate bevel
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryMedallion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  badgeSpacing: {
    width: 8,
  },
  pinButton: {
    padding: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  description: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    lineHeight: 19,
    marginTop: 4,
  },
  subtaskSection: {
    marginBottom: 12,
    paddingTop: 2,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subtaskLabel: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  subtaskPercent: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    marginLeft: 6,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  actionPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
});

export default TaskCard;
