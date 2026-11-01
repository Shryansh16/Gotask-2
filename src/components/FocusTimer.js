// src/components/FocusTimer.js
// Focus Mode Timer Component (docs/Design.md Section 10 & docs/PRD.md Phase 6)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {usePlanning, TIMER_MODES} from '../context/PlanningContext';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {getTextA11yProps} from '../utility/accessibility';

export const FocusTimer = ({onCompleteTask}) => {
  const {theme} = useTheme();
  const {width} = useWindowDimensions();
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
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(
    2,
    '0',
  )}`;

  // Progress fraction (0 to 1)
  const totalSeconds = durationMinutes * 60;
  const progressFraction =
    totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const progressPercent = Math.min(100, Math.round(progressFraction * 100));

  const ringSize = Math.min(Math.max(width * 0.52, 180), 220);

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
                    fontFamily: isSelected
                      ? fontFamily.bold
                      : fontFamily.regular,
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
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
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
              ? 'Completed'
              : 'Ready'}
          </Text>
        </View>

        {/* Linear Progress Indicator */}
        <View
          style={[
            styles.progressTrack,
            {backgroundColor: theme.surfaceSecondary},
          ]}>
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
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
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
              style={[
                styles.completeTaskBtn,
                {backgroundColor: theme.primaryLight},
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${activeTask.title} as completed`}>
              <Feather
                name="check"
                size={14}
                color={theme.primary}
                style={{marginRight: 4}}
              />
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.completeTaskBtnText, {color: theme.primary}]}>
                Done
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
            <Feather
              name="play"
              size={16}
              color="#FFFFFF"
              style={{marginRight: 8}}
            />
            <Text
              {...getTextA11yProps(1.2)}
              style={styles.primaryActionBtnText}>
              Start Focus
            </Text>
          </TouchableOpacity>
        )}

        {timerStatus === 'running' && (
          <TouchableOpacity
            onPress={pauseSession}
            style={[styles.primaryActionBtn, {backgroundColor: theme.warning}]}
            accessibilityRole="button"
            accessibilityLabel="Pause Focus Session">
            <Feather
              name="pause"
              size={16}
              color="#FFFFFF"
              style={{marginRight: 8}}
            />
            <Text
              {...getTextA11yProps(1.2)}
              style={styles.primaryActionBtnText}>
              Pause
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
              <Feather
                name="play"
                size={16}
                color="#FFFFFF"
                style={{marginRight: 6}}
              />
              <Text
                {...getTextA11yProps(1.2)}
                style={styles.primaryActionBtnText}>
                Resume
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetSession}
              style={[
                styles.dualActionBtn,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reset Focus Session">
              <Feather
                name="rotate-ccw"
                size={15}
                color={theme.textSecondary}
                style={{marginRight: 6}}
              />
              <Text
                {...getTextA11yProps(1.2)}
                style={[
                  styles.dualActionSecondaryText,
                  {color: theme.textSecondary},
                ]}>
                Reset
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
            <Feather
              name="plus"
              size={16}
              color="#FFFFFF"
              style={{marginRight: 6}}
            />
            <Text
              {...getTextA11yProps(1.2)}
              style={styles.primaryActionBtnText}>
              Start Next Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    marginVertical: spacing.small,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  modeTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  modeTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabText: {
    fontSize: 12,
  },
  timerCenterContainer: {
    alignItems: 'center',
    marginVertical: spacing.medium,
  },
  timerRingOuter: {
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.medium,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  timerDigits: {
    fontSize: 44,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.5,
  },
  timerStatusLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    marginTop: 4,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  activeTaskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium - 2,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: spacing.small,
  },
  activeTaskPrefix: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  activeTaskTitle: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
  },
  completeTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small - 3,
    paddingHorizontal: spacing.small + 4,
    borderRadius: 6,
    marginLeft: spacing.small,
    minHeight: 32,
  },
  completeTaskBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  controlsRow: {
    marginTop: spacing.small,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    paddingVertical: spacing.medium - 2,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#0082CC',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  pausedButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dualActionBtn: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 4,
    paddingVertical: spacing.medium - 2,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#0082CC',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  dualActionSecondaryText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
});

export default FocusTimer;
