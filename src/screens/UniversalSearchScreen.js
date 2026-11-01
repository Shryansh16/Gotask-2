// src/screens/UniversalSearchScreen.js
// Universal Contextual Search Screen (docs/PRD.md Phase 7 — P7.9)

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useNote } from '../context/NoteContext';
import { useGoal } from '../context/GoalContext';
import { useHabit } from '../context/HabitContext';
import { searchContextualEntities } from '../utility/contextualSearch';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import ElevateTabBar from '../components/ElevateTabBar';

const EMPTY_LIST = [];

export const UniversalSearchScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const taskCtx = useTasks();
  const noteCtx = useNote();
  const goalCtx = useGoal();
  const habitCtx = useHabit();

  const tasks = taskCtx?.tasks || EMPTY_LIST;
  const notes = noteCtx?.notes || EMPTY_LIST;
  const goals = goalCtx?.goals || EMPTY_LIST;
  const habits = habitCtx?.habits || EMPTY_LIST;

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'task' | 'note' | 'goal' | 'habit'

  const searchResults = useMemo(() => {
    return searchContextualEntities({
      query,
      tasks,
      notes,
      goals,
      habits,
      filterType,
    });
  }, [query, tasks, notes, goals, habits, filterType]);

  const filterTabs = [
    { key: 'all', label: 'All', count: searchResults.totalMatches },
    { key: 'task', label: 'Tasks', count: searchResults.grouped.tasks.length },
    { key: 'note', label: 'Notes', count: searchResults.grouped.notes.length },
    { key: 'goal', label: 'Goals', count: searchResults.grouped.goals.length },
    { key: 'habit', label: 'Habits', count: searchResults.grouped.habits.length },
  ];

  const getBadgeColor = type => {
    switch (type) {
      case 'task':
        return theme.primary;
      case 'note':
        return '#8B5CF6';
      case 'goal':
        return theme.success;
      case 'habit':
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  const handleItemPress = item => {
    if (item.type === 'task') {
      navigation.navigate('Home', { selectedTaskId: item.id });
    } else if (item.type === 'note') {
      navigation.navigate('NotesScreen', { selectedNoteId: item.id });
    } else if (item.type === 'goal') {
      navigation.navigate('GoalsScreen', { selectedGoalId: item.id });
    } else if (item.type === 'habit') {
      navigation.navigate('HabitsScreen', { selectedHabitId: item.id });
    }
  };

  const renderResultItem = ({ item }) => {
    const badgeColor = getBadgeColor(item.type);
    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.badge}: ${item.title}`}
        style={[
          styles.resultCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderLeftWidth: 5,
            borderLeftColor: badgeColor,
          },
        ]}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: `${badgeColor}18`, borderColor: badgeColor },
            ]}>
            <Text style={[styles.typeBadgeText, { color: badgeColor }]}>
              {item.badge.toUpperCase()}
            </Text>
          </View>
          {item.subtitle ? (
            <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.itemTitle,
            {
              color: theme.textPrimary,
              textDecorationLine: item.completed ? 'line-through' : 'none',
              opacity: item.completed ? 0.6 : 1,
            },
          ]}>
          {item.title}
        </Text>

        {item.description ? (
          <Text
            numberOfLines={2}
            style={[styles.itemDesc, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title="Universal Search"
        subtitle="Search across tasks, notes, goals & routines"
        navigation={navigation}
        showBack={true}
      />

      {/* Search Input Box */}
      <View style={styles.searchBoxWrapper}>
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
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks, notes, goals, habits..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            autoFocus={true}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearBtn}>
              <Feather name="x" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      {query.trim().length > 0 && (
        <View style={styles.filterTabsRow}>
          {filterTabs.map(tab => {
            const isSelected = filterType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilterType(tab.key)}
                style={[
                  styles.filterTab,
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
                ]}>
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: isSelected
                        ? fontFamily.bold
                        : fontFamily.medium,
                    },
                  ]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Results List */}
      {query.trim().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather
            name="search"
            size={40}
            color={theme.textMuted}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            Instant Productivity Search
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Type any keyword to search across all your tasks, notes, goals, and
            habit routines simultaneously.
          </Text>
        </View>
      ) : searchResults.results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather
            name="frown"
            size={40}
            color={theme.textMuted}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No results found
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            No matching items found for "{query}". Try different terms or
            broaden your filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults.results}
          keyExtractor={(item, index) => `${item.type}_${item.id}_${index}`}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="today" navigation={navigation} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchBoxWrapper: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
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
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.small,
  },
  filterTab: {
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
  filterTabText: {
    fontSize: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  subtitleText: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    marginTop: 2,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.extraLarge,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: spacing.medium,
    paddingBottom: 130, // Clearance for navigation
  },
});

export default UniversalSearchScreen;
