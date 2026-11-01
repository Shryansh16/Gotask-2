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
  StatusBar,
  FlatList,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {
  useHabits,
  isHabitScheduledForDate,
  HABIT_CATEGORIES,
} from '../context/HabitContext';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import HabitCard from '../components/HabitCard';
import HabitModal from '../modules/HabitModal';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';

const FILTER_TABS = [
  {key: 'all', label: 'All Habits'},
  {key: 'due_today', label: 'Due Today'},
  {key: 'done_today', label: 'Done Today'},
  {key: 'archived', label: 'Archived'},
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
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title="Habits & Rituals"
        subtitle="Build compound discipline day by day"
        navigation={navigation}
        rightAction={{
          icon: 'plus',
          label: 'New Habit',
          onPress: handleCreateNew,
          accessibilityLabel: 'Add new habit',
        }}
      />

      {/* Elevate Habit Momentum Hero */}
      <View
        style={[
          styles.habitHero,
          {backgroundColor: theme.primary},
          theme.cardShadow,
        ]}>
        <View style={styles.habitHeroHeader}>
          <View style={styles.heroBadge}>
            <Feather name="repeat" size={13} color="#FEF08A" style={{marginRight: 5}} />
            <Text style={styles.heroBadgeText}>RITUAL MOMENTUM</Text>
          </View>
          <View style={styles.heroFlameCircle}>
            <Text style={{fontSize: 14}}>🔥</Text>
          </View>
        </View>

        <View style={styles.heroTilesRow}>
          <View style={styles.heroTile}>
            <Text style={styles.heroTileNumber}>{stats.todayCount}</Text>
            <Text style={styles.heroTileLabel}>Due Today</Text>
          </View>

          <View style={styles.heroTileDivider} />

          <View style={styles.heroTile}>
            <Text style={[styles.heroTileNumber, {color: '#A7F3D0'}]}>
              {stats.completedToday}/{stats.todayCount}
            </Text>
            <Text style={styles.heroTileLabel}>Completed</Text>
          </View>

          <View style={styles.heroTileDivider} />

          <View style={styles.heroTile}>
            <Text style={[styles.heroTileNumber, {color: '#FEF08A'}]}>
              {stats.longestStreak}d
            </Text>
            <Text style={styles.heroTileLabel}>Best Streak</Text>
          </View>
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
            {error} (tap to dismiss)
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchContainer,
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
            style={[styles.searchInput, {color: theme.textPrimary}]}
            placeholder="Search habits and routines..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}>
              <Feather name="x" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Horizontal Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}>
          {FILTER_TABS.map(tab => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected
                      ? theme.primary
                      : isDark ? '#334155' : '#E2E8F0',
                    borderBottomColor: isSelected
                      ? '#3730A3'
                      : isDark ? '#0F172A' : '#CBD5E1',
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={tab.label}>
                <Text
                  style={[
                    styles.tabItemText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isSelected
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

      {/* Categories Horizontal Scroller */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}>
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected
                      ? theme.primary
                      : isDark ? '#334155' : '#E2E8F0',
                    borderBottomColor: isSelected
                      ? '#3730A3'
                      : isDark ? '#0F172A' : '#CBD5E1',
                  },
                ]}
                onPress={() => setActiveCategory(cat)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Category ${cat}`}>
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isSelected
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

      {/* Main Habits List */}
      <FlatList
        data={filteredHabits}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="zap"
            title="No Habits Found"
            message={
              searchQuery
                ? `No habits match "${searchQuery}".`
                : activeTab === 'due_today'
                ? "You've crushed all scheduled habits for today!"
                : activeTab === 'done_today'
                ? 'No habits completed yet today. Mark one off!'
                : 'Start small. Define daily or weekly routines that compound into lasting results.'
            }
            actionLabel="Create a Habit"
            onAction={handleCreateNew}
          />
        }
      />

      {/* Floating Action Button (FAB) safely anchored above Elevate bottom bar */}
      <TouchableOpacity
        onPress={handleCreateNew}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create a new habit"
        style={[styles.fab, {backgroundColor: theme.primary}]}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="habits" navigation={navigation} />

      {/* Add / Edit Habit Modal */}
      <HabitModal
        visible={habitModalVisible}
        onClose={() => setHabitModalVisible(false)}
        habitToEdit={selectedHabit}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  habitHero: {
    borderRadius: 22,
    padding: 18,
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 5, // Elevate 3D bevel
  },
  habitHeroHeader: {
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
  heroFlameCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  heroTile: {
    flex: 1,
    alignItems: 'center',
  },
  heroTileDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTileNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: fontFamily.bold,
  },
  heroTileLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  undoToast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.medium,
    marginBottom: spacing.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  undoText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    flex: 1,
  },
  undoButtonText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    marginLeft: 8,
  },
  errorBanner: {
    marginHorizontal: spacing.medium,
    marginBottom: spacing.small,
    padding: spacing.small,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  searchWrapper: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
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
  clearSearchButton: {
    padding: 4,
  },
  tabsWrapper: {
    marginBottom: 10,
    height: 38,
  },
  tabsScrollContent: {
    paddingHorizontal: spacing.medium,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tabItemText: {
    fontSize: 12,
  },
  categoriesWrapper: {
    marginBottom: 12,
    height: 36,
  },
  categoryScrollContent: {
    paddingHorizontal: spacing.medium,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: spacing.medium,
    paddingBottom: 150, // Clearance for FAB and Elevate bottom bar
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 78, // Floats cleanly right above Elevate bottom bar
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#3730A3',
    elevation: 8,
    zIndex: 99,
  },
});

export default HabitsScreen;
