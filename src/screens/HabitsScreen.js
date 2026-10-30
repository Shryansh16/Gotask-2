// src/screens/HabitsScreen.js
// Verified Habits, Routines, and Reminders Screen (docs/PRD.md Phase 5 — Habits, Routines, and Reminders)

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {
  useHabits,
  isHabitScheduledForDate,
  HABIT_CATEGORIES,
} from '../context/HabitContext';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import HemburgerButton from '../modules/HemburgerButton';
import HabitCard from '../components/HabitCard';
import HabitModal from '../modules/HabitModal';
import EmptyState from '../components/EmptyState';

const FILTER_TABS = [
  {key: 'all', label: 'All Habits'},
  {key: 'due_today', label: 'Due Today ⏳'},
  {key: 'done_today', label: 'Done Today ✓'},
  {key: 'archived', label: 'Archived 📦'},
];

export const HabitsScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {
    habits,
    todayStr,
    stats,
    undoDeleteHabit,
    lastDeletedHabit,
    error,
    clearError,
  } = useHabits();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const categories = ['All', ...HABIT_CATEGORIES];

  const handleCreateNew = () => {
    setSelectedHabit(null);
    setHabitModalVisible(true);
  };

  const handleEditHabit = habit => {
    setSelectedHabit(habit);
    setHabitModalVisible(true);
  };

  // Filter habits list
  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      // 1. Tab Filter
      if (activeTab === 'archived') {
        if (!habit.isArchived) {
          return false;
        }
      } else {
        if (habit.isArchived) {
          return false;
        }
        if (activeTab === 'due_today') {
          const isScheduled = isHabitScheduledForDate(habit, todayStr);
          const isDone = habit.history?.[todayStr]?.status === 'completed';
          if (!isScheduled || isDone) {
            return false;
          }
        } else if (activeTab === 'done_today') {
          const isDone = habit.history?.[todayStr]?.status === 'completed';
          if (!isDone) {
            return false;
          }
        }
      }

      // 2. Category Filter
      if (activeCategory !== 'All' && habit.category !== activeCategory) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = habit.title.toLowerCase().includes(query);
        const matchesDesc = (habit.description || '')
          .toLowerCase()
          .includes(query);
        const matchesCat = habit.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [habits, activeTab, activeCategory, searchQuery, todayStr]);

  const renderItem = ({item}) => (
    <HabitCard habit={item} onEdit={handleEditHabit} />
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.background}]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header Bar */}
      <View
        style={[styles.headerContainer, {borderBottomColor: theme.divider}]}>
        <View style={styles.headerLeft}>
          <HemburgerButton navigation={navigation} />
          <Text style={[styles.headerTitle, {color: theme.textPrimary}]}>
            ⚡ Habits & Routines
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addIconButton, {backgroundColor: theme.primary}]}
          onPress={handleCreateNew}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add new habit">
          <Text style={styles.addIconText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Consistency Overview Banner */}
      <View
        style={[
          styles.kpiContainer,
          {backgroundColor: theme.surface, borderColor: theme.border},
        ]}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, {color: theme.primary}]}>
            {stats.todayCount}
          </Text>
          <Text style={[styles.kpiLabel, {color: theme.textSecondary}]}>
            Scheduled Today
          </Text>
        </View>

        <View style={[styles.kpiDivider, {backgroundColor: theme.divider}]} />

        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, {color: theme.success}]}>
            {stats.completedToday}/{stats.todayCount}
          </Text>
          <Text style={[styles.kpiLabel, {color: theme.textSecondary}]}>
            Done Today
          </Text>
        </View>

        <View style={[styles.kpiDivider, {backgroundColor: theme.divider}]} />

        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, {color: theme.warning}]}>
            🔥 {stats.longestStreak}d
          </Text>
          <Text style={[styles.kpiLabel, {color: theme.textSecondary}]}>
            Best Streak
          </Text>
        </View>
      </View>

      {/* Undo Deletion Toast */}
      {lastDeletedHabit ? (
        <View
          style={[
            styles.undoToast,
            {backgroundColor: theme.surface, borderColor: theme.primary},
          ]}>
          <Text
            style={[styles.undoText, {color: theme.textPrimary}]}
            numberOfLines={1}>
            Deleted "{lastDeletedHabit.title}"
          </Text>
          <TouchableOpacity
            onPress={undoDeleteHabit}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Undo habit deletion">
            <Text style={[styles.undoButtonText, {color: theme.primary}]}>
              UNDO
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Storage Error Banner */}
      {error ? (
        <TouchableOpacity
          style={[styles.errorBanner, {backgroundColor: theme.dangerLight}]}
          onPress={clearError}
          accessible={true}
          accessibilityRole="alert">
          <Text style={[styles.errorText, {color: theme.danger}]}>
            ⚠️ {error} (tap to dismiss)
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchContainer,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <Text style={[styles.searchIcon, {color: theme.textSecondary}]}>
            🔍
          </Text>
          <TextInput
            style={[styles.searchInput, {color: theme.textPrimary}]}
            placeholder="Search habits and routines..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}>
              <Text style={{color: theme.textSecondary}}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Horizontal Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {FILTER_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: isActive ? theme.primary : theme.surface,
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${tab.label}`}>
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive ? styles.textWhite : {color: theme.textPrimary},
                    {
                      fontFamily: isActive
                        ? fontFamily.bold
                        : fontFamily.medium,
                    },
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}>
          {categories.map(cat => {
            const isCatActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isCatActive
                      ? theme.primaryLight
                      : theme.surface,
                    borderColor: isCatActive ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setActiveCategory(cat)}>
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isCatActive ? theme.primary : theme.textSecondary,
                      fontFamily: isCatActive
                        ? fontFamily.bold
                        : fontFamily.regular,
                    },
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Habit List */}
      <FlatList
        data={filteredHabits}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Habits Found"
            message={
              searchQuery
                ? 'No habits match your search criteria.'
                : activeTab === 'due_today'
                ? 'You have no more habits due today. Fantastic work! 🎉'
                : 'Start building daily routines and track your consistency streak.'
            }
            actionLabel="＋ Create Habit"
            onAction={handleCreateNew}
          />
        }
      />

      {/* Habit Creation & Editing Modal */}
      <HabitModal
        visible={habitModalVisible}
        onClose={() => {
          setHabitModalVisible(false);
          setSelectedHabit(null);
        }}
        habitToEdit={selectedHabit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.S,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.S,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  addIconButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    color: '#FFFFFF',
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
    lineHeight: textScale(22),
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: spacing.M,
    marginTop: spacing.M,
    paddingVertical: spacing.M,
    borderRadius: moderateScale(14),
    borderWidth: 1,
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
    marginBottom: spacing.XXS,
  },
  kpiLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  kpiDivider: {
    width: 1,
    height: '60%',
  },
  undoToast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.M,
    marginTop: spacing.S,
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.S,
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  undoText: {
    flex: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  undoButtonText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
    marginLeft: spacing.M,
  },
  errorBanner: {
    marginHorizontal: spacing.M,
    marginTop: spacing.S,
    padding: spacing.S,
    borderRadius: moderateScale(8),
  },
  errorText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  searchWrapper: {
    marginHorizontal: spacing.M,
    marginTop: spacing.M,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: spacing.M,
    height: moderateScale(44),
  },
  searchIcon: {
    fontSize: textScale(14),
    marginRight: spacing.S,
  },
  searchInput: {
    flex: 1,
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
  },
  clearSearchButton: {
    padding: spacing.XXS,
  },
  tabsWrapper: {
    marginTop: spacing.M,
  },
  tabsContainer: {
    paddingHorizontal: spacing.M,
    gap: spacing.XS,
  },
  tabButton: {
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.S,
    borderRadius: moderateScale(20),
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: textScale(12),
  },
  categoryWrapper: {
    marginTop: spacing.S,
    marginBottom: spacing.XS,
  },
  categoryContainer: {
    paddingHorizontal: spacing.M,
    gap: spacing.XS,
  },
  categoryChip: {
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.XXS,
    borderRadius: moderateScale(14),
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: textScale(12),
  },
  listContent: {
    paddingBottom: spacing.XXL,
    paddingTop: spacing.XS,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});

export default HabitsScreen;
