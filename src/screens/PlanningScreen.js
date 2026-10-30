// src/screens/PlanningScreen.js
// Daily Planning and Time Management Screen (docs/PRD.md Phase 6 — P6.1, P6.2, P6.3, P6.7, P6.8)

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {usePlanning} from '../context/PlanningContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {getTextA11yProps} from '../utility/accessibility';
import HemburgerButton from '../modules/HemburgerButton';
import EmptyState from '../components/EmptyState';

const DURATION_PRESETS = [15, 25, 45, 60];

export const PlanningScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {toggleTaskComplete} = useTasks();
  const {
    todayTasks,
    upcomingTasks,
    overdueTasks,
    todayEstimatedMinutes,
    dailyCapacityMinutes,
    workloadAnalysis,
    setTaskDuration,
    rescheduleTask,
    batchRescheduleOverdue,
    startSession,
  } = usePlanning();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'overdue' | 'upcoming'

  const handleStartFocus = task => {
    startSession(task.id);
    navigation.navigate('FocusScreen');
  };

  const capacityRatio = Math.min(
    1,
    todayEstimatedMinutes / (dailyCapacityMinutes || 480),
  );
  const capacityPercent = Math.round(capacityRatio * 100);

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.background}]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={[styles.headerRow, {borderColor: theme.border}]}>
        <HemburgerButton navigation={navigation} />
        <View style={styles.headerTitleContainer}>
          <Text
            {...getTextA11yProps(1.3)}
            style={[styles.headerTitle, {color: theme.textPrimary}]}>
            Daily Planning
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('FocusScreen')}
          style={[styles.quickFocusBtn, {backgroundColor: theme.primary}]}
          accessibilityRole="button"
          accessibilityLabel="Open Focus Mode">
          <Text
            {...getTextA11yProps(1.2)}
            style={styles.quickFocusBtnText}>
            ⏱ Focus
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Workload Capacity Card (P6.8) */}
        <View
          style={[
            styles.capacityCard,
            {
              backgroundColor: theme.surface,
              borderColor: workloadAnalysis.isOverloaded
                ? theme.danger
                : theme.border,
            },
          ]}>
          <View style={styles.capacityHeaderRow}>
            <View>
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.capacityTitle, {color: theme.textPrimary}]}>
                Today's Planned Load
              </Text>
              <Text
                {...getTextA11yProps(1.2)}
                style={[
                  styles.capacitySubtitle,
                  {
                    color: workloadAnalysis.isOverloaded
                      ? theme.danger
                      : theme.textSecondary,
                  },
                ]}>
                {workloadAnalysis.message}
              </Text>
            </View>
            <View style={styles.capacityNumbersCol}>
              <Text
                {...getTextA11yProps(1.3)}
                style={[
                  styles.capacityMinsText,
                  {
                    color: workloadAnalysis.isOverloaded
                      ? theme.danger
                      : theme.primary,
                  },
                ]}>
                {todayEstimatedMinutes}m
              </Text>
              <Text
                {...getTextA11yProps(1.1)}
                style={[styles.capacityLimitText, {color: theme.textMuted}]}>
                / {dailyCapacityMinutes}m max
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.capacityProgressBar,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <View
              style={[
                styles.capacityProgressFill,
                {
                  width: `${capacityPercent}%`,
                  backgroundColor: workloadAnalysis.isOverloaded
                    ? theme.danger
                    : theme.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Overdue Alert Banner with Batch Action (P6.7) */}
        {overdueTasks.length > 0 && (
          <View
            style={[
              styles.overdueBanner,
              {backgroundColor: theme.warningLight, borderColor: theme.warning},
            ]}>
            <View style={{flex: 1}}>
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.overdueBannerTitle, {color: theme.warning}]}>
                ⚠️ {overdueTasks.length} Unfinished Tasks
              </Text>
              <Text
                {...getTextA11yProps(1.1)}
                style={[styles.overdueBannerSub, {color: theme.textSecondary}]}>
                Reschedule to keep your daily plan realistic.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => batchRescheduleOverdue('Today')}
              style={[
                styles.batchRescheduleBtn,
                {backgroundColor: theme.warning},
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reschedule all overdue tasks to Today">
              <Text
                {...getTextA11yProps(1.2)}
                style={styles.batchRescheduleBtnText}>
                Plan for Today
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Filter Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('today')}
            style={[
              styles.tabBtn,
              {
                borderBottomColor:
                  activeTab === 'today' ? theme.primary : 'transparent',
              },
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[
                styles.tabBtnText,
                {
                  color:
                    activeTab === 'today'
                      ? theme.primary
                      : theme.textSecondary,
                  fontFamily:
                    activeTab === 'today' ? fontFamily.bold : fontFamily.medium,
                },
              ]}>
              Today ({todayTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('overdue')}
            style={[
              styles.tabBtn,
              {
                borderBottomColor:
                  activeTab === 'overdue' ? theme.primary : 'transparent',
              },
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[
                styles.tabBtnText,
                {
                  color:
                    activeTab === 'overdue'
                      ? theme.primary
                      : theme.textSecondary,
                  fontFamily:
                    activeTab === 'overdue'
                      ? fontFamily.bold
                      : fontFamily.medium,
                },
              ]}>
              Overdue ({overdueTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('upcoming')}
            style={[
              styles.tabBtn,
              {
                borderBottomColor:
                  activeTab === 'upcoming' ? theme.primary : 'transparent',
              },
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[
                styles.tabBtnText,
                {
                  color:
                    activeTab === 'upcoming'
                      ? theme.primary
                      : theme.textSecondary,
                  fontFamily:
                    activeTab === 'upcoming'
                      ? fontFamily.bold
                      : fontFamily.medium,
                },
              ]}>
              Upcoming ({upcomingTasks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Tab Content */}
        {activeTab === 'today' && (
          <View style={styles.taskListContainer}>
            {todayTasks.length === 0 ? (
              <EmptyState
                icon="calendar-check"
                title="All Planned Work Complete"
                message="No more tasks planned for today. Enjoy your progress or add a task!"
              />
            ) : (
              todayTasks.map(task => (
                <View
                  key={task.id}
                  style={[
                    styles.planningTaskCard,
                    {backgroundColor: theme.surface, borderColor: theme.border},
                  ]}>
                  <View style={styles.taskCardTop}>
                    <TouchableOpacity
                      onPress={() => toggleTaskComplete(task.id)}
                      style={[
                        styles.checkCircle,
                        {
                          borderColor: task.completed
                            ? theme.primary
                            : theme.border,
                          backgroundColor: task.completed
                            ? theme.primary
                            : 'transparent',
                        },
                      ]}>
                      {task.completed && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>
                    <View style={{flex: 1, marginLeft: spacing.small}}>
                      <Text
                        {...getTextA11yProps(1.2)}
                        style={[
                          styles.planningTaskTitle,
                          {color: theme.textPrimary},
                        ]}>
                        {task.title}
                      </Text>
                      {task.category ? (
                        <Text
                          {...getTextA11yProps(1.1)}
                          style={[
                            styles.planningTaskCat,
                            {color: theme.textSecondary},
                          ]}>
                          {task.category}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleStartFocus(task)}
                      style={[
                        styles.focusTaskActionBtn,
                        {backgroundColor: theme.primaryLight},
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Start focus session for ${task.title}`}>
                      <Text
                        {...getTextA11yProps(1.1)}
                        style={[
                          styles.focusTaskActionBtnText,
                          {color: theme.primary},
                        ]}>
                        Focus ▶
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Duration Presets Selector (P6.2) */}
                  <View style={styles.durationSelectorRow}>
                    <Text
                      {...getTextA11yProps(1.1)}
                      style={[
                        styles.durationLabel,
                        {color: theme.textSecondary},
                      ]}>
                      Estimate:
                    </Text>
                    {DURATION_PRESETS.map(mins => {
                      const isSelected =
                        (task.estimatedDuration || 25) === mins;
                      return (
                        <TouchableOpacity
                          key={mins}
                          onPress={() => setTaskDuration(task.id, mins)}
                          style={[
                            styles.durationChip,
                            {
                              backgroundColor: isSelected
                                ? theme.primary
                                : theme.surfaceSecondary,
                            },
                          ]}>
                          <Text
                            {...getTextA11yProps(1.1)}
                            style={[
                              styles.durationChipText,
                              {
                                color: isSelected
                                  ? '#FFFFFF'
                                  : theme.textSecondary,
                                fontFamily: isSelected
                                  ? fontFamily.bold
                                  : fontFamily.regular,
                              },
                            ]}>
                            {mins}m
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'overdue' && (
          <View style={styles.taskListContainer}>
            {overdueTasks.length === 0 ? (
              <EmptyState
                icon="smile"
                title="No Overdue Tasks"
                message="You are fully on schedule. Great job!"
              />
            ) : (
              overdueTasks.map(task => (
                <View
                  key={task.id}
                  style={[
                    styles.planningTaskCard,
                    {backgroundColor: theme.surface, borderColor: theme.border},
                  ]}>
                  <View style={styles.taskCardTop}>
                    <View style={{flex: 1}}>
                      <Text
                        {...getTextA11yProps(1.2)}
                        style={[
                          styles.planningTaskTitle,
                          {color: theme.textPrimary},
                        ]}>
                        {task.title}
                      </Text>
                      <Text
                        {...getTextA11yProps(1.1)}
                        style={[styles.planningTaskCat, {color: theme.danger}]}>
                        Overdue ({task.dueDate || 'Past due'})
                      </Text>
                    </View>
                    <View style={styles.rescheduleRow}>
                      <TouchableOpacity
                        onPress={() => rescheduleTask(task.id, 'Today')}
                        style={[
                          styles.rescheduleActionBtn,
                          {backgroundColor: theme.primaryLight},
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Move to Today">
                        <Text
                          {...getTextA11yProps(1.1)}
                          style={[
                            styles.rescheduleActionBtnText,
                            {color: theme.primary},
                          ]}>
                          Today
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => rescheduleTask(task.id, 'Tomorrow')}
                        style={[
                          styles.rescheduleActionBtn,
                          {backgroundColor: theme.surfaceSecondary},
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Move to Tomorrow">
                        <Text
                          {...getTextA11yProps(1.1)}
                          style={[
                            styles.rescheduleActionBtnText,
                            {color: theme.textSecondary},
                          ]}>
                          Tomorrow
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'upcoming' && (
          <View style={styles.taskListContainer}>
            {upcomingTasks.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No Upcoming Tasks"
                message="No future tasks scheduled. Plan ahead by adding due dates!"
              />
            ) : (
              upcomingTasks.map(task => (
                <View
                  key={task.id}
                  style={[
                    styles.planningTaskCard,
                    {backgroundColor: theme.surface, borderColor: theme.border},
                  ]}>
                  <View style={styles.taskCardTop}>
                    <View style={{flex: 1}}>
                      <Text
                        {...getTextA11yProps(1.2)}
                        style={[
                          styles.planningTaskTitle,
                          {color: theme.textPrimary},
                        ]}>
                        {task.title}
                      </Text>
                      <Text
                        {...getTextA11yProps(1.1)}
                        style={[
                          styles.planningTaskCat,
                          {color: theme.textSecondary},
                        ]}>
                        Scheduled: {task.dueDate}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => rescheduleTask(task.id, 'Today')}
                      style={[
                        styles.rescheduleActionBtn,
                        {backgroundColor: theme.primaryLight},
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Bring task to Today">
                      <Text
                        {...getTextA11yProps(1.1)}
                        style={[
                          styles.rescheduleActionBtnText,
                          {color: theme.primary},
                        ]}>
                        Pull to Today
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.small,
  },
  headerTitle: {
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
  },
  quickFocusBtn: {
    paddingVertical: spacing.small - 2,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
  },
  quickFocusBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    padding: spacing.medium,
  },
  capacityCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  capacityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  capacityTitle: {
    fontSize: textScale(15),
    fontFamily: fontFamily.bold,
  },
  capacitySubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  capacityNumbersCol: {
    alignItems: 'flex-end',
  },
  capacityMinsText: {
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
  },
  capacityLimitText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
  capacityProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.small,
  },
  capacityProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  overdueBannerTitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  overdueBannerSub: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  batchRescheduleBtn: {
    paddingVertical: spacing.small - 2,
    paddingHorizontal: spacing.small + 2,
    borderRadius: 8,
    marginLeft: spacing.small,
  },
  batchRescheduleBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E1E5EA',
    marginBottom: spacing.medium,
  },
  tabBtn: {
    paddingVertical: spacing.small + 2,
    paddingHorizontal: spacing.medium,
    borderBottomWidth: 2,
    marginRight: spacing.small,
  },
  tabBtnText: {
    fontSize: textScale(13),
  },
  taskListContainer: {
    paddingBottom: spacing.large,
  },
  planningTaskCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: textScale(12),
    fontWeight: 'bold',
  },
  planningTaskTitle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
  },
  planningTaskCat: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  focusTaskActionBtn: {
    paddingVertical: spacing.small - 3,
    paddingHorizontal: spacing.small + 2,
    borderRadius: 8,
  },
  focusTaskActionBtnText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  durationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.small + 2,
    paddingTop: spacing.small - 2,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  durationLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginRight: spacing.small,
  },
  durationChip: {
    paddingVertical: 2,
    paddingHorizontal: spacing.small,
    borderRadius: 10,
    marginRight: 6,
  },
  durationChipText: {
    fontSize: textScale(11),
  },
  rescheduleRow: {
    flexDirection: 'row',
  },
  rescheduleActionBtn: {
    paddingVertical: spacing.small - 3,
    paddingHorizontal: spacing.small,
    borderRadius: 6,
    marginLeft: 6,
  },
  rescheduleActionBtnText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
});

export default PlanningScreen;

