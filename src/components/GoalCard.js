// src/components/GoalCard.js
// Verified Goal Card Component aligned with docs/Design.md Section 18 and docs/PRD.md Phase 4
// Screen 4: Goals & Targets (Stitch & Elevate Labs Tactile Momentum Redesign)
// Matched 1:1 against user reference media_1793624823904_3f8e5915.jpg

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useGoal } from '../context/GoalContext';
import { categoryMeta } from '../styles/theme';
import { fontFamily } from '../common/fonts';

const CATEGORY_ICONS = {
  All: 'layers',
  Work: 'briefcase',
  Personal: 'user',
  Shopping: 'shopping-bag',
  Health: 'activity',
  Study: 'package',
  Finance: 'dollar-sign',
  Ideas: 'compass',
};

export const GoalCard = ({
  goal,
  onEdit,
  onUpdateProgress,
  onViewHistory,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const { deleteGoal, toggleMilestone } = useGoal();

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
    color: '#00A3FF',
    bgColor: '#E0F2FE',
  };
  const categoryIcon = CATEGORY_ICONS[goal.category] || 'target';

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"? You can undo this action immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGoal(goal.id),
        },
      ],
    );
  };

  // Determine status chip styling
  let statusBadgeBg = isDark ? '#00375A' : '#E0F2FE';
  let statusBadgeText = '#0284C7';
  let statusLabel = goal.category === 'Study' ? 'Active' : 'In Progress';
  let progressColor = '#00A3FF';

  if (goal.category === 'Study') {
    progressColor = '#D97706'; // Amber/Orange for Study
  }

  if (stats.status === 'completed' || goal.isCompleted || stats.progress >= 100) {
    statusBadgeBg = isDark ? '#064E3B' : '#DCFCE7';
    statusBadgeText = '#15803D';
    statusLabel = 'Completed';
    progressColor = '#10B981';
  } else if (stats.status === 'overdue' || stats.isOverdue) {
    statusBadgeBg = isDark ? '#451A1A' : '#FEE2E2';
    statusBadgeText = '#DC2626';
    statusLabel = 'Overdue';
    progressColor = '#EF4444';
  } else if (stats.status === 'at_risk' || stats.isAtRisk) {
    statusBadgeBg = isDark ? '#3B2A08' : '#FEF3C7';
    statusBadgeText = '#D97706';
    statusLabel = 'At Risk';
    progressColor = '#F59E0B';
  } else if (stats.status === 'archived' || goal.isArchived) {
    statusBadgeBg = isDark ? '#1E293B' : '#F1F5F9';
    statusBadgeText = '#64748B';
    statusLabel = 'Archived';
    progressColor = '#64748B';
  }

  const formattedTargetDate = goal.targetDateLabel
    ? goal.targetDateLabel
    : goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const completedMilestonesCount = (goal.milestones || []).filter(
    m => m.isCompleted,
  ).length;

  // Format progress display cleanly (e.g. "22 km / 50 km (44%)" or "4 / 6 Modules (67%)")
  const formatProgressDisplay = () => {
    const cur = (stats.currentDisplay || `${goal.currentValue || 0}`).trim();
    const tgt = (stats.targetDisplay || `${goal.targetValue || 1}`).trim();
    const pct = `${stats.progress || 0}%`;

    const curMatch = cur.match(/^([\d.]+)\s*(.*)$/);
    const tgtMatch = tgt.match(/^([\d.]+)\s*(.*)$/);

    if (curMatch && tgtMatch) {
      const curVal = curMatch[1];
      const tgtVal = tgtMatch[1];
      const unit = tgtMatch[2] || curMatch[2] || goal.unit;

      if (unit && unit.toLowerCase() === 'km') {
        return `${curVal} km / ${tgtVal} km (${pct})`;
      }
      if (unit) {
        return `${curVal} / ${tgtVal} ${unit} (${pct})`;
      }
      return `${curVal} / ${tgtVal} (${pct})`;
    }

    return `${cur} / ${tgt} (${pct})`;
  };

  const isStudy = goal.category === 'Study';
  const progressLabel = goal.progressLabel || (isStudy ? 'Curriculum Completion' : 'Quantitative Progress');
  const checkpointsHeader = goal.checkpointsTitle || 'CHECKPOINTS';
  const checkpointsCountText =
    checkpointsHeader === 'ARCHITECTURE MODULES'
      ? `${completedMilestonesCount} / ${(goal.milestones || []).length} Cleared`
      : `${completedMilestonesCount} / ${(goal.milestones || []).length} Done`;

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Goal: ${goal.title}. Progress: ${stats.progress} percent. Status: ${statusLabel}`}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
          borderColor: isDark ? '#1E293B' : '#E2E8F0',
          borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
        },
      ]}>
      {/* Clickable Header & Quantitative Progress Area -> Opens Stepper Track */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress && onPress(goal)}
        accessibilityRole="button"
        accessibilityLabel={`View milestones and details for ${goal.title}`}>
        {/* 1. Top Row: Badges & Target Date */}
        <View style={styles.topRow}>
          <View style={styles.badgesRow}>
            {/* Category Pill */}
            <View
              style={[
                styles.categoryMedallion,
                {
                  backgroundColor: isDark
                    ? '#1E293B'
                    : isStudy
                    ? '#FFEDD5'
                    : meta.bgColor || '#DCFCE7',
                },
              ]}>
              <Feather
                name={categoryIcon}
                size={12}
                color={isStudy ? '#C2410C' : meta.color || '#15803D'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.categoryName,
                  { color: isStudy ? '#C2410C' : meta.color || '#15803D' },
                ]}>
                {goal.category || 'General'}
              </Text>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusBadgeBg }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadgeText }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Target Date / Sprint Pill */}
          {formattedTargetDate && (
            <View style={styles.datePill}>
              <Feather
                name="calendar"
                size={12}
                color={isDark ? '#64748B' : '#475569'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.targetDateText,
                  { color: isDark ? '#CBD5E1' : '#1E293B' },
                ]}>
                {formattedTargetDate}
              </Text>
            </View>
          )}
        </View>

        {/* 2. Title & Emoji */}
        <Text
          style={[
            styles.title,
            { color: isDark ? '#F8F9FF' : '#0B1C30' },
          ]}
          numberOfLines={2}>
          {goal.title} {goal.emoji && !isStudy ? '' : goal.emoji || ''}
        </Text>

        {/* Emoji below title if running challenge */}
        {goal.emoji && !isStudy && (
          <Text style={styles.titleEmojiBelow}>{goal.emoji}</Text>
        )}

        {/* 3. Description / Synopsis */}
        {goal.description ? (
          <Text
            style={[
              styles.description,
              { color: isDark ? '#CBD5E1' : '#475569' },
            ]}
            numberOfLines={2}>
            {goal.description}
          </Text>
        ) : null}

        {/* 4. Quantitative / Curriculum Progress Box */}
        <View
          style={[
            styles.progressBox,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}>
          <View style={styles.progressHeader}>
            <Text
              numberOfLines={1}
              style={[
                styles.progressTitle,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              {progressLabel}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.progressValues, { color: progressColor }]}>
              {formatProgressDisplay()}
            </Text>
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' },
            ]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(Math.max(stats.progress, 4), 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* 5. Checkpoints / Architecture Modules Checklist */}
      {goal.milestones && goal.milestones.length > 0 && (
        <View style={styles.milestonesSection}>
          <View style={styles.milestonesHeaderRow}>
            <Text
              style={[
                styles.milestonesSectionTitle,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              {checkpointsHeader}
            </Text>
            <Text style={styles.milestonesCount}>
              {checkpointsCountText}
            </Text>
          </View>

          {goal.milestones.map(milestone => {
            const isPassedBadge = milestone.badgeText === 'Passed';
            return (
              <TouchableOpacity
                key={milestone.id}
                activeOpacity={0.75}
                onPress={() => toggleMilestone(goal.id, milestone.id)}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: milestone.isCompleted }}
                accessibilityLabel={`Milestone ${milestone.title}, ${
                  milestone.isCompleted ? 'completed' : 'not completed'
                }`}
                style={[
                  styles.milestoneItem,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <View
                  style={[
                    styles.milestoneCheckbox,
                    milestone.isCompleted
                      ? {
                          backgroundColor: '#047857',
                          borderColor: '#047857',
                        }
                      : {
                          backgroundColor: isDark ? '#0F172A' : '#E0F2FE',
                          borderColor: isDark ? '#334155' : '#BAE6FD',
                        },
                  ]}>
                  {milestone.isCompleted && (
                    <Feather name="check" size={13} color="#FFFFFF" />
                  )}
                </View>

                <Text
                  style={[
                    styles.milestoneTitle,
                    milestone.isCompleted
                      ? [
                          styles.milestoneTitleCompleted,
                          { color: isDark ? '#64748B' : '#94A3B8' },
                        ]
                      : { color: isDark ? '#F8F9FF' : '#0B1C30' },
                  ]}
                  numberOfLines={1}>
                  {milestone.title}
                </Text>

                {/* Milestone Badge (Passed, +50 XP, Lab 3, etc.) */}
                <View
                  style={[
                    styles.milestoneBadgePill,
                    isPassedBadge || milestone.isCompleted
                      ? { backgroundColor: '#DCFCE7' }
                      : { backgroundColor: isDark ? '#334155' : '#F1F5F9' },
                  ]}>
                  <Text
                    style={[
                      styles.milestoneBadgeText,
                      isPassedBadge || milestone.isCompleted
                        ? { color: '#15803D' }
                        : { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    {milestone.badgeText
                      ? milestone.badgeText
                      : milestone.rewardText
                      ? milestone.rewardText
                      : milestone.isCompleted
                      ? '+50 XP'
                      : '+75 XP'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 6. Bottom Action Row */}
      <View style={styles.bottomActionRow}>
        {/* Left Indicator (Arch Level 4 Specialist or Avatars) */}
        <View style={styles.bottomLeftGroup}>
          {goal.bottomLeftBadge ? (
            <View style={styles.specialistRow}>
              <Text style={styles.specialistEmoji}>🎖️</Text>
              <Text
                style={[
                  styles.specialistText,
                  { color: isDark ? '#CBD5E1' : '#0F172A' },
                ]}>
                {goal.bottomLeftBadge}
              </Text>
            </View>
          ) : (
            <View style={styles.avatarBadgesRow}>
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarEmoji}>🏃</Text>
              </View>
              <View style={[styles.avatarBadge, { marginLeft: 4 }]}>
                <Text style={styles.avatarEmoji}>🔥</Text>
              </View>
            </View>
          )}
        </View>

        {/* Right CTA Button & Quick Actions */}
        <View style={styles.bottomRightGroup}>
          {goal.actionVariant === 'outline' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onUpdateProgress(goal)}
              style={styles.outlineActionBtn}>
              <Feather
                name="terminal"
                size={13}
                color="#0082CC"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.outlineActionText}>
                {goal.actionText || 'Launch Lab'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onUpdateProgress(goal)}
              style={styles.solidActionBtn}>
              <Feather
                name="plus-circle"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.solidActionText}>
                {goal.actionText || 'Log Progress +2.5km'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Edit / Delete Menu Trigger */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit goal"
            onPress={() => onEdit(goal)}
            style={styles.cardSettingsBtn}>
            <Feather
              name="more-horizontal"
              size={15}
              color={isDark ? '#64748B' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4, // 3D tactile bevel
    overflow: 'hidden',
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
    gap: 6,
  },
  categoryMedallion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetDateText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  titleEmojiBelow: {
    fontSize: 18,
    marginTop: 2,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 12,
  },
  progressBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  progressValues: {
    fontSize: 11,
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
    marginBottom: 12,
  },
  milestonesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestonesSectionTitle: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  milestonesCount: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#047857',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  milestoneCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: fontFamily.medium,
  },
  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  milestoneBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  milestoneBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  bottomActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 8,
  },
  bottomLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 13,
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  specialistText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  bottomRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  solidActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0082CC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#00629D',
  },
  solidActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  outlineActionText: {
    color: '#0082CC',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  cardSettingsBtn: {
    padding: 6,
    marginLeft: 6,
  },
});

export default GoalCard;
