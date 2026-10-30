// src/screens/GoalsScreen.js
// Verified Goals & Milestones Screen (docs/PRD.md Phase 4 — Goals, Milestones, and Progress)

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
  Platform,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useGoal} from '../context/GoalContext';
import {categoryMeta} from '../styles/theme';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import HemburgerButton from '../modules/HemburgerButton';
import GoalCard from '../components/GoalCard';
import GoalModal from '../modules/GoalModal';
import ProgressModal from '../modules/ProgressModal';
import EmptyState from '../components/EmptyState';

const FILTER_TABS = [
  {key: 'all', label: 'All'},
  {key: 'active', label: 'Active'},
  {key: 'completed', label: 'Completed'},
  {key: 'at_risk', label: 'At Risk ⚠️'},
  {key: 'archived', label: 'Archived 📦'},
];

export const GoalsScreen = ({navigation}) => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {goals, undoDeleteGoal, lastDeletedGoal} = useGoal();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const categories = ['All', ...Object.keys(categoryMeta)];

  const handleCreateNew = () => {
    setSelectedGoal(null);
    setGoalModalVisible(true);
  };

  const handleEditGoal = goal => {
    setSelectedGoal(goal);
    setGoalModalVisible(true);
  };

  const handleUpdateProgress = goal => {
    setSelectedGoal(goal);
    setProgressModalVisible(true);
  };

  const handleViewHistory = goal => {
    setSelectedGoal(goal);
    setProgressModalVisible(true);
  };

  // Filtered goals calculation
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      // Category filter
      if (activeCategory !== 'All' && g.category !== activeCategory) {
        return false;
      }

      // Tab filter
      if (activeTab === 'active' && (g.isCompleted || g.isArchived)) {
        return false;
      }
      if (activeTab === 'completed' && !g.isCompleted) {
        return false;
      }
      if (
        activeTab === 'at_risk' &&
        !g.stats?.isAtRisk &&
        !g.stats?.isOverdue
      ) {
        return false;
      }
      if (activeTab === 'archived' && !g.isArchived) {
        return false;
      }
      if (activeTab === 'all' && g.isArchived) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = g.title && g.title.toLowerCase().includes(q);
        const matchesDesc =
          g.description && g.description.toLowerCase().includes(q);
        const matchesCat = g.category && g.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [goals, activeCategory, activeTab, searchQuery]);

  // Productivity summary statistics
  const statsSummary = useMemo(() => {
    const nonArchived = goals.filter(g => !g.isArchived);
    const total = nonArchived.length;
    const completed = nonArchived.filter(
      g => g.isCompleted || g.stats?.progress >= 100,
    ).length;
    const atRisk = nonArchived.filter(
      g => g.stats?.isAtRisk || g.stats?.isOverdue,
    ).length;

    let totalProgress = 0;
    nonArchived.forEach(g => {
      totalProgress += g.stats?.progress || 0;
    });
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return {total, completed, atRisk, avgProgress};
  }, [goals]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Top Header Bar */}
      <View style={[styles.header, {borderBottomColor: theme.divider}]}>
        <View style={styles.headerLeft}>
          <HemburgerButton onPressButton={() => navigation.openDrawer()} />
          <View>
            <Text style={[styles.headerTitle, {color: theme.textPrimary}]}>
              Goals & Progress 🎯
            </Text>
            <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
              Connect actions to long-term outcomes
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          style={[styles.themeBtn, {backgroundColor: theme.surfaceSecondary}]}>
          <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Undo Delete Notice Banner */}
      {Boolean(lastDeletedGoal) && (
        <View
          style={[
            styles.undoBanner,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.undoText, {color: theme.textPrimary}]}>
            Goal deleted
          </Text>
          <TouchableOpacity
            onPress={undoDeleteGoal}
            style={styles.undoBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Undo goal deletion">
            <Text style={[styles.undoBtnText, {color: theme.primary}]}>
              Undo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary KPI Cards Row */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
            theme.cardShadow,
          ]}>
          <Text style={[styles.statValue, {color: theme.textPrimary}]}>
            {statsSummary.total}
          </Text>
          <Text style={[styles.statLabel, {color: theme.textMuted}]}>
            Total Goals
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
            theme.cardShadow,
          ]}>
          <Text style={[styles.statValue, {color: theme.success}]}>
            {statsSummary.completed}
          </Text>
          <Text style={[styles.statLabel, {color: theme.textMuted}]}>
            Completed
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
            theme.cardShadow,
          ]}>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  statsSummary.atRisk > 0 ? theme.warning : theme.textPrimary,
              },
            ]}>
            {statsSummary.atRisk}
          </Text>
          <Text style={[styles.statLabel, {color: theme.textMuted}]}>
            At Risk ⚠️
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
            theme.cardShadow,
          ]}>
          <Text style={[styles.statValue, {color: theme.primary}]}>
            {statsSummary.avgProgress}%
          </Text>
          <Text style={[styles.statLabel, {color: theme.textMuted}]}>
            Avg Progress
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.searchIcon, {color: theme.textMuted}]}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search goals, descriptions, categories..."
            placeholderTextColor={theme.placeholder}
            style={[styles.searchInput, {color: theme.textPrimary}]}
            accessible={true}
            accessibilityLabel="Search goals input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={[styles.clearSearchIcon, {color: theme.textMuted}]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}>
          {FILTER_TABS.map(tab => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.tabChipText,
                    {color: theme.textSecondary},
                    isSelected && styles.selectedWhiteText,
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}>
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            const meta = categoryMeta[cat] || {color: theme.primary};
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? meta.color
                      : theme.surfaceSecondary,
                    borderColor: isSelected ? meta.color : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    {color: theme.textPrimary},
                    isSelected && styles.selectedWhiteText,
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Goals List */}
      <FlatList
        data={filteredGoals}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <GoalCard
            goal={item}
            onEdit={handleEditGoal}
            onUpdateProgress={handleUpdateProgress}
            onViewHistory={handleViewHistory}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Goals Found"
            message={
              searchQuery
                ? 'No goals match your search keywords.'
                : activeTab !== 'all'
                ? `You have no ${activeTab} goals right now.`
                : 'Define long-term aspirations, milestones, and measurable targets.'
            }
            actionLabel="Create a Goal"
            onAction={handleCreateNew}
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        onPress={handleCreateNew}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create a new goal"
        style={[
          styles.fab,
          {backgroundColor: theme.primary},
          theme.cardShadow,
        ]}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modals */}
      <GoalModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        goalToEdit={selectedGoal}
      />

      <ProgressModal
        visible={progressModalVisible}
        onClose={() => setProgressModalVisible(false)}
        goal={selectedGoal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  headerSubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
  },
  themeBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: textScale(16),
  },
  undoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  undoText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  undoBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  undoBtnText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: textScale(15),
    fontFamily: fontFamily.bold,
  },
  statLabel: {
    fontSize: textScale(10),
    fontFamily: fontFamily.medium,
    marginTop: 2,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  searchIcon: {
    fontSize: textScale(14),
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    padding: 0,
  },
  clearSearchIcon: {
    fontSize: textScale(14),
    paddingHorizontal: 4,
  },
  tabsContainer: {
    marginTop: spacing.xs,
  },
  tabsScroll: {
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  categoriesContainer: {
    marginTop: 6,
    marginBottom: spacing.xs,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: textScale(28),
    lineHeight: textScale(30),
    fontWeight: '300',
  },
  selectedWhiteText: {
    color: '#FFFFFF',
  },
});

export default GoalsScreen;
