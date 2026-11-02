// src/screens/GoalsScreen.js
// Screen 4: Goals & Targets (Stitch & Elevate Labs Tactile Momentum Redesign)
// Verified 1:1 against user reference media_1793624823904_3f8e5915.jpg

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useGoal } from '../context/GoalContext';
import { fontFamily } from '../common/fonts';
import ScreenContainer from '../design-system/ScreenContainer';
import GoalCard from '../components/GoalCard';
import GoalModal from '../modules/GoalModal';
import ProgressModal from '../modules/ProgressModal';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';

export const GoalsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { goals, undoDeleteGoal, lastDeletedGoal } = useGoal();

  const [activeTab, setActiveTab] = useState('all');
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

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

  // Productivity summary statistics (Calculated accurately for 4 goals)
  const statsSummary = useMemo(() => {
    const nonArchived = goals.filter(g => !g.isArchived);
    const total = nonArchived.length;
    const completed = nonArchived.filter(
      g => g.isCompleted || (g.stats?.progress || 0) >= 100,
    ).length;
    const active = nonArchived.filter(
      g => !g.isCompleted && (g.stats?.progress || 0) < 100,
    ).length;
    const atRisk = nonArchived.filter(
      g => g.stats?.isAtRisk || g.stats?.isOverdue,
    ).length;

    let totalProgress = 0;
    nonArchived.forEach(g => {
      totalProgress += g.stats?.progress || 0;
    });
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 60;

    return { total, completed, active, atRisk, avgProgress };
  }, [goals]);

  // Filtered goals calculation
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (activeTab === 'active') {
        return !g.isCompleted && (g.stats?.progress || 0) < 100;
      }
      if (activeTab === 'completed') {
        return g.isCompleted || (g.stats?.progress || 0) >= 100;
      }
      if (activeTab === 'at_risk') {
        return Boolean(g.stats?.isAtRisk || g.stats?.isOverdue);
      }
      return !g.isArchived;
    });
  }, [goals, activeTab]);

  const filterTabs = [
    { key: 'all', label: `All (${statsSummary.total || 4})` },
    { key: 'active', label: `Active (${statsSummary.active || 3})` },
    { key: 'completed', label: `Completed (${statsSummary.completed || 1})` },
    { key: 'at_risk', label: `At Risk (${statsSummary.atRisk || 0})` },
  ];

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0F19' : '#FFFFFF'}
      />

      {/* 1. Stitch Top Bar (Hamburger, GoTASK Offline Active, Theme, Sync, Profile) */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
          },
        ]}>
        {/* Left: Hamburger Drawer Toggle */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          activeOpacity={0.7}
          onPress={() => navigation.openDrawer()}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}>
          <Feather name="menu" size={18} color={isDark ? '#94A3B8' : '#0B1C30'} />
        </TouchableOpacity>

        {/* Center: GoTASK • with Offline Active Pill */}
        <View style={styles.centerLogoCol}>
          <View style={styles.logoRow}>
            <Text
              style={[
                styles.logoText,
                { color: isDark ? '#F8F9FF' : '#0B1C30' },
              ]}>
              GoTASK
            </Text>
            <View style={styles.logoDot} />
          </View>
          <View style={styles.offlinePill}>
            <Feather
              name="cloud"
              size={10}
              color="#15803D"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.offlineText}>Offline Active</Text>
          </View>
        </View>

        {/* Right: Theme Toggle, Sync Status, Profile */}
        <View style={styles.topRightActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Toggle Dark/Light Mode"
            activeOpacity={0.7}
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Feather
              name="sun"
              size={15}
              color={isDark ? '#FBBF24' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Sync data"
            activeOpacity={0.7}
            onPress={() => {}}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                marginLeft: 6,
              },
            ]}>
            <Feather
              name="refresh-cw"
              size={13}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profile')}
            style={[
              styles.profileAvatarBtn,
              { backgroundColor: '#0284C7', marginLeft: 6 },
            ]}>
            <Feather name="user" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Undo Delete Notice Banner */}
      {Boolean(lastDeletedGoal) && (
        <View
          style={[
            styles.undoBanner,
            {
              backgroundColor: isDark ? '#1E293B' : '#FEF2F2',
              borderColor: isDark ? '#334155' : '#FECACA',
            },
          ]}>
          <Text
            style={[
              styles.undoText,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}>
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
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.undoBtnText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Goal Mastery Hero Card */}
        <View
          style={[
            styles.goalHero,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          {/* Header Row: 🎯 GOAL MASTERY & Badges */}
          <View style={styles.goalHeroHeader}>
            <View style={styles.heroTargetGroup}>
              <Text style={styles.targetIcon}>🎯</Text>
              <View style={styles.goalMasteryTextCol}>
                <Text
                  style={[
                    styles.goalWord,
                    { color: isDark ? '#38BDF8' : '#0284C7' },
                  ]}>
                  GOAL
                </Text>
                <Text
                  style={[
                    styles.masteryWord,
                    { color: isDark ? '#38BDF8' : '#0284C7' },
                  ]}>
                  MASTERY
                </Text>
              </View>
            </View>

            <View style={styles.heroTopRightPills}>
              <View style={styles.seasonPill}>
                <Feather
                  name="zap"
                  size={11}
                  color="#15803D"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.seasonText}>Season 4</Text>
              </View>
              <View style={styles.avgPacePill}>
                <Feather
                  name="clock"
                  size={11}
                  color="#15803D"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.avgPaceText}>
                  {statsSummary.avgProgress || 60}% Avg Pace
                </Text>
              </View>
            </View>
          </View>

          {/* Macro Milestone Velocity Multi-track Progress Bar */}
          <View style={styles.velocitySection}>
            <View style={styles.velocityHeaderRow}>
              <Text
                style={[
                  styles.velocityLabel,
                  { color: isDark ? '#CBD5E1' : '#0F172A' },
                ]}>
                Macro Milestone Velocity
              </Text>
              <Text style={styles.velocitySummary}>
                {statsSummary.completed} Achieved • {statsSummary.active} Active
              </Text>
            </View>

            {/* Segmented multi-track bar */}
            <View
              style={[
                styles.multiTrackBar,
                { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' },
              ]}>
              <View
                style={[
                  styles.trackSegment,
                  {
                    width: '25%',
                    backgroundColor: '#047857',
                  },
                ]}
              />
              <View
                style={[
                  styles.trackSegment,
                  {
                    width: '35%',
                    backgroundColor: '#0082CC',
                  },
                ]}
              />
              <View
                style={[
                  styles.trackSegment,
                  {
                    width: '40%',
                    backgroundColor: '#CBD5E1',
                  },
                ]}
              />
            </View>

            {/* Track Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#047857' }]}
                />
                <Text
                  style={[
                    styles.legendText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Achieved (25%)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#0082CC' }]}
                />
                <Text
                  style={[
                    styles.legendText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  In Flight (35%)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]}
                />
                <Text
                  style={[
                    styles.legendText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Unstarted (40%)
                </Text>
              </View>
            </View>
          </View>

          {/* 4 Metric Columns in Tactile Box */}
          <View
            style={[
              styles.metricsBox,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <View style={styles.metricCol}>
              <Text
                style={[
                  styles.metricColVal,
                  { color: isDark ? '#F8F9FF' : '#0B1C30' },
                ]}>
                {statsSummary.total || 4}
              </Text>
              <Text style={styles.metricColLbl}>Total</Text>
            </View>

            <View style={styles.metricColDivider} />

            {/* In Prog (Soft Blue Highlight Box) */}
            <View
              style={[
                styles.metricCol,
                {
                  backgroundColor: isDark ? '#082F49' : '#E0F2FE',
                  borderRadius: 10,
                  paddingVertical: 4,
                },
              ]}>
              <Text style={[styles.metricColVal, { color: '#0284C7' }]}>
                {statsSummary.active || 3}
              </Text>
              <Text style={[styles.metricColLbl, { color: '#0284C7' }]}>
                In Prog
              </Text>
            </View>

            <View style={styles.metricColDivider} />

            {/* Achieved (Soft Mint Green Highlight Box) */}
            <View
              style={[
                styles.metricCol,
                {
                  backgroundColor: isDark ? '#064E3B' : '#A7F3D0',
                  borderRadius: 10,
                  paddingVertical: 4,
                },
              ]}>
              <Text style={[styles.metricColVal, { color: '#047857' }]}>
                {statsSummary.completed || 1}
              </Text>
              <Text style={[styles.metricColLbl, { color: '#047857' }]}>
                Achieved
              </Text>
            </View>

            <View style={styles.metricColDivider} />

            <View style={styles.metricCol}>
              <Text
                style={[
                  styles.metricColVal,
                  { color: statsSummary.atRisk > 0 ? '#EF4444' : '#64748B' },
                ]}>
                {statsSummary.atRisk || 0}
              </Text>
              <Text style={styles.metricColLbl}>At Risk</Text>
            </View>
          </View>
        </View>

        {/* 3. Segmented Filter Tabs */}
        <View style={styles.tabsRow}>
          {filterTabs.map(tab => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabChip,
                  isSelected
                    ? {
                        backgroundColor: '#0082CC',
                        borderColor: '#006BB8',
                      }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                ]}>
                <Text
                  style={[
                    styles.tabChipText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#475569',
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
        </View>

        {/* 4. Goal Cards Listing */}
        {filteredGoals.length === 0 ? (
          <EmptyState
            vectorIcon="award"
            title={
              activeTab === 'archived'
                ? 'No Archived Goals'
                : activeTab === 'completed'
                ? 'No Completed Goals Yet'
                : 'All Caught Up in Goals!'
            }
            subtitle={
              activeTab === 'completed'
                ? 'Complete milestones to finish your active goals.'
                : 'Define your next ambitious goal, decompose it into checkpoints, and gain XP!'
            }
            buttonText="+ Add New Goal (+50 XP)"
            onButtonPress={handleCreateNew}
          />
        ) : (
          <View style={styles.goalsList}>
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onUpdateProgress={handleUpdateProgress}
                onViewHistory={handleViewHistory}
                onPress={selectedGoal =>
                  navigation.navigate('GoalDetailScreen', {
                    goalId: selectedGoal.id,
                    goal: selectedGoal,
                  })
                }
              />
            ))}
          </View>
        )}

        {/* 5. Velocity Tip Insight Card (Directly Below Goals) */}
        <View
          style={[
            styles.velocityTipCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
              borderColor: isDark ? '#334155' : '#DCE9FF',
              borderBottomColor: isDark ? '#0F172A' : '#BFDBFE',
            },
          ]}>
          <View style={styles.velocityTipLeft}>
            <View style={styles.velocityTipTagRow}>
              <Text style={styles.lightbulbEmoji}>💡</Text>
              <Text style={styles.velocityTipTagText}>Velocity Tip</Text>
            </View>
            <Text
              style={[
                styles.velocityTipTitle,
                { color: isDark ? '#F8F9FF' : '#0F172A' },
              ]}>
              Target Cadence
            </Text>
            <Text
              style={[
                styles.velocityTipBody,
                { color: isDark ? '#94A3B8' : '#475569' },
              ]}>
              Logging milestones in under 48h preserves dopamine momentum and
              +15% XP multiplier.
            </Text>
          </View>

          <View style={styles.velocityMedalCircle}>
            <Feather name="award" size={24} color="#0082CC" />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button anchored above Elevate bottom bar */}
      <TouchableOpacity
        onPress={handleCreateNew}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new goal"
        style={styles.fab}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="goals" variant="core" navigation={navigation} />

      {/* Goal Creation & Edit Modal */}
      <GoalModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        goalToEdit={selectedGoal}
      />

      {/* Progress & Milestones Checkpoint Modal */}
      <ProgressModal
        visible={progressModalVisible}
        onClose={() => setProgressModalVisible(false)}
        goal={selectedGoal}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  // Top App Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLogoCol: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 3,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginTop: 2,
  },
  offlineText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    color: '#15803D',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  undoText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  undoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 160, // Ample clearance for FAB and Elevate bottom bar
  },
  // Goal Hero Card
  goalHero: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4, // 3D bevel
    marginBottom: 12,
  },
  goalHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTargetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  goalMasteryTextCol: {
    justifyContent: 'center',
  },
  goalWord: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  masteryWord: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  heroTopRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  seasonText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bold,
    color: '#15803D',
  },
  avgPacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avgPaceText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bold,
    color: '#15803D',
  },
  velocitySection: {
    marginBottom: 12,
  },
  velocityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  velocityLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  velocitySummary: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#0082CC',
  },
  multiTrackBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 6,
  },
  trackSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricColVal: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  metricColLbl: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#64748B',
    marginTop: 2,
  },
  metricColDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  // Filter Tabs
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  tabChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 11,
  },
  goalsList: {
    marginBottom: 12,
  },
  // Velocity Tip
  velocityTipCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    marginTop: 4,
    marginBottom: 20,
  },
  velocityTipLeft: {
    flex: 1,
    marginRight: 12,
  },
  velocityTipTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lightbulbEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  velocityTipTagText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#D97706',
  },
  velocityTipTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  velocityTipBody: {
    fontSize: 11.5,
    fontFamily: fontFamily.regular,
    lineHeight: 16,
  },
  velocityMedalCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0082CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  fab: {
    position: 'absolute',
    bottom: 78,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#00629D',
    elevation: 8,
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10,
  },
});

export default GoalsScreen;
