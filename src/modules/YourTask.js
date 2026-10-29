// src/modules/YourTask.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTasks} from '../context/TaskContext';
import {useTheme} from '../context/ThemeContext';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import TaskModal from './TaskModal';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const YourTask = ({onOpenCreateModal}) => {
  const {theme} = useTheme();
  const {filteredTasks, selectedCategory, clearCompleted, searchQuery} =
    useTasks();

  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const hasCompleted = filteredTasks.some(t => t.completed);

  const handleEditTask = task => {
    setEditingTask(task);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithCount}>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            {selectedCategory === 'All'
              ? 'Your Tasks'
              : `${selectedCategory} Tasks`}
          </Text>
          <View
            style={[styles.countBadge, {backgroundColor: theme.primaryLight}]}>
            <Text style={[styles.countText, {color: theme.primary}]}>
              {filteredTasks.length}
            </Text>
          </View>
        </View>

        {hasCompleted && (
          <TouchableOpacity onPress={clearCompleted} style={styles.clearBtn}>
            <Text style={[styles.clearBtnText, {color: theme.danger}]}>
              Clear Done
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task List or Empty State */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={searchQuery ? '🔍' : '📝'}
          title={searchQuery ? 'No Matching Tasks' : 'All Tasks Completed!'}
          subtitle={
            searchQuery
              ? `No tasks found matching "${searchQuery}". Try different keywords.`
              : 'Add your next goal or to-do item to keep your momentum going!'
          }
          buttonText="+ Add New Task"
          onButtonPress={onOpenCreateModal}
        />
      ) : (
        <View style={styles.taskList}>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
          ))}
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
    paddingHorizontal: spacing.PADDING_16,
    marginTop: spacing.MARGIN_10,
    paddingBottom: spacing.PADDING_40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_12,
  },
  titleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  taskList: {
    marginTop: spacing.MARGIN_4,
  },
});

export default YourTask;
