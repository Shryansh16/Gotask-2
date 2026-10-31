// src/screens/UniversalSearchScreen.js
// Universal Contextual Search Screen (docs/PRD.md Phase 7 — P7.9)

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {useNote} from '../context/NoteContext';
import {useGoal} from '../context/GoalContext';
import {useHabit} from '../context/HabitContext';
import {searchContextualEntities} from '../utility/contextualSearch';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

const EMPTY_LIST = [];

export const UniversalSearchScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();

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
    {key: 'all', label: 'All', count: searchResults.totalMatches},
    {key: 'task', label: 'Tasks', count: searchResults.grouped.tasks.length},
    {key: 'note', label: 'Notes', count: searchResults.grouped.notes.length},
    {key: 'goal', label: 'Goals', count: searchResults.grouped.goals.length},
    {key: 'habit', label: 'Habits', count: searchResults.grouped.habits.length},
  ];

  const getBadgeColor = type => {
    switch (type) {
      case 'task':
        return '#3b82f6';
      case 'note':
        return '#8b5cf6';
      case 'goal':
        return '#10b981';
      case 'habit':
        return '#f59e0b';
      default:
        return theme.primary;
    }
  };

  const handleItemPress = item => {
    if (item.type === 'task') {
      navigation.navigate('Home', {selectedTaskId: item.id});
    } else if (item.type === 'note') {
      navigation.navigate('NotesScreen', {selectedNoteId: item.id});
    } else if (item.type === 'goal') {
      navigation.navigate('GoalsScreen', {selectedGoalId: item.id});
    } else if (item.type === 'habit') {
      navigation.navigate('HabitsScreen', {selectedHabitId: item.id});
    }
  };

  const renderResultItem = ({item}) => {
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
          },
        ]}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.typeBadge,
              {backgroundColor: `${badgeColor}18`, borderColor: badgeColor},
            ]}>
            <Text style={[styles.typeBadgeText, {color: badgeColor}]}>
              {item.badge.toUpperCase()}
            </Text>
          </View>
          {item.subtitle ? (
            <Text style={[styles.subtitleText, {color: theme.textSecondary}]}>
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
            style={[styles.itemDesc, {color: theme.textSecondary}]}>
            {item.description}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Bar */}
      <View style={[styles.topHeader, {borderBottomColor: theme.border}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
          style={styles.backBtn}>
          <Text style={[styles.backBtnText, {color: theme.textPrimary}]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, {color: theme.textPrimary}]}>
          🔍 Universal Search
        </Text>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBoxWrapper}>
        <View
          style={[
            styles.searchBox,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks, notes, goals, habits..."
            placeholderTextColor={theme.textPlaceholder}
            style={[styles.searchInput, {color: theme.textPrimary}]}
            autoFocus={true}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearBtn}>
              <Text
                style={{color: theme.textSecondary, fontSize: textScale(14)}}>
                ✕
              </Text>
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
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: isSelected ? '#ffffff' : theme.textSecondary,
                      fontFamily: isSelected
                        ? fontFamily.poppinsSemiBold
                        : fontFamily.poppinsRegular,
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
          <Text style={styles.emptyIcon}>⚡</Text>
          <Text style={[styles.emptyTitle, {color: theme.textPrimary}]}>
            Instant Productivity Search
          </Text>
          <Text style={[styles.emptySubtitle, {color: theme.textSecondary}]}>
            Type any keyword to search across all your tasks, notes, goals, and
            habit routines simultaneously.
          </Text>
        </View>
      ) : searchResults.results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔎</Text>
          <Text style={[styles.emptyTitle, {color: theme.textPrimary}]}>
            No results found
          </Text>
          <Text style={[styles.emptySubtitle, {color: theme.textSecondary}]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backBtnText: {
    fontSize: textScale(20),
    fontFamily: fontFamily.poppinsBold,
  },
  screenTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.poppinsBold,
  },
  searchBoxWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(14),
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: textScale(14),
  },
  searchInput: {
    flex: 1,
    fontSize: textScale(14),
    fontFamily: fontFamily.poppinsRegular,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  filterTab: {
    borderWidth: 1,
    borderRadius: moderateScale(16),
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(4),
  },
  filterTabText: {
    fontSize: textScale(11),
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: moderateScale(14),
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: moderateScale(6),
    paddingHorizontal: spacing.xs,
    paddingVertical: moderateScale(2),
  },
  typeBadgeText: {
    fontSize: textScale(9),
    fontFamily: fontFamily.poppinsSemiBold,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsRegular,
  },
  itemTitle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.poppinsSemiBold,
    marginBottom: moderateScale(3),
  },
  itemDesc: {
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsRegular,
    lineHeight: textScale(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: textScale(40),
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: textScale(16),
    fontFamily: fontFamily.poppinsBold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsRegular,
    textAlign: 'center',
    lineHeight: textScale(18),
  },
});
