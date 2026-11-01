// src/components/GoalCard.js
// Verified Goal Card Component aligned with docs/Design.md Section 4 & 5 and docs/PRD.md Phase 4

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useGoal, GOAL_TYPES} from '../context/GoalContext';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {CategoryBadge} from './Badge';

export const GoalCard = ({goal, onEdit, onUpdateProgress, onViewHistory}) => {
  const {theme} = useTheme();
  const {deleteGoal, toggleArchiveGoal, toggleMilestone} = useGoal();

  const stats = goal.stats || {
    progress: 0,
    currentDisplay: '0',
    targetDisplay: '0',
    isOverdue: false,
    isAtRisk: false,
    overdueMilestonesCount: 0,
    status: 'in_progress',
  };

  const meta = categoryMeta[goal.category] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"? You can undo this action immediately.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGoal(goal.id),
        },
      ],
    );
  };

  // Determine status chip styling
  let statusBadgeBg = theme.primaryLight;
  let statusBadgeText = theme.primary;
  let statusLabel = 'In Progress';
  let progressColor = theme.primary;

  if (stats.status === 'completed') {
    statusBadgeBg = theme.successLight;
    statusBadgeText = theme.success;
    statusLabel = 'Completed';
    progressColor = theme.success;
  } else if (stats.status === 'overdue') {
    statusBadgeBg = theme.dangerLight;
    statusBadgeText = theme.danger;
    statusLabel = 'Overdue';
    progressColor = theme.danger;
  } else if (stats.status === 'at_risk') {
    statusBadgeBg = theme.warningLight;
    statusBadgeText = theme.warning;
    statusLabel = 'At Risk';
    progressColor = theme.warning;
  } else if (stats.status === 'archived') {
    statusBadgeBg = theme.surfaceSecondary;
    statusBadgeText = theme.textMuted;
    statusLabel = 'Archived';
    progressColor = theme.textMuted;
  }

  const formattedTargetDate = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Goal: ${goal.title}. Progress: ${stats.progress} percent. Status: ${statusLabel}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
        },
      ]}>
      {/* 6px Signature Category Color Accent Strip */}
      <View
        style={[
          styles.accentStrip,
          {backgroundColor: meta.color},
        ]}
      />

      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <CategoryBadge
            category={goal.category || 'General'}
            color={meta.color}
            bgColor={meta.bgColor}
          />
          <View style={[styles.statusBadge, {backgroundColor: statusBadgeBg}]}>
            <Text style={[styles.statusBadgeText, {color: statusBadgeText}]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onEdit(goal)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Edit goal"
          style={styles.iconButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Feather name="edit-2" size={15} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Title & Description */}
      <Text
        style={[styles.title, {color: theme.textPrimary}]}
        numberOfLines={2}>
        {goal.title}
      </Text>

      {goal.description ? (
        <Text
          style={[styles.description, {color: theme.textSecondary}]}
          numberOfLines={2}>
          {goal.description}
        </Text>
      ) : null}

      {/* Target Date & Type Info */}
      <View style={styles.infoRow}>
        {formattedTargetDate && (
          <View style={styles.infoPill}>
            <Feather
              name="calendar"
              size={12}
              color={theme.textMuted}
              style={{marginRight: 4}}
            />
            <Text style={[styles.targetDateText, {color: theme.textMuted}]}>
              Due {formattedTargetDate}
            </Text>
          </View>
        )}
        {goal.linkedTaskIds && goal.linkedTaskIds.length > 0 && (
          <View style={styles.infoPill}>
            <Feather
              name="link-2"
              size={12}
              color={theme.primary}
              style={{marginRight: 4}}
            />
            <Text style={[styles.linkedTasksText, {color: theme.primary}]}>
              {goal.linkedTaskIds.length} tasks linked
            </Text>
          </View>
        )}
      </View>

      {/* Visual Progress Bar (PRD P4.8) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressValues, {color: theme.textPrimary}]}>
            {stats.currentDisplay} / {stats.targetDisplay}
          </Text>
          <Text style={[styles.progressPercent, {color: progressColor}]}>
            {stats.progress}%
          </Text>
        </View>
        <View
          style={[
            styles.progressBarTrack,
            {backgroundColor: theme.surfaceSecondary},
          ]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${stats.progress}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Interactive Milestones Checklist (PRD P4.4) */}
      {goal.milestones && goal.milestones.length > 0 && (
        <View style={styles.milestonesSection}>
          <Text
            style={[styles.milestonesSectionTitle, {color: theme.textMuted}]}>
            Milestones ({goal.milestones.filter(m => m.isCompleted).length}/
            {goal.milestones.length})
          </Text>
          {goal.milestones.map(milestone => (
            <TouchableOpacity
              key={milestone.id}
              activeOpacity={0.7}
              onPress={() => toggleMilestone(goal.id, milestone.id)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityState={{checked: milestone.isCompleted}}
              accessibilityLabel={`Milestone ${milestone.title}, ${
                milestone.isCompleted ? 'completed' : 'not completed'
              }`}
              style={styles.milestoneItem}>
              <View
                style={[
                  styles.milestoneCheckbox,
                  {
                    borderColor: milestone.isCompleted
                      ? theme.success
                      : theme.border,
                  },
                  milestone.isCompleted && {
                    backgroundColor: theme.success,
                  },
                ]}>
                {milestone.isCompleted && (
                  <Feather name="check" size={12} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.milestoneTitle,
                  {
                    color: milestone.isCompleted
                      ? theme.textMuted
                      : theme.textPrimary,
                  },
                  milestone.isCompleted && styles.milestoneTitleCompleted,
                ]}
                numberOfLines={1}>
                {milestone.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Bar */}
      <View style={[styles.bottomBar, {borderTopColor: theme.divider}]}>
        <View style={styles.actionButtons}>
          {goal.type !== GOAL_TYPES.MILESTONES && (
            <TouchableOpacity
              onPress={() => onUpdateProgress(goal)}
              style={[
                styles.quickActionButton,
                {backgroundColor: theme.primaryLight},
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Update progress">
              <Text style={[styles.quickActionText, {color: theme.primary}]}>
                + Update Progress
              </Text>
            </TouchableOpacity>
          )}

          {goal.progressUpdates && goal.progressUpdates.length > 0 && (
            <TouchableOpacity
              onPress={() => onViewHistory(goal)}
              style={[
                styles.quickActionButton,
                {backgroundColor: theme.surfaceSecondary},
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="View history">
              <Feather
                name="clock"
                size={12}
                color={theme.textSecondary}
                style={{marginRight: 4}}
              />
              <Text
                style={[styles.quickActionText, {color: theme.textSecondary}]}>
                History
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            onPress={() => toggleArchiveGoal(goal.id)}
            style={styles.iconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              goal.isArchived ? 'Restore goal' : 'Archive goal'
            }>
            <Feather
              name={goal.isArchived ? 'rotate-ccw' : 'archive'}
              size={15}
              color={theme.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete goal">
            <Feather name="trash-2" size={15} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    padding: 16,
    paddingLeft: 20,
    marginBottom: 14,
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    lineHeight: 18,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetDateText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  linkedTasksText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  progressContainer: {
    marginTop: 6,
    marginBottom: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressValues: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  progressPercent: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestonesSection: {
    marginTop: 6,
    paddingTop: 6,
  },
  milestonesSectionTitle: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 32,
  },
  milestoneCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  milestoneTitle: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    flex: 1,
  },
  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    minHeight: 30,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GoalCard;
