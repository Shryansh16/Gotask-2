// src/components/GoalCard.js
// Verified Goal Card Component aligned with docs/Design.md Section 4 & 5 and docs/PRD.md Phase 4

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useGoal, GOAL_TYPES} from '../context/GoalContext';
import {categoryMeta} from '../styles/theme';
import {textScale, moderateScale} from '../styles/responsiveStyles';
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
    statusLabel = 'Completed ✓';
    progressColor = theme.success;
  } else if (stats.status === 'overdue') {
    statusBadgeBg = theme.dangerLight;
    statusBadgeText = theme.danger;
    statusLabel = 'Overdue ⚠️';
    progressColor = theme.danger;
  } else if (stats.status === 'at_risk') {
    statusBadgeBg = theme.warningLight;
    statusBadgeText = theme.warning;
    statusLabel = 'At Risk ⏳';
    progressColor = theme.warning;
  } else if (stats.status === 'archived') {
    statusBadgeBg = theme.surfaceSecondary;
    statusBadgeText = theme.textMuted;
    statusLabel = 'Archived 📦';
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
        },
        theme.cardShadow,
      ]}>
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
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.editIconText, {color: theme.textMuted}]}>✎</Text>
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
          <Text style={[styles.targetDateText, {color: theme.textMuted}]}>
            🎯 Due {formattedTargetDate}
          </Text>
        )}
        {goal.linkedTaskIds && goal.linkedTaskIds.length > 0 && (
          <Text style={[styles.linkedTasksText, {color: theme.primary}]}>
            🔗 {goal.linkedTaskIds.length} tasks linked
          </Text>
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
                  <Text style={styles.checkIconText}>✓</Text>
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
              <Text
                style={[styles.quickActionText, {color: theme.textSecondary}]}>
                📜 History
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
            <Text style={[styles.actionIcon, {color: theme.textMuted}]}>
              {goal.isArchived ? '📦' : '🗄️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete goal">
            <Text style={[styles.actionIcon, {color: theme.danger}]}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.semiBold,
  },
  editIconText: {
    fontSize: textScale(16),
  },
  title: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
    marginTop: spacing.xs,
    marginBottom: 4,
    lineHeight: textScale(22),
  },
  description: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    lineHeight: textScale(18),
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  targetDateText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  linkedTasksText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  progressContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressValues: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  progressPercent: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  milestonesSectionTitle: {
    fontSize: textScale(11),
    fontFamily: fontFamily.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  milestoneCheckbox: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  checkIconText: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontWeight: 'bold',
  },
  milestoneTitle: {
    fontSize: textScale(13),
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.semiBold,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: textScale(15),
  },
});

export default GoalCard;
