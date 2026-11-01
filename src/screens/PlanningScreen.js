// src/screens/PlanningScreen.js
// Daily Planning and Time Management Screen (docs/PRD.md Phase 6 — P6.1, P6.2, P6.3, P6.7, P6.8)

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {usePlanning} from '../context/PlanningContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {getTextA11yProps} from '../utility/accessibility';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';
import ElevateQuests from '../components/ElevateQuests';

const DURATION_PRESETS = [15, 25, 45, 60];

export const PlanningScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {toggleTaskComplete, stats} = useTasks();
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
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title="Daily Planning"
        subtitle="Manage daily workload & timeline"
        navigation={navigation}
        rightAction={{
          icon: 'clock',
          label: 'Focus',
          onPress: () => navigation.navigate('FocusScreen'),
          accessibilityLabel: 'Open Focus Mode',
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Elevate Daily Quests System (Image 2) */}
        <ElevateQuests
          completedTasksCount={stats?.completed || 0}
          streakDays={stats?.streak || 1}
          focusSessionsCount={stats?.streak > 0 ? 1 : 0}
          onPressQuest={() => {}}
        />

        {/* Elevate Capacity Hero */}
        <View
          style={[
            styles.capacityCard,
            {
              backgroundColor: theme.primary,
            },
            theme.cardShadow,
          ]}>
          <View style={styles.capacityHeroHeader}>
            <View style={styles.heroBadge}>
              <Feather name="activity" size={13} color="#FEF08A" style={{marginRight: 5}} />
              <Text style={styles.heroBadgeText}>PLANNED CAPACITY</Text>
            </View>
            <View style={styles.capacityNumbersCol}>
              <Text
                {...getTextA11yProps(1.3)}
                style={styles.capacityMinsText}>
                {todayEstimatedMinutes}m
                <Text style={styles.capacityLimitText}> / {dailyCapacityMinutes}m</Text>
              </Text>
            </View>
          </View>

          <Text
            {...getTextA11yProps(1.1)}
            style={[
              styles.capacitySubtitle,
              {
                color: workloadAnalysis.isOverloaded
                  ? '#FECACA'
                  : 'rgba(255, 255, 255, 0.85)',
              },
            ]}>
            {workloadAnalysis.message}
          </Text>

          {/* Progress Bar */}
          <View
            style={[
              styles.capacityProgressBar,
              {backgroundColor: 'rgba(255, 255, 255, 0.22)'},
            ]}>
            <View
              style={[
                styles.capacityProgressFill,
                {
                  width: `${capacityPercent}%`,
                  backgroundColor: workloadAnalysis.isOverloaded
                    ? '#EF4444'
                    : '#10B981',
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
              {
                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.12)' : '#FEF3C7',
                borderColor: theme.warning,
              },
            ]}>
            <View style={{flex: 1, marginRight: spacing.small}}>
              <View style={styles.overdueTitleRow}>
                <Feather
                  name="alert-circle"
                  size={15}
                  color={theme.warning}
                  style={{marginRight: 6}}
                />
                <Text
                  {...getTextA11yProps(1.2)}
                  style={[styles.overdueBannerTitle, {color: theme.warning}]}>
                  {overdueTasks.length} Unfinished Tasks
                </Text>
              </View>
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
                Plan Today
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Filter Tabs — Elevate 3D Tactile Pills */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Today tasks, ${todayTasks.length} items`}
            onPress={() => setActiveTab('today')}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  activeTab === 'today'
                    ? isDark ? '#1E1B4B' : '#EEF2FF'
                    : isDark ? '#1E293B' : '#F8FAFC',
                borderColor:
                  activeTab === 'today'
                    ? '#4F46E5'
                    : isDark ? '#334155' : '#E2E8F0',
                borderBottomColor:
                  activeTab === 'today'
                    ? '#3730A3'
                    : isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[
                styles.tabBtnText,
                {
                  color:
                    activeTab === 'today' ? '#4F46E5' : theme.textSecondary,
                  fontFamily:
                    activeTab === 'today' ? fontFamily.bold : fontFamily.medium,
                },
              ]}>
              Today ({todayTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Overdue tasks, ${overdueTasks.length} items`}
            onPress={() => setActiveTab('overdue')}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  activeTab === 'overdue'
                    ? isDark ? '#2C1515' : '#FEF2F2'
                    : isDark ? '#1E293B' : '#F8FAFC',
                borderColor:
                  activeTab === 'overdue'
                    ? '#EF4444'
                    : isDark ? '#334155' : '#E2E8F0',
                borderBottomColor:
                  activeTab === 'overdue'
                    ? '#991B1B'
                    : isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[
                styles.tabBtnText,
                {
                  color:
                    activeTab === 'overdue' ? '#EF4444' : theme.textSecondary,
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
            accessibilityRole="button"
            accessibilityLabel={`Upcoming tasks, ${upcomingTasks.length} items`}
            onPress={() => setActiveTab('upcoming')}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  activeTab === 'upcoming'
                    ? isDark ? '#0C4A6E' : '#F0F9FF'
                    : isDark ? '#1E293B' : '#F8FAFC',
                borderColor:
                  activeTab === 'upcoming'
                    ? '#0284C7'
                    : isDark ? '#334155' : '#E2E8F0',
                borderBottomColor:
                  activeTab === 'upcoming'
                    ? '#075985'
                    : isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[
                styles.tabBtnText,
                {
                  color:
                    activeTab === 'upcoming' ? '#0284C7' : theme.textSecondary,
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
                icon="check-circle"
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
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{checked: task.completed}}
                      accessibilityLabel={`Mark ${task.title} ${
                        task.completed ? 'incomplete' : 'complete'
                      }`}>
                      {task.completed && (
                        <Feather name="check" size={13} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <View style={{flex: 1, marginLeft: spacing.small}}>
                      <Text
                        {...getTextA11yProps(1.2)}
                        style={[
                          styles.planningTaskTitle,
                          {
                            color: task.completed
                              ? theme.textMuted
                              : theme.textPrimary,
                            textDecorationLine: task.completed
                              ? 'line-through'
                              : 'none',
                          },
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
                      <Feather
                        name="play"
                        size={11}
                        color={theme.primary}
                        style={{marginRight: 4}}
                      />
                      <Text
                        {...getTextA11yProps(1.1)}
                        style={[
                          styles.focusTaskActionBtnText,
                          {color: theme.primary},
                        ]}>
                        Focus
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Duration Presets Selector (P6.2) */}
                  <View
                    style={[
                      styles.durationSelectorRow,
                      {borderColor: theme.divider},
                    ]}>
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

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="quests" navigation={navigation} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: 120, // Clearance for ElevateTabBar
  },
  capacityCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 5, // Elevate 3D bevel
  },
  capacityHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  capacitySubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    marginTop: 2,
    marginBottom: 12,
  },
  capacityNumbersCol: {
    alignItems: 'flex-end',
  },
  capacityMinsText: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  capacityLimitText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(255, 255, 255, 0.75)',
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
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderLeftColor: '#EF4444',
    padding: 16,
    marginBottom: spacing.medium,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  overdueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  overdueBannerTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  overdueBannerSub: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  batchRescheduleBtn: {
    paddingVertical: spacing.small - 2,
    paddingHorizontal: spacing.small + 4,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchRescheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 13,
  },
  taskListContainer: {
    paddingBottom: 120, // Full clearance for navigation
  },
  planningTaskCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 4, // Elevate 3D tactile bevel
    borderLeftWidth: 6,
    borderLeftColor: '#4F46E5',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planningTaskTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  planningTaskCat: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  focusTaskActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 34,
  },
  focusTaskActionBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  durationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  durationLabel: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    marginRight: spacing.small,
  },
  durationChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 6,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationChipText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  rescheduleRow: {
    flexDirection: 'row',
  },
  rescheduleActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 6,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescheduleActionBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
});

export default PlanningScreen;
