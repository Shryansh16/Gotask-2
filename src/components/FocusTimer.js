// src/components/FocusTimer.js
// Focus Mode Timer Component (docs/Design.md Section 10 & docs/PRD.md Phase 6)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {usePlanning, TIMER_MODES} from '../context/PlanningContext';
import {fontFamily} from '../common/fonts';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {getTextA11yProps} from '../utility/accessibility';

export const FocusTimer = ({onCompleteTask}) => {
  const {theme} = useTheme();
  const {
    timerStatus,
    activeMode,
    remainingSeconds,
    durationMinutes,
    activeTask,
    selectMode,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
  } = usePlanning();

  // Format MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress fraction (0 to 1)
  const totalSeconds = durationMinutes * 60;
  const progressFraction = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const progressPercent = Math.min(100, Math.round(progressFraction * 100));

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}>
      {/* Mode Selector Tabs */}
      <View style={styles.modeTabsRow}>
        {Object.values(TIMER_MODES).map(mode => {
          const isSelected = activeMode === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              disabled={timerStatus === 'running'}
              onPress={() => selectMode(mode.id)}
              style={[
                styles.modeTab,
                {
                  backgroundColor: isSelected
                    ? theme.primaryLight
                    : 'transparent',
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${mode.label} mode (${mode.defaultMinutes} minutes)`}>
              <Text
                {...getTextA11yProps(1.2)}
                style={[
                  styles.modeTabText,
                  {
                    color: isSelected ? theme.primary : theme.textSecondary,
                    fontFamily: isSelected ? fontFamily.bold : fontFamily.regular,
                  },
                ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Display Timer */}
      <View style={styles.timerCenterContainer}>
        <View
          style={[
            styles.timerRingOuter,
            {
              borderColor:
                timerStatus === 'running'
                  ? theme.primary
                  : timerStatus === 'paused'
                  ? theme.warning
                  : theme.border,
              backgroundColor: theme.background,
            },
          ]}>
          <Text
            {...getTextA11yProps(1.3)}
            style={[styles.timerDigits, {color: theme.textPrimary}]}>
            {timeDisplay}
          </Text>
          <Text
            {...getTextA11yProps(1.2)}
            style={[styles.timerStatusLabel, {color: theme.textSecondary}]}>
            {timerStatus === 'running'
              ? 'Focusing'
              : timerStatus === 'paused'
              ? 'Paused'
              : timerStatus === 'completed'
              ? 'Completed! 🎉'
              : 'Ready'}
          </Text>
        </View>

        {/* Linear Progress Indicator */}
        <View style={[styles.progressTrack, {backgroundColor: theme.surfaceSecondary}]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor:
                  timerStatus === 'paused' ? theme.warning : theme.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Linked Task Banner */}
      {activeTask && (
        <View
          style={[
            styles.activeTaskBanner,
            {backgroundColor: theme.surfaceSecondary, borderColor: theme.border},
          ]}>
          <View style={{flex: 1}}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[styles.activeTaskPrefix, {color: theme.primary}]}>
              CURRENT FOCUS
            </Text>
            <Text
              {...getTextA11yProps(1.2)}
              numberOfLines={2}
              style={[styles.activeTaskTitle, {color: theme.textPrimary}]}>
              {activeTask.title}
            </Text>
          </View>
          {onCompleteTask && (
            <TouchableOpacity
              onPress={onCompleteTask}
              style={[styles.completeTaskBtn, {backgroundColor: theme.successLight}]}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${activeTask.title} as completed`}>
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.completeTaskBtnText, {color: theme.success}]}>
                ✓ Complete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsRow}>
        {timerStatus === 'idle' && (
          <TouchableOpacity
            onPress={() => startSession()}
            style={[styles.primaryActionBtn, {backgroundColor: theme.primary}]}
            accessibilityRole="button"
            accessibilityLabel="Start Focus Session">
            <Text
              {...getTextA11yProps(1.2)}
              style={styles.primaryActionBtnText}>
              ▶ Start Focus
            </Text>
          </TouchableOpacity>
        )}

        {timerStatus === 'running' && (
          <TouchableOpacity
            onPress={pauseSession}
            style={[styles.primaryActionBtn, {backgroundColor: theme.warning}]}
            accessibilityRole="button"
            accessibilityLabel="Pause Focus Session">
            <Text
              {...getTextA11yProps(1.2)}
              style={styles.primaryActionBtnText}>
              ⏸ Pause
            </Text>
          </TouchableOpacity>
        )}

        {timerStatus === 'paused' && (
          <View style={styles.pausedButtonsRow}>
            <TouchableOpacity
              onPress={resumeSession}
              style={[styles.dualActionBtn, {backgroundColor: theme.primary}]}
              accessibilityRole="button"
              accessibilityLabel="Resume Focus Session">
              <Text
                {...getTextA11yProps(1.2)}
                style={styles.primaryActionBtnText}>
                ▶ Resume
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetSession}
              style={[
                styles.dualActionBtn,
                {backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border},
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reset Focus Session">
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.dualActionSecondaryText, {color: theme.textSecondary}]}>
                ↺ Reset
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {timerStatus === 'completed' && (
          <TouchableOpacity
            onPress={resetSession}
            style={[styles.primaryActionBtn, {backgroundColor: theme.primary}]}
            accessibilityRole="button"
            accessibilityLabel="Start New Focus Session">
            <Text
              {...getTextA11yProps(1.2)}
              style={styles.primaryActionBtnText}>
              + Start Next Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: spacing.medium,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: spacing.small,
  },
  modeTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  modeTab: {
    paddingVertical: spacing.small - 2,
    paddingHorizontal: spacing.small + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeTabText: {
    fontSize: textScale(12),
  },
  timerCenterContainer: {
    alignItems: 'center',
    marginVertical: spacing.medium,
  },
  timerRingOuter: {
    width: moderateScale(190),
    height: moderateScale(190),
    borderRadius: moderateScale(95),
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.medium,
  },
  timerDigits: {
    fontSize: textScale(38),
    fontFamily: fontFamily.bold,
    letterSpacing: 1.5,
  },
  timerStatusLabel: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    marginTop: 4,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  activeTaskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium - 2,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: spacing.small,
  },
  activeTaskPrefix: {
    fontSize: textScale(10),
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  activeTaskTitle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
  },
  completeTaskBtn: {
    paddingVertical: spacing.small - 2,
    paddingHorizontal: spacing.small + 2,
    borderRadius: 8,
    marginLeft: spacing.small,
  },
  completeTaskBtnText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  controlsRow: {
    marginTop: spacing.small,
  },
  primaryActionBtn: {
    paddingVertical: spacing.medium - 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(15),
    fontFamily: fontFamily.bold,
  },
  pausedButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dualActionBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: spacing.medium - 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  dualActionSecondaryText: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
});

export default FocusTimer;

