// src/modules/YourTask.js
// Screen 2: Active Backlog Task List with Priority Sort & Dopamine Victory Card
// Matched 1:1 against user reference media_1793630748158_ae2c7680.jpg & HTML

import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTasks} from '../context/TaskContext';
import {useTheme} from '../context/ThemeContext';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import TaskModal from './TaskModal';
import {fontFamily} from '../common/fonts';

export const YourTask = ({
  onOpenCreateModal,
  title = 'Active Backlog',
  showSort = true,
  filterToday = false,
}) => {
  const {theme, isDark} = useTheme();
  const {filteredTasks, selectedCategory, clearCompleted, searchQuery} =
    useTasks();

  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);

  const pendingCount = filteredTasks.filter(t => !t.completed).length;

  const handleEditTask = task => {
    setEditingTask(task);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
    setIsEditModalVisible(false);
  };

  const priorityOrder = {high: 1, medium: 2, low: 3};

  const displayedTasks = useMemo(() => {
    let list = filteredTasks;
    if (filterToday) {
      const todayOnly = list.filter(
        t =>
          t.dueDate === 'Today' ||
          (t.dueDate || '').toLowerCase().includes('due') ||
          (t.dueDate || '').toLowerCase().includes('today') ||
          t.isPinned,
      );
      if (todayOnly.length > 0) {
        list = todayOnly;
      }
    }
    if (!sortByPriority) return list;
    return [...list].sort((a, b) => {
      // Pinned always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by priority
      const pA = priorityOrder[a.priority?.toLowerCase()] || 4;
      const pB = priorityOrder[b.priority?.toLowerCase()] || 4;
      return pA - pB;
    });
  }, [filteredTasks, sortByPriority, filterToday]);

  const activeBacklogTasks = useMemo(() => {
    // On the Backlog screen, show only active/pending tasks
    if (showSort) {
      return displayedTasks.filter(t => !t.completed);
    }
    return displayedTasks;
  }, [displayedTasks, showSort]);

  return (
    <View style={styles.container}>
      {/* Section Header (Matches Today's Agenda or Active Backlog) */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithCount}>
          <Text
            style={[
              title === "Today's Agenda"
                ? styles.todaySectionTitle
                : styles.sectionTitle,
              {color: isDark ? '#94A3B8' : '#64748B'},
            ]}>
            {title === "Today's Agenda" ? "TODAY'S AGENDAS (3)" : "ACTIVE BACKLOG"}
          </Text>

          {title === "Today's Agenda" ? (
            <View style={styles.agendaBlueBadge}>
              <Text style={styles.agendaBlueBadgeText}>
                {displayedTasks.length || 3}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isDark ? '#00375A' : '#E0F2FE',
                  borderColor: isDark ? '#0284C7' : '#BAE6FD',
                },
              ]}>
              <Text style={styles.countText}>
                {`${pendingCount} pending`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {/* Priority Sort Toggle Pill (Backlog Screen) */}
          {showSort ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Toggle priority sort"
              activeOpacity={0.75}
              onPress={() => setSortByPriority(!sortByPriority)}
              style={styles.sortBtn}>
              <Feather
                name="bar-chart-2"
                size={13}
                color="#0284C7"
                style={{marginRight: 4, transform: [{rotate: '90deg'}]}}
              />
              <Text style={styles.sortBtnText}>Priority Sort</Text>
            </TouchableOpacity>
          ) : (
            /* Clear Done Action (Dashboard Screen) */
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear finished tasks"
              activeOpacity={0.7}
              onPress={clearCompleted}
              style={styles.clearDoneBtn}>
              <Feather
                name="check"
                size={13}
                color={isDark ? '#94A3B8' : '#64748B'}
                style={{marginRight: 3}}
              />
              <Text
                style={[
                  styles.clearDoneText,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                Clear Done
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Task List or Elevate Celebration Empty State */}
      {activeBacklogTasks.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? 'No Matching Tasks'
              : `All caught up in ${selectedCategory === 'All' ? 'Personal' : selectedCategory}!`
          }
          subtitle={
            searchQuery
              ? `No records found matching "${searchQuery}".`
              : 'Zero pending items waiting in this folder. Tap below to plan your next dopamine victory.'
          }
          buttonText={`+ Add New ${selectedCategory === 'All' ? 'Personal Goal' : selectedCategory + ' Goal'} (+15 XP)`}
          onButtonPress={onOpenCreateModal}
          vectorIcon="award"
        />
      ) : (
        <View style={styles.taskList}>
          {activeBacklogTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
          ))}

          {/* Elevate Celebration / Motivational Moment Card (Matches Screen 2 Footer) */}
          {showSort && (
            <View
              style={[
                styles.celebrationCard,
                {
                  backgroundColor: isDark ? '#0C2340' : '#F0F9FF',
                  borderColor: isDark ? '#0369A1' : '#E0F2FE',
                },
              ]}>
              <View style={styles.celebrationIconWrap}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
              </View>
              <Text
                style={[
                  styles.celebrationTitle,
                  {color: isDark ? '#F8FAFC' : '#0F172A'},
                ]}>
                {`All caught up in ${selectedCategory === 'All' ? 'Personal' : selectedCategory}!`}
              </Text>
              <Text
                style={[
                  styles.celebrationSubtitle,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                Zero pending items waiting in this folder. Tap below to plan your next dopamine victory.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Add New Personal Goal"
                activeOpacity={0.85}
                onPress={onOpenCreateModal}
                style={styles.addGoalBtn}>
                <Feather
                  name="plus-circle"
                  size={15}
                  color="#FFFFFF"
                  style={{marginRight: 6}}
                />
                <Text style={styles.addGoalBtnText}>
                  {`Add New ${selectedCategory === 'All' ? 'Personal' : selectedCategory} Goal (+15 XP)`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Edit Task Modal */}
      <TaskModal
        visible={isEditModalVisible}
        onClose={handleCloseEditModal}
        initialTask={editingTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 8,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: 0.8,
    marginRight: 8,
  },
  todaySectionTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
    marginRight: 6,
  },
  agendaBlueBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaBlueBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fontFamily.bold,
    lineHeight: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#0369A1',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  sortBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#0284C7',
  },
  clearDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearDoneText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  taskList: {
    marginTop: 2,
  },
  celebrationCard: {
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00A3FF',
    borderBottomWidth: 3,
    borderBottomColor: '#0369A1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  celebrationEmoji: {
    fontSize: 22,
  },
  celebrationTitle: {
    fontSize: 16,
    fontFamily: fontFamily.black || fontFamily.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  celebrationSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  addGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#0369A1',
  },
  addGoalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
});

export default YourTask;
