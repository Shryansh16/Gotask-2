// src/components/TaskCard.js
// Screen 2: Dedicated Tasks Inventory & Backlog Card
// Matched 1:1 against user reference media_1793630748158_ae2c7680.jpg & HTML

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';

const CATEGORY_COLORS = {
  Work: {bg: '#E0F2FE', text: '#0369A1', darkBg: '#075985', darkText: '#BAE6FD'},
  Personal: {bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FDE68A'},
  Shopping: {bg: '#D1FAE5', text: '#065F46', darkBg: '#064E3B', darkText: '#A7F3D0'},
  Architecture: {bg: '#D1FAE5', text: '#047857', darkBg: '#064E3B', darkText: '#6EE7B7'},
  Reviews: {bg: '#E0E7FF', text: '#4338CA', darkBg: '#312E81', darkText: '#C7D2FE'},
  Health: {bg: '#CCFBF1', text: '#0F766E', darkBg: '#134E4A', darkText: '#99F6E4'},
  Study: {bg: '#FCE7F3', text: '#9D174D', darkBg: '#831843', darkText: '#FBCFE8'},
  Finance: {bg: '#FEF3C7', text: '#B45309', darkBg: '#78350F', darkText: '#FDE68A'},
};

export const TaskCard = ({task, onPress, onEdit}) => {
  const {theme, isDark} = useTheme();
  const {toggleTaskComplete, togglePin, deleteTask, toggleSubtask} = useTasks();

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const hasSubtasks = subtasks.length > 0;
  const subtaskProgress = hasSubtasks
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : 0;

  const xpAmount =
    task.xpReward ||
    (task.priority === 'high' ? 40 : task.priority === 'medium' ? 25 : 15);

  const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Work;

  // Render Priority Pill (High = Rose, Med = Amber, Low = Emerald)
  const renderPriorityBadge = () => {
    const p = (task.priority || 'medium').toLowerCase();
    let bg = '#FEF3C7';
    let text = '#92400E';
    let dot = '#F59E0B';
    let label = 'Med';

    if (p === 'high') {
      bg = '#FFE4E6';
      text = '#BE123C';
      dot = '#F43F5E';
      label = 'High';
    } else if (p === 'low') {
      bg = '#D1FAE5';
      text = '#065F46';
      dot = '#10B981';
      label = 'Low';
    }

    return (
      <View
        style={[
          styles.priorityPill,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : bg,
          },
        ]}>
        <View style={[styles.priorityDot, {backgroundColor: dot}]} />
        <Text
          style={[
            styles.priorityText,
            {color: isDark ? '#FFFFFF' : text},
          ]}>
          {label}
        </Text>
      </View>
    );
  };

  // --- 1. PINNED PRIORITY CARD VARIANT ---
  if (task.isPinned) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Pinned Task: ${task.title}`}
        activeOpacity={0.88}
        onPress={() => (onPress ? onPress(task) : onEdit ? onEdit(task) : null)}
        style={[
          styles.card,
          styles.pinnedCard,
          {
            backgroundColor: isDark ? '#1C1917' : '#FFFFFF',
            borderColor: isDark ? '#78350F' : '#FCD34D',
            borderBottomColor: isDark ? '#B45309' : '#F59E0B',
          },
        ]}>
        {/* Top Featured Banner Ribbon */}
        <View
          style={[
            styles.pinnedBannerRow,
            {borderBottomColor: isDark ? '#292524' : '#FEF3C7'},
          ]}>
          <View style={styles.pinnedTitleGroup}>
            <View style={styles.starBadge}>
              <Text style={styles.starIcon}>★</Text>
            </View>
            <Text style={styles.pinnedLabel}>PINNED PRIORITY</Text>
          </View>

          <View style={styles.pinnedBadgesGroup}>
            {/* Category Pill */}
            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isDark ? catColor.darkBg : catColor.bg,
                },
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  {color: isDark ? catColor.darkText : catColor.text},
                ]}>
                {task.category || 'Work'}
              </Text>
            </View>

            {/* High Priority Pill */}
            {renderPriorityBadge()}

            {/* XP Pill */}
            <View
              style={[
                styles.xpPill,
                {
                  backgroundColor: isDark ? '#2D2305' : '#FFFBEB',
                  borderColor: isDark ? '#78350F' : '#FDE68A',
                },
              ]}>
              <Text style={styles.xpText}>⚡ +{xpAmount} XP</Text>
            </View>
          </View>
        </View>

        {/* Task Body */}
        <View style={styles.taskBodyRow}>
          {/* 3D Checkbox */}
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
                borderColor: task.completed
                  ? '#10B981'
                  : isDark
                  ? '#475569'
                  : '#CBD5E1',
                backgroundColor: task.completed ? '#10B981' : 'transparent',
              },
            ]}>
            {task.completed && (
              <Feather name="check" size={15} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <View style={styles.textColumn}>
            <Text
              style={[
                styles.taskTitle,
                {color: task.completed ? '#94A3B8' : isDark ? '#F8FAFC' : '#0F172A'},
                task.completed && styles.strikethrough,
              ]}>
              {task.title}
            </Text>
            {Boolean(task.description) && (
              <Text
                style={[
                  styles.taskDescription,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                  task.completed && styles.strikethrough,
                ]}>
                {task.description}
              </Text>
            )}

            {/* Subtask Section */}
            {hasSubtasks && (
              <View
                style={[
                  styles.subtaskBox,
                  {
                    backgroundColor: isDark ? '#292524' : '#FFFDF5',
                    borderColor: isDark ? '#44403C' : '#FEF3C7',
                  },
                ]}>
                <View style={styles.subtaskHeader}>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      {color: isDark ? '#CBD5E1' : '#334155'},
                    ]}>
                    Subtasks Completed
                  </Text>
                  <Text style={styles.subtaskRatio}>
                    {completedSubtasks} / {subtasks.length} ({subtaskProgress}%)
                  </Text>
                </View>

                {/* Segmented Bar Track */}
                <View
                  style={[
                    styles.subtaskTrack,
                    {backgroundColor: isDark ? '#44403C' : '#FDE68A'},
                  ]}>
                  <View
                    style={[
                      styles.subtaskFill,
                      {
                        width: `${subtaskProgress}%`,
                        backgroundColor: '#F59E0B',
                      },
                    ]}
                  />
                </View>

                {/* Subtasks Checklist */}
                <View style={styles.subtaskChecklist}>
                  {subtasks.slice(0, 3).map(s => (
                    <TouchableOpacity
                      key={s.id}
                      activeOpacity={0.7}
                      onPress={() => toggleSubtask(task.id, s.id)}
                      style={styles.subtaskItem}>
                      <Feather
                        name={s.completed ? 'check-circle' : 'circle'}
                        size={15}
                        color={s.completed ? '#10B981' : isDark ? '#64748B' : '#94A3B8'}
                        style={styles.subtaskIcon}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.subtaskItemText,
                          {
                            color: s.completed
                              ? '#94A3B8'
                              : isDark
                              ? '#E2E8F0'
                              : '#1E293B',
                          },
                          s.completed && styles.strikethrough,
                        ]}>
                        {s.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Task Action Footer */}
            <View style={styles.taskFooterRow}>
              <View
                style={[
                  styles.timeBadge,
                  {
                    backgroundColor: isDark ? '#2D2305' : '#FFFBEB',
                    borderColor: isDark ? '#78350F' : '#FEF08A',
                  },
                ]}>
                <Feather
                  name="clock"
                  size={12}
                  color="#B45309"
                  style={{marginRight: 4}}
                />
                <Text style={styles.timeText}>{task.dueDate || 'Today 4:00 PM'}</Text>
              </View>

              <View style={styles.actionsRight}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Edit Task"
                  onPress={() => (onEdit ? onEdit(task) : null)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isDark ? '#334155' : '#F1F5F9',
                      borderColor: isDark ? '#475569' : '#E2E8F0',
                    },
                  ]}>
                  <Feather
                    name="edit-2"
                    size={11}
                    color={isDark ? '#CBD5E1' : '#334155'}
                    style={{marginRight: 4}}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      {color: isDark ? '#CBD5E1' : '#334155'},
                    ]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Delete Task"
                  onPress={() => deleteTask(task.id)}
                  style={[
                    styles.deleteBtn,
                    {
                      backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
                      borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
                    },
                  ]}>
                  <Feather name="trash-2" size={13} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // --- 2. STANDARD / SPECIALIZED ACTIVITY CARD VARIANTS ---
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}`}
      activeOpacity={0.88}
      onPress={() => (onPress ? onPress(task) : onEdit ? onEdit(task) : null)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#F1F5F9',
          borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
        },
      ]}>
      {/* Top Header Row */}
      <View style={styles.standardTopRow}>
        <View style={styles.badgesLeft}>
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: isDark ? catColor.darkBg : catColor.bg,
              },
            ]}>
            <Text
              style={[
                styles.categoryText,
                {color: isDark ? catColor.darkText : catColor.text},
              ]}>
              {task.category || 'General'}
            </Text>
          </View>

          {renderPriorityBadge()}
        </View>

        <View style={styles.badgesRight}>
          {/* Custom Date or Schedule Badge */}
          {Boolean(task.frequency) ? (
            <View style={styles.metaRow}>
              <Feather
                name="repeat"
                size={12}
                color={isDark ? '#94A3B8' : '#64748B'}
                style={{marginRight: 4}}
              />
              <Text
                style={[
                  styles.metaText,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                {task.frequency}
              </Text>
            </View>
          ) : Boolean(task.store) ? (
            <View style={styles.metaRow}>
              <Feather
                name="link"
                size={12}
                color={isDark ? '#94A3B8' : '#64748B'}
                style={{marginRight: 4}}
              />
              <Text
                style={[
                  styles.metaText,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                {task.store}
              </Text>
            </View>
          ) : (
            <View style={styles.metaRow}>
              <Feather
                name="calendar"
                size={12}
                color={isDark ? '#94A3B8' : '#64748B'}
                style={{marginRight: 4}}
              />
              <Text
                style={[
                  styles.metaText,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                {task.dueDate || 'Today'}
              </Text>
            </View>
          )}

          {/* XP Pill */}
          <View
            style={[
              styles.xpPill,
              {
                backgroundColor: isDark ? '#2D2305' : '#FFFBEB',
                borderColor: isDark ? '#78350F' : '#FDE68A',
                marginLeft: 6,
              },
            ]}>
            <Text style={styles.xpText}>⚡ +{xpAmount} XP</Text>
          </View>
        </View>
      </View>

      {/* Task Body */}
      <View style={styles.taskBodyRow}>
        {/* Checkbox */}
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
              borderColor: task.completed
                ? '#10B981'
                : isDark
                ? '#475569'
                : '#CBD5E1',
              backgroundColor: task.completed ? '#10B981' : 'transparent',
            },
          ]}>
          {task.completed && (
            <Feather name="check" size={15} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <View style={styles.textColumn}>
          <Text
            style={[
              styles.taskTitle,
              {color: task.completed ? '#94A3B8' : isDark ? '#F8FAFC' : '#0F172A'},
              task.completed && styles.strikethrough,
            ]}>
            {task.title}
          </Text>

          {Boolean(task.description) && (
            <Text
              style={[
                styles.taskDescription,
                {color: isDark ? '#94A3B8' : '#64748B'},
                task.completed && styles.strikethrough,
              ]}>
              {task.description}
            </Text>
          )}

          {/* Subtask Mini Meter (Card 2 style) */}
          {(hasSubtasks || Boolean(task.sprintLabel)) && (
            <View style={styles.miniMeterContainer}>
              <View style={styles.miniMeterHeader}>
                <View style={styles.miniMeterLeft}>
                  <Feather
                    name="check-square"
                    size={13}
                    color="#0284C7"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.miniMeterText}>
                    {completedSubtasks}/{subtasks.length || 6} Subtasks (
                    {subtaskProgress || 33}%)
                  </Text>
                </View>
                <Text style={styles.sprintLabelText}>
                  {task.sprintLabel || 'UI / Sprint 34'}
                </Text>
              </View>

              <View
                style={[
                  styles.miniTrack,
                  {backgroundColor: isDark ? '#334155' : '#F1F5F9'},
                ]}>
                <View
                  style={[
                    styles.miniFill,
                    {
                      width: `${subtaskProgress || 33}%`,
                      backgroundColor: '#00A3FF',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Specific Custom Footers (Billing / Amount or Wishlist) */}
          {Boolean(task.amount) && (
            <View style={styles.amountFooterRow}>
              <View
                style={[
                  styles.duePill,
                  {backgroundColor: isDark ? '#334155' : '#F1F5F9'},
                ]}>
                <Text
                  style={[
                    styles.duePillText,
                    {color: isDark ? '#CBD5E1' : '#475569'},
                  ]}>
                  {task.dueDate || 'Due in 5 days'}
                </Text>
              </View>
              <View style={styles.amountPill}>
                <Feather
                  name="credit-card"
                  size={12}
                  color="#0284C7"
                  style={{marginRight: 4}}
                />
                <Text style={styles.amountText}>{task.amount}</Text>
              </View>
            </View>
          )}

          {Boolean(task.tag) && (
            <View style={styles.tagFooterRow}>
              <View
                style={[
                  styles.wishlistPill,
                  {
                    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                    borderColor: isDark ? '#059669' : '#A7F3D0',
                  },
                ]}>
                <Text
                  style={[
                    styles.wishlistText,
                    {color: isDark ? '#6EE7B7' : '#047857'},
                  ]}>
                  {task.tag}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderBottomWidth: 4, // 3D tactile bevel
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pinnedCard: {
    borderWidth: 2,
    borderBottomWidth: 4,
    shadowOpacity: 0.08,
  },
  pinnedBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  pinnedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  starIcon: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '900',
  },
  pinnedLabel: {
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  pinnedBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  xpPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  xpText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#B45309',
  },
  standardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  taskBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  textColumn: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  taskDescription: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    lineHeight: 17,
    marginTop: 3,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  subtaskBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subtaskTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  subtaskRatio: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#B45309',
  },
  subtaskTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  subtaskFill: {
    height: '100%',
    borderRadius: 3,
  },
  subtaskChecklist: {
    gap: 5,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskIcon: {
    marginRight: 6,
  },
  subtaskItemText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    flex: 1,
  },
  taskFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#B45309',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMeterContainer: {
    marginTop: 8,
  },
  miniMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniMeterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniMeterText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#64748B',
  },
  sprintLabelText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#0284C7',
  },
  miniTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },
  amountFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  duePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  duePillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  amountPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#0284C7',
  },
  tagFooterRow: {
    marginTop: 8,
  },
  wishlistPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  wishlistText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
});

export default TaskCard;
