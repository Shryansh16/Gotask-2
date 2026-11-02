// src/screens/TasksScreen.js
// Screen 2: Dedicated Tasks Inventory & Backlog
// Matched 1:1 against user reference media_1793630748158_ae2c7680.jpg & HTML

import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {ScreenContainer} from '../design-system';
import {fontFamily} from '../common/fonts';
import SearchBar from '../modules/SearchBar';
import YourTask from '../modules/YourTask';
import TaskModal from '../modules/TaskModal';
import ElevateTabBar from '../components/ElevateTabBar';

export const TasksScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, isDark, toggleTheme} = useTheme();
  const {syncStatus, triggerSync, stats} = useTasks();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0F19' : '#FFFFFF'}
      />

      {/* 1. Elevate Top Header & Game Status Strip (Fixed at top) */}
      <View
        style={[
          styles.topHeaderContainer,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
            borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
          },
        ]}>
        {/* Status Pills: Flame Streak, XP, Level, Theme, Profile */}
        <View style={styles.statusPillsRow}>
          <View style={styles.statusPillsLeft}>
            {/* Flame Streak */}
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDark ? '#451A03' : '#FFF7ED',
                  borderColor: isDark ? '#78350F' : '#FFEDD5',
                },
              ]}>
              <Text style={styles.statusPillEmoji}>🔥</Text>
              <Text
                style={[
                  styles.streakText,
                  {color: isDark ? '#FB923C' : '#EA580C'},
                ]}>
                {stats.streak || 8} Days
              </Text>
            </View>

            {/* XP Coins Pill with (+) Button */}
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDark ? '#2D2305' : '#FEFCE8',
                  borderColor: isDark ? '#78350F' : '#FEF08A',
                },
              ]}>
              <Text style={styles.statusPillEmoji}>🪙</Text>
              <Text
                style={[
                  styles.xpText,
                  {color: isDark ? '#FDE047' : '#B45309'},
                ]}>
                3,663
              </Text>
              <View style={styles.addXpBtn}>
                <Text style={styles.addXpText}>+</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusPillsRight}>
            {/* Level 8 Pill with Green Pulsing Dot */}
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                  borderColor: isDark ? '#312E81' : '#E0E7FF',
                },
              ]}>
              <Text style={styles.statusPillEmoji}>🧠</Text>
              <Text
                style={[
                  styles.levelText,
                  {color: isDark ? '#A5B4FC' : '#4F46E5'},
                ]}>
                Level 8
              </Text>
              <View style={styles.liveGreenDot} />
            </View>

            {/* Theme Toggle Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Toggle Dark/Light Mode"
              activeOpacity={0.7}
              onPress={toggleTheme}
              style={[
                styles.circleActionBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                },
              ]}>
              <Feather
                name={isDark ? 'sun' : 'moon'}
                size={16}
                color={isDark ? '#FBBF24' : '#475569'}
              />
            </TouchableOpacity>

            {/* Profile Avatar Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="User Profile"
              activeOpacity={0.7}
              onPress={() => navigation.openDrawer()}
              style={[
                styles.circleActionBtn,
                {
                  backgroundColor: '#00629D',
                },
              ]}>
              <Feather name="user" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Title & Offline Status Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text
              style={[
                styles.screenTitle,
                {color: isDark ? '#F8FAFC' : '#0F172A'},
              ]}>
              Tasks & Backlog
            </Text>
            <View
              style={[
                styles.offlineBadge,
                {
                  backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                  borderColor: isDark ? '#059669' : '#A7F3D0',
                },
              ]}>
              <View style={styles.pulseGreenDot} />
              <Text
                style={[
                  styles.offlineText,
                  {color: isDark ? '#6EE7B7' : '#047857'},
                ]}>
                Offline Active
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Trigger cloud sync"
            onPress={triggerSync}
            style={[
              styles.syncedBadge,
              {
                backgroundColor: isDark ? '#00375A' : '#F0F9FF',
                borderColor: isDark ? '#0284C7' : '#BAE6FD',
              },
            ]}>
            <Feather
              name="refresh-cw"
              size={11}
              color="#0284C7"
              style={{marginRight: 4}}
            />
            <Text
              style={[
                styles.syncedText,
                {color: isDark ? '#38BDF8' : '#0284C7'},
              ]}>
              {syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Scrollable Backlog Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Daily Backlog Sprints Quests Hero Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.sprintsBanner}>
            {/* Top Row: Map Emoji + Title, Tasks Left Pill */}
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerTitleGroup}>
                <Text style={styles.bannerMapEmoji}>🗺️</Text>
                <Text style={styles.bannerSubTitle}>DAILY BACKLOG SPRINTS</Text>
              </View>
              <View style={styles.tasksLeftPill}>
                <Text style={styles.hourglassEmoji}>⏳</Text>
                <Text style={styles.tasksLeftText}>3 Tasks Left</Text>
              </View>
            </View>

            {/* Content Row: Goal Title, Progress Bar, Metrics & Gift Squircle */}
            <View style={styles.bannerContentRow}>
              <View style={styles.bannerLeftCol}>
                <Text style={styles.goalTitleText}>
                  Complete 3 Backlog Items Today
                </Text>
                <View style={styles.goalTrack}>
                  <View style={[styles.goalFill, {width: '66%'}]} />
                </View>
                <View style={styles.goalMetricsRow}>
                  <Text style={styles.goalDoneText}>2 of 3 Done</Text>
                  <Text style={styles.goalXpText}>+65 XP Reward</Text>
                </View>
              </View>

              <View style={styles.giftSquircle}>
                <Text style={styles.giftEmoji}>🎁</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Search & Category Squircle Chips + Priority Segmented Bar */}
        <SearchBar />

        {/* Active Backlog & Pinned Priority Cards */}
        <YourTask
          title="Active Backlog"
          showSort={true}
          filterToday={false}
          onOpenCreateModal={() => setIsCreateModalVisible(true)}
        />
      </ScrollView>

      {/* 3. Floating Action Button (FAB) safely anchored above bottom tab bar */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Create new task"
        activeOpacity={0.85}
        onPress={() => setIsCreateModalVisible(true)}
        style={[
          styles.fab,
          {
            backgroundColor: '#00A3FF',
            borderBottomColor: '#00629D',
            shadowColor: '#00A3FF',
          },
        ]}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 4. Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="tasks" variant="core" navigation={navigation} />

      {/* Create Task Modal */}
      <TaskModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topHeaderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  statusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statusPillsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPillsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusPillEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  xpText: {
    fontSize: 12,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  addXpBtn: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  addXpText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fontFamily.black || fontFamily.bold,
    lineHeight: 12,
  },
  levelText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 5,
  },
  circleActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 2,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: -0.4,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  pulseGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  offlineText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  syncedText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 150, // Clearance for FAB and ElevateTabBar
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sprintsBanner: {
    backgroundColor: '#00A3FF',
    borderRadius: 18,
    padding: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#0369A1',
    shadowColor: '#00A3FF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerMapEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  bannerSubTitle: {
    color: '#E0F2FE',
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: 0.8,
  },
  tasksLeftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  hourglassEmoji: {
    fontSize: 11,
    marginRight: 4,
  },
  tasksLeftText: {
    color: '#FEF08A',
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  bannerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bannerLeftCol: {
    flex: 1,
  },
  goalTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  goalTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    padding: 1,
    marginBottom: 6,
  },
  goalFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FDE047',
  },
  goalMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDoneText: {
    color: '#E0F2FE',
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  goalXpText: {
    color: '#FEF08A',
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  giftSquircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 78,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4, // 3D bevel
    elevation: 8,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10,
  },
});

export default TasksScreen;
