// src/screens/FocusScreen.js
// Distraction-Free Focus Mode Screen (docs/Design.md Section 10 & docs/PRD.md Phase 6 — P6.5, P6.6)

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
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
import FocusTimer from '../components/FocusTimer';
import ElevateTabBar from '../components/ElevateTabBar';
import ElevateRecommendedPath from '../components/ElevateRecommendedPath';

export const FocusScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {tasks, toggleSubtask} = useTasks();
  const {
    activeTaskId,
    setActiveTaskId,
    activeTask,
    completeActiveTask,
    todayFocusMinutes,
    todayFocusSessions,
    todayTasks,
  } = usePlanning();

  const [selectorVisible, setSelectorVisible] = useState(false);

  const handleSelectTask = task => {
    setActiveTaskId(task.id);
    setSelectorVisible(false);
  };

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title="Focus Mode"
        subtitle="Distraction-free deep work session"
        navigation={navigation}
        rightAction={{
          icon: activeTask ? 'refresh-cw' : 'plus',
          label: activeTask ? 'Switch' : 'Pick Task',
          onPress: () => setSelectorVisible(true),
          accessibilityLabel: 'Switch active focus task',
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Elevate Deep Focus Hero */}
        <View
          style={[
            styles.focusHero,
            {backgroundColor: theme.primary},
            theme.cardShadow,
          ]}>
          <View style={styles.focusHeroHeader}>
            <View style={styles.heroBadge}>
              <Feather name="zap" size={13} color="#FEF08A" style={{marginRight: 5}} />
              <Text style={styles.heroBadgeText}>DEEP WORK PULSE</Text>
            </View>
            <View style={styles.heroTargetIndicator}>
              <Feather name="activity" size={14} color="#A7F3D0" />
            </View>
          </View>

          <View style={styles.heroTilesRow}>
            <View style={styles.heroTile}>
              <Text
                {...getTextA11yProps(1.2)}
                style={styles.heroTileNumber}>
                {todayFocusMinutes}
                <Text style={styles.heroTileUnit}>m</Text>
              </Text>
              <Text
                {...getTextA11yProps(1.1)}
                style={styles.heroTileLabel}>
                Focused Today
              </Text>
            </View>

            <View style={styles.heroTileDivider} />

            <View style={styles.heroTile}>
              <Text
                {...getTextA11yProps(1.2)}
                style={styles.heroTileNumber}>
                {todayFocusSessions.length}
              </Text>
              <Text
                {...getTextA11yProps(1.1)}
                style={styles.heroTileLabel}>
                Sessions Done
              </Text>
            </View>
          </View>
        </View>

        {/* Main Focus Timer Component */}
        <FocusTimer onCompleteTask={activeTask ? completeActiveTask : null} />

        {/* Active Task Checklist preview (if task is selected) */}
        {activeTask &&
          activeTask.subtasks &&
          activeTask.subtasks.length > 0 && (
            <View
              style={[
                styles.checklistContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderLeftColor: theme.primary,
                  borderLeftWidth: 5,
                },
                theme.cardShadow,
              ]}>
              <View style={styles.checklistHeaderRow}>
                <View
                  style={[
                    styles.checklistMedallion,
                    {backgroundColor: theme.primaryLight},
                  ]}>
                  <Feather name="check-square" size={14} color={theme.primary} />
                </View>
                <Text
                  {...getTextA11yProps(1.1)}
                  style={[styles.checklistHeader, {color: theme.textSecondary}]}>
                  SUBTASKS BREAKDOWN
                </Text>
              </View>
              {activeTask.subtasks.map(subtask => (
                <TouchableOpacity
                  key={subtask.id}
                  activeOpacity={0.8}
                  onPress={() => toggleSubtask(activeTask.id, subtask.id)}
                  style={[
                    styles.subtaskRow,
                    {
                      backgroundColor: subtask.completed
                        ? theme.surfaceSecondary
                        : 'transparent',
                    },
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked: subtask.completed}}
                  accessibilityLabel={`Mark subtask ${subtask.title} as ${
                    subtask.completed ? 'incomplete' : 'complete'
                  }`}>
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        borderColor: subtask.completed
                          ? theme.primary
                          : theme.border,
                        backgroundColor: subtask.completed
                          ? theme.primary
                          : theme.surfaceSecondary,
                      },
                    ]}>
                    {subtask.completed && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    {...getTextA11yProps(1.2)}
                    style={[
                      styles.subtaskTitle,
                      {
                        color: subtask.completed
                          ? theme.textMuted
                          : theme.textPrimary,
                        textDecorationLine: subtask.completed
                          ? 'line-through'
                          : 'none',
                        fontFamily: subtask.completed
                          ? fontFamily.regular
                          : fontFamily.medium,
                      },
                    ]}>
                    {subtask.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* Elevate Science-Backed Focus Benefits Card */}
        <View
          style={[
            styles.benefitsCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          <View style={styles.benefitsHeaderRow}>
            <View style={styles.benefitsIconBadge}>
              <Feather name="award" size={14} color="#00A3FF" />
            </View>
            <Text style={[styles.benefitsTitle, {color: theme.textPrimary}]}>
              FOCUS SESSION BENEFITS
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkPill}>
              <Feather name="check" size={12} color="#10B981" />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitHeadline, {color: theme.textPrimary}]}>
                Cognitive Flow State
              </Text>
              <Text style={[styles.benefitDesc, {color: theme.textSecondary}]}>
                Eliminating interruptions boosts task completion speed by 2.4x.
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkPill}>
              <Feather name="check" size={12} color="#10B981" />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitHeadline, {color: theme.textPrimary}]}>
                Fatigue Prevention
              </Text>
              <Text style={[styles.benefitDesc, {color: theme.textSecondary}]}>
                Structured 5-minute pauses restore working memory and visual focus.
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkPill}>
              <Feather name="check" size={12} color="#10B981" />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitHeadline, {color: theme.textPrimary}]}>
                Streak & Level XP
              </Text>
              <Text style={[styles.benefitDesc, {color: theme.textSecondary}]}>
                Each completed interval awards +50 XP towards your Emerald league rank.
              </Text>
            </View>
          </View>
        </View>

        {/* Elevate Recommended Focus Workout Path (Image 1) */}
        <ElevateRecommendedPath
          tasks={tasks.filter(t => !t.completed)}
          onSelectTask={handleSelectTask}
        />
      </ScrollView>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="focus" navigation={navigation} />

      {/* Task Picker Modal */}
      <Modal
        visible={selectorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectorVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeaderRow}>
              <Text
                {...getTextA11yProps(1.3)}
                style={[styles.modalTitle, {color: theme.textPrimary}]}>
                Select Task to Focus On
              </Text>
              <TouchableOpacity
                onPress={() => setSelectorVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close picker"
                style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setActiveTaskId(null);
                setSelectorVisible(false);
              }}
              style={[
                styles.taskPickRow,
                {backgroundColor: theme.surfaceSecondary, borderColor: theme.border},
              ]}>
              <View
                style={[
                  styles.pickIconMedallion,
                  {backgroundColor: theme.primaryLight},
                ]}>
                <Feather name="compass" size={16} color={theme.primary} />
              </View>
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.taskPickTitle, {color: theme.textSecondary}]}>
                Free Focus (No task linked)
              </Text>
            </TouchableOpacity>

            <FlatList
              data={
                todayTasks.length > 0
                  ? todayTasks
                  : tasks.filter(t => !t.completed)
              }
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => {
                const isSelected = activeTaskId === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectTask(item)}
                    style={[
                      styles.taskPickRow,
                      {
                        backgroundColor: isSelected
                          ? theme.primaryLight
                          : theme.surfaceSecondary,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}>
                    <View
                      style={[
                        styles.pickIconMedallion,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.surface,
                        },
                      ]}>
                      <Feather
                        name={isSelected ? 'check' : 'circle'}
                        size={14}
                        color={isSelected ? '#FFFFFF' : theme.textMuted}
                      />
                    </View>
                    <Text
                      {...getTextA11yProps(1.2)}
                      style={[
                        styles.taskPickTitle,
                        {
                          color: isSelected ? theme.primary : theme.textPrimary,
                          fontFamily: isSelected
                            ? fontFamily.bold
                            : fontFamily.medium,
                        },
                      ]}>
                      {item.title}
                    </Text>
                    {item.estimatedDuration ? (
                      <View
                        style={[
                          styles.durationBadge,
                          {backgroundColor: theme.surface},
                        ]}>
                        <Feather
                          name="clock"
                          size={11}
                          color={theme.textSecondary}
                          style={{marginRight: 4}}
                        />
                        <Text
                          {...getTextA11yProps(1.1)}
                          style={[
                            styles.durationBadgeText,
                            {color: theme.textSecondary},
                          ]}>
                          {item.estimatedDuration}m
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{padding: spacing.medium, alignItems: 'center'}}>
                  <Text
                    {...getTextA11yProps(1.2)}
                    style={{color: theme.textSecondary}}>
                    No active tasks found.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: 120, // Full bottom clearance
  },
  focusHero: {
    borderRadius: 22,
    padding: 16,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 5, // Elevate 3D bevel
  },
  focusHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  heroTargetIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  heroTile: {
    flex: 1,
    alignItems: 'center',
  },
  heroTileDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTileNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: fontFamily.bold,
  },
  heroTileUnit: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroTileLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  checklistContainer: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: spacing.medium,
  },
  checklistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistMedallion: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checklistHeader: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
    minHeight: 44,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subtaskTitle: {
    fontSize: 14,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  modalGrabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150, 150, 150, 0.35)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    minHeight: 52,
  },
  pickIconMedallion: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskPickTitle: {
    fontSize: 14,
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: spacing.small,
  },
  durationBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  benefitsCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    marginTop: spacing.medium,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  benefitsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  benefitsIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 163, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  benefitsTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitHeadline: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    lineHeight: 17,
  },
});

export default FocusScreen;
