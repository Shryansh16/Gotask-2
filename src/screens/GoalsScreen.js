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
  StatusBar,
  FlatList,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useGoal} from '../context/GoalContext';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import GoalCard from '../components/GoalCard';
import GoalModal from '../modules/GoalModal';
import ProgressModal from '../modules/ProgressModal';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';

const FILTER_TABS = [
  {key: 'all', label: 'All'},
  {key: 'active', label: 'Active'},
  {key: 'completed', label: 'Completed'},
  {key: 'at_risk', label: 'At Risk'},
  {key: 'archived', label: 'Archived'},
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

  const categories = Array.from(new Set(['All', ...Object.keys(categoryMeta)]));

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
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Editorial Header */}
      <Header
        title="Goals & Targets"
        subtitle="Align daily focus with long-term vision"
        navigation={navigation}
        rightAction={{
          icon: isDark ? 'sun' : 'moon',
          onPress: toggleTheme,
          accessibilityLabel: `Switch to ${isDark ? 'light' : 'dark'} mode`,
        }}
      />

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
            <Feather
              name="rotate-ccw"
              size={12}
              color={theme.primary}
              style={{marginRight: 4}}
            />
            <Text style={[styles.undoBtnText, {color: theme.primary}]}>
              Undo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Elevate Goal Mastery Hero */}
      <View
        style={[
          styles.goalHero,
          {backgroundColor: theme.primary},
          theme.cardShadow,
        ]}>
        <View style={styles.goalHeroHeader}>
          <View style={styles.heroBadge}>
            <Feather name="target" size={13} color="#FEF08A" style={{marginRight: 5}} />
            <Text style={styles.heroBadgeText}>GOAL MASTERY</Text>
          </View>
          <Text style={styles.heroAvgPercent}>{statsSummary.avgProgress}% Avg Pace</Text>
        </View>

        {/* Dynamic Glowing Progress Track */}
        <View style={styles.progressTrackBackground}>
          <View
            style={[
              styles.progressTrackFill,
              {width: `${Math.min(100, Math.max(0, statsSummary.avgProgress))}%`},
            ]}
          />
        </View>

        {/* 3 Metric Pills Row */}
        <View style={styles.heroPillsRow}>
          <View style={styles.heroMetricPill}>
            <Text style={styles.heroMetricValue}>{statsSummary.total}</Text>
            <Text style={styles.heroMetricLabel}>Total</Text>
          </View>

          <View style={styles.heroMetricPill}>
            <Text style={[styles.heroMetricValue, {color: '#A7F3D0'}]}>
              {statsSummary.completed}
            </Text>
            <Text style={styles.heroMetricLabel}>Done</Text>
          </View>

          <View style={styles.heroMetricPill}>
            <Text
              style={[
                styles.heroMetricValue,
                {color: statsSummary.atRisk > 0 ? '#FECACA' : '#FFFFFF'},
              ]}>
              {statsSummary.atRisk}
            </Text>
            <Text style={styles.heroMetricLabel}>At Risk</Text>
          </View>
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
          <Feather
            name="search"
            size={16}
            color={theme.textMuted}
            style={{marginRight: 8}}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search goals, milestones, tags..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, {color: theme.textPrimary}]}
            accessible={true}
            accessibilityLabel="Search goals input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Feather name="x" size={16} color={theme.textMuted} />
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
                    styles.tabChipText,
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

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}>
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.categoryPill,
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
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textPrimary,
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
            icon="target"
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

      {/* Floating Action Button (FAB) safely anchored above Elevate bottom bar */}
      <TouchableOpacity
        onPress={handleCreateNew}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create a new goal"
        style={[styles.fab, {backgroundColor: theme.primary}]}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="quests" navigation={navigation} />

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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  undoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: 8,
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
    borderRadius: 8,
    borderWidth: 1,
  },
  undoText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  undoBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  goalHero: {
    borderRadius: 22,
    padding: 18,
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 5, // Elevate 3D bevel
  },
  goalHeroHeader: {
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
  heroAvgPercent: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  progressTrackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  heroPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  heroMetricPill: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fontFamily.bold,
  },
  heroMetricLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.small,
  },
  searchBar: {
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
  tabsContainer: {
    marginBottom: 10,
    height: 38,
  },
  tabsScroll: {
    paddingHorizontal: spacing.medium,
  },
  tabChip: {
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
  tabChipText: {
    fontSize: 12,
  },
  categoriesContainer: {
    marginBottom: 12,
    height: 36,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.medium,
  },
  categoryPill: {
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
  categoryPillText: {
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

export default GoalsScreen;
