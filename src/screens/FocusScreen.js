// src/screens/FocusScreen.js
// Distraction-Free Focus Mode Screen (docs/Design.md Section 10 & docs/PRD.md Phase 6 — P6.5, P6.6)

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {usePlanning} from '../context/PlanningContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {getTextA11yProps} from '../utility/accessibility';
import HemburgerButton from '../modules/HemburgerButton';
import FocusTimer from '../components/FocusTimer';

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
            Focus Mode
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSelectorVisible(true)}
          style={[styles.taskPickerBtn, {backgroundColor: theme.primaryLight}]}
          accessibilityRole="button"
          accessibilityLabel="Switch active focus task">
          <Text
            {...getTextA11yProps(1.2)}
            style={[styles.taskPickerBtnText, {color: theme.primary}]}>
            {activeTask ? 'Switch Task' : '+ Pick Task'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Today's Focus Stats Banner */}
        <View
          style={[
            styles.statsBanner,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}>
          <View style={styles.statItem}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[styles.statValue, {color: theme.primary}]}>
              {todayFocusMinutes}m
            </Text>
            <Text
              {...getTextA11yProps(1.2)}
              style={[styles.statLabel, {color: theme.textSecondary}]}>
              Today Focused
            </Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: theme.divider}]} />
          <View style={styles.statItem}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[styles.statValue, {color: theme.primary}]}>
              {todayFocusSessions.length}
            </Text>
            <Text
              {...getTextA11yProps(1.2)}
              style={[styles.statLabel, {color: theme.textSecondary}]}>
              Sessions Done
            </Text>
          </View>
        </View>

        {/* Main Focus Timer Component */}
        <FocusTimer onCompleteTask={activeTask ? completeActiveTask : null} />

        {/* Active Task Checklist preview (if task is selected) */}
        {activeTask && activeTask.subtasks && activeTask.subtasks.length > 0 && (
          <View
            style={[
              styles.checklistContainer,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}>
            <Text
              {...getTextA11yProps(1.2)}
              style={[styles.checklistHeader, {color: theme.textSecondary}]}>
              SUBTASKS CHECKLIST
            </Text>
            {activeTask.subtasks.map(subtask => (
              <TouchableOpacity
                key={subtask.id}
                onPress={() => toggleSubtask(activeTask.id, subtask.id)}
                style={styles.subtaskRow}
                accessibilityRole="checkbox"
                accessibilityState={{checked: subtask.completed}}>
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: subtask.completed
                        ? theme.primary
                        : theme.border,
                      backgroundColor: subtask.completed
                        ? theme.primary
                        : 'transparent',
                    },
                  ]}>
                  {subtask.completed && (
                    <Text style={styles.checkboxCheckmark}>✓</Text>
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
                    },
                  ]}>
                  {subtask.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

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
            <View style={styles.modalHeaderRow}>
              <Text
                {...getTextA11yProps(1.3)}
                style={[styles.modalTitle, {color: theme.textPrimary}]}>
                Select Task to Focus On
              </Text>
              <TouchableOpacity
                onPress={() => setSelectorVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close picker">
                <Text
                  {...getTextA11yProps(1.2)}
                  style={[styles.modalCloseText, {color: theme.textSecondary}]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setActiveTaskId(null);
                setSelectorVisible(false);
              }}
              style={[
                styles.taskPickRow,
                {backgroundColor: theme.background, borderColor: theme.border},
              ]}>
              <Text
                {...getTextA11yProps(1.2)}
                style={[styles.taskPickTitle, {color: theme.textSecondary}]}>
                Free Focus (No task linked)
              </Text>
            </TouchableOpacity>

            <FlatList
              data={todayTasks.length > 0 ? todayTasks : tasks.filter(t => !t.completed)}
              keyExtractor={item => item.id}
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
                          : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}>
                    <Text
                      {...getTextA11yProps(1.2)}
                      style={[
                        styles.taskPickTitle,
                        {
                          color: isSelected
                            ? theme.primary
                            : theme.textPrimary,
                          fontFamily: isSelected
                            ? fontFamily.bold
                            : fontFamily.medium,
                        },
                      ]}>
                      {item.title}
                    </Text>
                    {item.estimatedDuration ? (
                      <Text
                        {...getTextA11yProps(1.1)}
                        style={[styles.durationBadge, {color: theme.textSecondary}]}>
                        ⏱ {item.estimatedDuration}m
                      </Text>
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
  taskPickerBtn: {
    paddingVertical: spacing.small - 2,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
  },
  taskPickerBtnText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    padding: spacing.medium,
  },
  statsBanner: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.medium - 2,
    marginBottom: spacing.small,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: textScale(22),
    fontFamily: fontFamily.bold,
  },
  statLabel: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
  },
  checklistContainer: {
    padding: spacing.medium,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.small,
  },
  checklistHeader: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
    marginBottom: spacing.small,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small - 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.small,
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontWeight: 'bold',
  },
  subtaskTitle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    padding: spacing.medium,
    maxHeight: '75%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  modalTitle: {
    fontSize: textScale(17),
    fontFamily: fontFamily.bold,
  },
  modalCloseText: {
    fontSize: textScale(18),
    padding: spacing.small,
  },
  taskPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.small,
  },
  taskPickTitle: {
    fontSize: textScale(14),
    flex: 1,
  },
  durationBadge: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginLeft: spacing.small,
  },
});

export default FocusScreen;

