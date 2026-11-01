// src/modules/YourTask.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTasks} from '../context/TaskContext';
import {useTheme} from '../context/ThemeContext';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import TaskModal from './TaskModal';
import {fontFamily} from '../common/fonts';

export const YourTask = ({onOpenCreateModal}) => {
  const {theme, isDark} = useTheme();
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
              ? "Today's Agenda"
              : `${selectedCategory} Tasks`}
          </Text>
          <View
            style={[
              styles.countBadge,
              {backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF'},
            ]}>
            <Text style={[styles.countText, {color: '#4F46E5'}]}>
              {filteredTasks.length}
            </Text>
          </View>
        </View>

        {hasCompleted && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear finished tasks"
            onPress={clearCompleted}
            style={[
              styles.clearBtn,
              {backgroundColor: isDark ? '#2C1515' : '#FEF2F2'},
            ]}>
            <Feather
              name="check-circle"
              size={12}
              color="#EF4444"
              style={{marginRight: 4}}
            />
            <Text style={[styles.clearBtnText, {color: '#EF4444'}]}>
              Clear Done
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task List or Empty State */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No Matching Tasks' : 'All Tasks Completed! 🎉'}
          subtitle={
            searchQuery
              ? `No records found matching "${searchQuery}".`
              : 'Add your next goal or objective to maintain your daily streak.'
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
    paddingHorizontal: 16,
    marginTop: 4,
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
    fontSize: 18,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  clearBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  taskList: {
    marginTop: 4,
  },
});

export default YourTask;
