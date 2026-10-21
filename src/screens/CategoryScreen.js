// src/screens/CategoryScreen.js
import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import TaskModal from '../modules/TaskModal';
import { categoryMeta } from '../styles/theme';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';

const CategoryScreen = ({ route }) => {
  const { params = {} } = route;
  const categoryName = params.categoryName || 'General';

  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { tasks, getCategoryStats } = useTasks();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const meta = categoryMeta[categoryName] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  const stats = getCategoryStats(categoryName);
  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Filter tasks in this category
  const categoryTasks = useMemo(() => {
    let list = tasks.filter(
      (t) => t.category && t.category.toLowerCase() === categoryName.toLowerCase()
    );

    if (filterStatus === 'pending') {
      list = list.filter((t) => !t.completed);
    } else if (filterStatus === 'completed') {
      list = list.filter((t) => t.completed);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort: pinned first, then incomplete first
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return list;
  }, [tasks, categoryName, filterStatus, search]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Top Header Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceSecondary }]}
        >
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
          {categoryName}
        </Text>

        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={[styles.addNavBtn, { backgroundColor: meta.color }]}
        >
          <Text style={styles.addNavBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Hero Banner */}
        <View
          style={[
            styles.heroBanner,
            { backgroundColor: meta.bgColor, borderColor: meta.color },
          ]}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroTitle, { color: meta.color }]}>
                {categoryName}
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                {stats.completed} of {stats.total} tasks completed
              </Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: meta.color }]}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBg, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: meta.color },
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
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder={`Search ${categoryName} tasks...`}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {Boolean(search) && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={[styles.clearIcon, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.pillsRow}>
          {['all', 'pending', 'completed'].map((status) => {
            const isSelected = filterStatus === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status)}
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: isSelected ? meta.color : theme.surfaceSecondary,
                    borderColor: isSelected ? meta.color : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task Cards List */}
        {categoryTasks.length === 0 ? (
          <EmptyState
            icon="📂"
            title={`No ${filterStatus !== 'all' ? filterStatus : ''} Tasks`}
            subtitle={`Nothing to see here in ${categoryName}. Add a new task to stay organized!`}
            buttonText={`+ New ${categoryName} Task`}
            onButtonPress={() => setIsModalVisible(true)}
          />
        ) : (
          <View style={styles.taskList}>
            {categoryTasks.map((item) => (
              <TaskCard
                key={item.id}
                task={item}
                onEdit={handleEdit}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsModalVisible(true)}
        style={[
          styles.fab,
          { backgroundColor: meta.color },
          theme.glowShadow,
        ]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        initialCategory={categoryName}
        initialTask={editingTask}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  navTitle: {
    fontSize: textScale(17),
    fontFamily: fontFamily.bold,
  },
  addNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addNavBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.PADDING_16,
    paddingTop: spacing.PADDING_16,
    paddingBottom: 90,
  },
  heroBanner: {
    borderRadius: 22,
    padding: spacing.PADDING_16,
    borderWidth: 1,
    marginBottom: spacing.MARGIN_14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_12,
  },
  heroTitle: {
    fontSize: textScale(22),
    fontFamily: fontFamily.bold,
  },
  heroSubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: spacing.MARGIN_12,
  },
  searchIcon: {
    fontSize: textScale(14),
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: textScale(13),
    padding: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    marginBottom: spacing.MARGIN_14,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
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
    zIndex: 99,
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: textScale(30),
    fontFamily: fontFamily.bold,
    marginTop: -3,
  },
});

export default CategoryScreen;
