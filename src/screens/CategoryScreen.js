// src/screens/CategoryScreen.js
import React, {useState, useMemo} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import TaskModal from '../modules/TaskModal';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';

const CategoryScreen = ({route}) => {
  const params = route?.params || {};
  const categoryName = params.categoryName || 'General';

  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {tasks, getCategoryStats} = useTasks();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const meta = categoryMeta[categoryName] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  const stats = getCategoryStats(categoryName);
  const progressPercent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Filter tasks in this category
  const categoryTasks = useMemo(() => {
    let list = tasks.filter(
      t =>
        t.category && t.category.toLowerCase() === categoryName.toLowerCase(),
    );

    if (filterStatus === 'pending') {
      list = list.filter(t => !t.completed);
    } else if (filterStatus === 'completed') {
      list = list.filter(t => t.completed);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        t =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)),
      );
    }

    // Sort: pinned first, then incomplete first
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return list;
  }, [tasks, categoryName, filterStatus, search]);

  const handleEdit = task => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalVisible(false);
  };

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title={categoryName}
        subtitle={`${stats.completed}/${stats.total} completed (${progressPercent}%)`}
        navigation={navigation}
        showBack={true}
        rightAction={{
          icon: 'plus',
          label: 'Add',
          onPress: () => setIsModalVisible(true),
          accessibilityLabel: `Add ${categoryName} task`,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Category Hero Banner */}
        <View
          style={[
            styles.heroBanner,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroTitle, {color: theme.textPrimary}]}>
                {categoryName}
              </Text>
              <Text style={[styles.heroSubtitle, {color: theme.textSecondary}]}>
                {stats.completed} of {stats.total} tasks completed
              </Text>
            </View>
            <View
              style={[
                styles.percentBadge,
                {backgroundColor: theme.primaryLight},
              ]}>
              <Text style={[styles.percentText, {color: theme.primary}]}>
                {progressPercent}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBg,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <View
              style={[
                styles.progressFill,
                {width: `${progressPercent}%`, backgroundColor: theme.primary},
              ]}
            />
          </View>
        </View>

        {/* Search Inside Category */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}>
          <Feather
            name="search"
            size={16}
            color={theme.textMuted}
            style={{marginRight: 8}}
          />
          <TextInput
            placeholder={`Search in ${categoryName}...`}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, {color: theme.textPrimary}]}
          />
          {Boolean(search) && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.pillsRow}>
          {['all', 'pending', 'completed'].map(status => {
            const isSelected = filterStatus === status;
            return (
              <TouchableOpacity
                key={status}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${status}`}
                onPress={() => setFilterStatus(status)}
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : isDark
                      ? '#1E293B'
                      : '#FFFFFF',
                    borderColor: isSelected ? theme.primary : theme.border,
                    marginRight: 8,
                  },
                ]}>
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isSelected
                        ? fontFamily.bold
                        : fontFamily.medium,
                    },
                  ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task Cards List */}
        {categoryTasks.length === 0 ? (
          <EmptyState
            icon="folder"
            title={`No ${filterStatus !== 'all' ? filterStatus : ''} Tasks`}
            message={`Nothing to see here in ${categoryName}. Add a new task to stay organized!`}
            actionLabel={`+ New ${categoryName} Task`}
            onAction={() => setIsModalVisible(true)}
          />
        ) : (
          <View style={styles.taskList}>
            {categoryTasks.map(item => (
              <TaskCard key={item.id} task={item} onEdit={handleEdit} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Add task to ${categoryName}`}
        activeOpacity={0.85}
        onPress={() => setIsModalVisible(true)}
        style={[styles.fab, {backgroundColor: '#4F46E5', shadowColor: '#4F46E5'}]}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        initialCategory={categoryName}
        initialTask={editingTask}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: 130, // Clearance for FAB
  },
  heroBanner: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPillText: {
    fontSize: 12,
  },
  taskList: {
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#3730A3',
    elevation: 6,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 99,
  },
});

export default CategoryScreen;
