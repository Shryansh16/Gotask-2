// src/modules/DrawerComponent.js
// GoTASK Kinetic Navigation Drawer
// Matched 1:1 against user reference media_1793630911685_dd96d231.jpg & HTML

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {useNotes} from '../context/NoteContext';
import {useGoal} from '../context/GoalContext';
import {fontFamily} from '../common/fonts';

const DrawerComponent = props => {
  const insets = useSafeAreaInsets();
  const {theme, isDark, toggleTheme} = useTheme();
  const {profile, stats, syncStatus} = useTasks();
  const {notes} = useNotes();
  const {goals} = useGoal();

  const currentRouteName =
    props.state?.routeNames?.[props.state?.index] || 'FunctionScreen';

  const avatarSource =
    profile?.avatar && profile.avatar.startsWith('http')
      ? {uri: profile.avatar}
      : require('../assets/man.png');

  const notesCount = notes ? notes.filter(n => !n.isArchived).length : 14;
  const completedTasks = stats?.completed ?? 4;
  const totalTasks = stats?.total ?? 5;
  const completionPercent = stats?.completionRate ?? 80;
  const pendingTasks = stats?.pending ?? 5;
  const streakDays = stats?.streak ?? 14;

  const navigateTo = screenName => {
    props.navigation.navigate(screenName);
  };

  const closeDrawer = () => {
    props.navigation.closeDrawer();
  };

  return (
    <View
      style={[
        styles.drawerContainer,
        {
          backgroundColor: isDark ? '#0B1120' : '#F8FAFC',
        },
      ]}>
      {/* 1. Kinetic Gradient Profile Hero Header */}
      <View
        style={[
          styles.heroHeader,
          {
            paddingTop: Math.max(insets.top, 14) + 10,
          },
        ]}>
        {/* Top Profile Avatar & Close Button Row */}
        <View style={styles.topActionRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
            activeOpacity={0.8}
            onPress={() => navigateTo('Profile')}
            style={styles.avatarWrap}>
            <Image
              source={avatarSource}
              style={styles.avatarImage}
              defaultSource={require('../assets/man.png')}
            />
            {/* Green Online Status Ping Dot */}
            <View style={styles.onlineDotBorder}>
              <View style={styles.onlineDot} />
            </View>
          </TouchableOpacity>

          {/* Close Chevron Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close navigation drawer"
            activeOpacity={0.75}
            onPress={closeDrawer}
            style={styles.closeBtn}>
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* User Name & Level */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open user profile"
          activeOpacity={0.8}
          onPress={() => navigateTo('Profile')}
          style={styles.userMetaContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {profile?.name || 'Shryansh Shree'}
            </Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={11} color="#38BDF8" />
            </View>
          </View>
          <View style={styles.roleRow}>
            <Text style={styles.roleText}>
              {profile?.role || 'Productivity Architect'}
            </Text>
            <View style={styles.roleDot} />
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlBadgeText}>LVL 14</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Dual Stat Badges (Streak & XP) */}
        <View style={styles.statBadgesGrid}>
          {/* 14d Streak Card */}
          <View style={styles.statCard}>
            <View style={styles.streakIconBox}>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.streakCountText}>{streakDays}d streak</Text>
              <Text style={styles.statSubText}>Unbroken</Text>
            </View>
          </View>

          {/* 3,663 XP Card */}
          <View style={styles.statCard}>
            <View style={styles.xpIconBox}>
              <Text style={styles.xpEmoji}>⚡</Text>
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.xpCountText}>3,663 XP</Text>
              <Text style={styles.statSubText}>Top 3% Sprint</Text>
            </View>
          </View>
        </View>

        {/* Today Velocity Progress Tracker */}
        <View style={styles.velocitySection}>
          <View style={styles.velocityHeaderRow}>
            <View style={styles.velocityTitleGroup}>
              <Feather
                name="check"
                size={13}
                color="#6EE7B7"
                style={{marginRight: 4}}
              />
              <Text style={styles.velocityTitle}>Today Velocity</Text>
            </View>
            <Text style={styles.velocityFraction}>
              {completedTasks} / {totalTasks} Done ({completionPercent}%)
            </Text>
          </View>

          {/* Velocity Progress Bar Track */}
          <View style={styles.velocityTrack}>
            <View
              style={[
                styles.velocityFill,
                {width: `${Math.min(completionPercent, 100)}%`},
              ]}
            />
          </View>
        </View>
      </View>

      {/* 2. Scrollable Navigation Sections */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navScrollContent}>
        {/* Core Spaces Section */}
        <View style={styles.sectionGroup}>
          <Text
            style={[
              styles.sectionCategoryTitle,
              {color: isDark ? '#64748B' : '#94A3B8'},
            ]}>
            CORE SPACES
          </Text>

          {/* Item 1: Today Dashboard */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Today Dashboard"
            activeOpacity={0.75}
            onPress={() => navigateTo('FunctionScreen')}
            style={[
              styles.navItem,
              currentRouteName === 'FunctionScreen' && [
                styles.activeNavItem,
                {
                  backgroundColor: isDark ? '#0C2A4D' : '#F0F9FF',
                  borderColor: isDark ? '#0284C7' : '#BAE6FD',
                },
              ],
            ]}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {
                    backgroundColor:
                      currentRouteName === 'FunctionScreen'
                        ? '#0284C7'
                        : isDark
                        ? '#1E293B'
                        : '#E0F2FE',
                  },
                ]}>
                <Feather
                  name="calendar"
                  size={16}
                  color={
                    currentRouteName === 'FunctionScreen'
                      ? '#FFFFFF'
                      : '#0284C7'
                  }
                />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {
                    color:
                      currentRouteName === 'FunctionScreen'
                        ? isDark
                        ? '#38BDF8'
                        : '#0369A1'
                        : isDark
                        ? '#E2E8F0'
                        : '#334155',
                    fontFamily:
                      currentRouteName === 'FunctionScreen'
                        ? fontFamily.black || fontFamily.bold
                        : fontFamily.bold,
                  },
                ]}>
                Today Dashboard
              </Text>
            </View>
            {currentRouteName === 'FunctionScreen' && (
              <View style={styles.activePillBadge}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Item 2: Tasks Backlog */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Tasks Backlog"
            activeOpacity={0.75}
            onPress={() => navigateTo('TasksScreen')}
            style={[
              styles.navItem,
              currentRouteName === 'TasksScreen' && [
                styles.activeNavItem,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                  borderColor: isDark ? '#4F46E5' : '#C7D2FE',
                },
              ],
            ]}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {
                    backgroundColor:
                      currentRouteName === 'TasksScreen'
                        ? '#4F46E5'
                        : isDark
                        ? '#1E1B4B'
                        : '#EEF2FF',
                  },
                ]}>
                <Feather
                  name="check-square"
                  size={16}
                  color={
                    currentRouteName === 'TasksScreen' ? '#FFFFFF' : '#4F46E5'
                  }
                />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {
                    color:
                      currentRouteName === 'TasksScreen'
                        ? isDark
                        ? '#A5B4FC'
                        : '#3730A3'
                        : isDark
                        ? '#E2E8F0'
                        : '#334155',
                  },
                ]}>
                Tasks Backlog
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: isDark ? '#1E293B' : '#E2E8F0'},
              ]}>
              <Text
                style={[
                  styles.countBadgeText,
                  {color: isDark ? '#94A3B8' : '#475569'},
                ]}>
                {pendingTasks} left
              </Text>
            </View>
          </TouchableOpacity>

          {/* Item 3: Habits & Rituals */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Habits & Rituals"
            activeOpacity={0.75}
            onPress={() => navigateTo('HabitsScreen')}
            style={[
              styles.navItem,
              currentRouteName === 'HabitsScreen' && [
                styles.activeNavItem,
                {
                  backgroundColor: isDark ? '#4C0519' : '#FFF1F2',
                  borderColor: isDark ? '#E11D48' : '#FECDD3',
                },
              ],
            ]}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {
                    backgroundColor:
                      currentRouteName === 'HabitsScreen'
                        ? '#E11D48'
                        : isDark
                        ? '#4C0519'
                        : '#FFE4E6',
                  },
                ]}>
                <Feather
                  name="zap"
                  size={16}
                  color={
                    currentRouteName === 'HabitsScreen' ? '#FFFFFF' : '#E11D48'
                  }
                />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {
                    color:
                      currentRouteName === 'HabitsScreen'
                        ? isDark
                        ? '#FDA4AF'
                        : '#BE123C'
                        : isDark
                        ? '#E2E8F0'
                        : '#334155',
                  },
                ]}>
                Habits & Rituals
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: isDark ? '#4C0519' : '#FFE4E6'},
              ]}>
              <Text style={[styles.countBadgeText, {color: '#E11D48'}]}>
                🔥 {streakDays}d
              </Text>
            </View>
          </TouchableOpacity>

          {/* Item 4: Goals & Targets */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Goals & Targets"
            activeOpacity={0.75}
            onPress={() => navigateTo('GoalsScreen')}
            style={[
              styles.navItem,
              currentRouteName === 'GoalsScreen' && [
                styles.activeNavItem,
                {
                  backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                  borderColor: isDark ? '#059669' : '#A7F3D0',
                },
              ],
            ]}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {
                    backgroundColor:
                      currentRouteName === 'GoalsScreen'
                        ? '#059669'
                        : isDark
                        ? '#064E3B'
                        : '#D1FAE5',
                  },
                ]}>
                <Feather
                  name="target"
                  size={16}
                  color={
                    currentRouteName === 'GoalsScreen' ? '#FFFFFF' : '#059669'
                  }
                />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {
                    color:
                      currentRouteName === 'GoalsScreen'
                        ? isDark
                        ? '#6EE7B7'
                        : '#047857'
                        : isDark
                        ? '#E2E8F0'
                        : '#334155',
                  },
                ]}>
                Goals & Targets
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: isDark ? '#064E3B' : '#D1FAE5'},
              ]}>
              <Text style={[styles.countBadgeText, {color: '#059669'}]}>
                Lvl 3
              </Text>
            </View>
          </TouchableOpacity>

          {/* Item 5: Knowledge Vault */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Knowledge Vault"
            activeOpacity={0.75}
            onPress={() => navigateTo('NotesScreen')}
            style={[
              styles.navItem,
              currentRouteName === 'NotesScreen' && [
                styles.activeNavItem,
                {
                  backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                  borderColor: isDark ? '#D97706' : '#FDE68A',
                },
              ],
            ]}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {
                    backgroundColor:
                      currentRouteName === 'NotesScreen'
                        ? '#D97706'
                        : isDark
                        ? '#451A03'
                        : '#FEF3C7',
                  },
                ]}>
                <Feather
                  name="book-open"
                  size={16}
                  color={
                    currentRouteName === 'NotesScreen' ? '#FFFFFF' : '#D97706'
                  }
                />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {
                    color:
                      currentRouteName === 'NotesScreen'
                        ? isDark
                        ? '#FDE68A'
                        : '#B45309'
                        : isDark
                        ? '#E2E8F0'
                        : '#334155',
                  },
                ]}>
                Knowledge Vault
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: isDark ? '#1E293B' : '#E2E8F0'},
              ]}>
              <Text
                style={[
                  styles.countBadgeText,
                  {color: isDark ? '#94A3B8' : '#475569'},
                ]}>
                {notesCount} notes
              </Text>
            </View>
          </TouchableOpacity>

          {/* Item 6: Profile & Trophies */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Profile & Trophies"
            activeOpacity={0.75}
            onPress={() => navigateTo('Profile')}
            style={[
              styles.navItem,
              currentRouteName === 'Profile' && [
                styles.activeNavItem,
                {
                  backgroundColor: isDark ? '#2E1065' : '#F3E8FF',
                  borderColor: isDark ? '#7E22CE' : '#E9D5FF',
                },
              ],
            ]}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {
                    backgroundColor:
                      currentRouteName === 'Profile'
                        ? '#8B5CF6'
                        : isDark
                        ? '#2E1065'
                        : '#F3E8FF',
                  },
                ]}>
                <Feather
                  name="user"
                  size={16}
                  color={
                    currentRouteName === 'Profile' ? '#FFFFFF' : '#8B5CF6'
                  }
                />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {
                    color:
                      currentRouteName === 'Profile'
                        ? isDark
                        ? '#D8B4FE'
                        : '#6B21A8'
                        : isDark
                        ? '#E2E8F0'
                        : '#334155',
                    fontFamily:
                      currentRouteName === 'Profile'
                        ? fontFamily.black || fontFamily.bold
                        : fontFamily.bold,
                  },
                ]}>
                Profile & Trophies
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: isDark ? '#2E1065' : '#EDE9FE'},
              ]}>
              <Text style={[styles.countBadgeText, {color: '#8B5CF6'}]}>
                LVL 14
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Power Tools Section */}
        <View style={styles.sectionGroup}>
          <Text
            style={[
              styles.sectionCategoryTitle,
              {color: isDark ? '#64748B' : '#94A3B8'},
            ]}>
            POWER TOOLS
          </Text>

          {/* Item: Focus Sprint */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Focus Sprint"
            activeOpacity={0.75}
            onPress={() => navigateTo('FocusScreen')}
            style={styles.navItem}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {backgroundColor: isDark ? '#3B0764' : '#F3E8FF'},
                ]}>
                <Feather name="clock" size={16} color="#9333EA" />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {color: isDark ? '#E2E8F0' : '#334155'},
                ]}>
                Focus Sprint
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: isDark ? '#3B0764' : '#F3E8FF'},
              ]}>
              <Text style={[styles.countBadgeText, {color: '#9333EA'}]}>
                Ready
              </Text>
            </View>
          </TouchableOpacity>

          {/* Item: EPQ Analytics */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to EPQ Analytics"
            activeOpacity={0.75}
            onPress={() => navigateTo('AnalyticsScreen')}
            style={styles.navItem}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {backgroundColor: isDark ? '#083344' : '#ECFEFF'},
                ]}>
                <Feather name="bar-chart-2" size={16} color="#0891B2" />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {color: isDark ? '#E2E8F0' : '#334155'},
                ]}>
                EPQ Analytics
              </Text>
            </View>
            <Text
              style={[
                styles.monoBadgeText,
                {color: isDark ? '#94A3B8' : '#64748B'},
              ]}>
              3,490 pts
            </Text>
          </TouchableOpacity>

          {/* Item: Global Search */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Global Search"
            activeOpacity={0.75}
            onPress={() => navigateTo('UniversalSearchScreen')}
            style={styles.navItem}>
            <View style={styles.navItemLeft}>
              <View
                style={[
                  styles.navIconBox,
                  {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
                ]}>
                <Feather name="search" size={16} color="#64748B" />
              </View>
              <Text
                style={[
                  styles.navItemLabel,
                  {color: isDark ? '#E2E8F0' : '#334155'},
                ]}>
                Global Search
              </Text>
            </View>
            <View
              style={[
                styles.kbdBadge,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Text
                style={[
                  styles.kbdBadgeText,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                ⌘K
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 3. Drawer Bottom System Status & Theme Controls */}
      <View
        style={[
          styles.footerContainer,
          {
            backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
            borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
            paddingBottom: Math.max(insets.bottom, 12) + 6,
          },
        ]}>
        {/* Dark Theme Switch Row */}
        <View style={styles.themeRow}>
          <View style={styles.themeLabelGroup}>
            <Feather
              name="moon"
              size={16}
              color="#0284C7"
              style={{marginRight: 8}}
            />
            <Text
              style={[
                styles.themeLabelText,
                {color: isDark ? '#F8FAFC' : '#1E293B'},
              ]}>
              Dark Theme
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{false: '#CBD5E1', true: '#0284C7'}}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* SQLite Local Synced Status */}
        <View
          style={[
            styles.syncPillContainer,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}>
          <View style={styles.syncStatusLeft}>
            <View style={styles.syncPulsingDot} />
            <Text
              style={[
                styles.syncStatusText,
                {color: isDark ? '#E2E8F0' : '#334155'},
              ]}>
              SQLite Local Synced
            </Text>
          </View>
          <Text style={styles.syncPercentage}>100%</Text>
        </View>

        {/* Version & Build Tag */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>GoTASK v2.4</Text>
          <Text style={styles.versionText}>Sprint Ready</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroHeader: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#0369A1',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrap: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  onlineDotBorder: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMetaContainer: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  roleText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: '#E0F2FE',
  },
  roleDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#BAE6FD',
    marginHorizontal: 6,
  },
  lvlBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  lvlBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  statBadgesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  streakEmoji: {
    fontSize: 12,
  },
  xpIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(250, 204, 21, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  xpEmoji: {
    fontSize: 12,
  },
  statCardContent: {
    flex: 1,
  },
  streakCountText: {
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#FEF08A',
  },
  xpCountText: {
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#FEF08A',
  },
  statSubText: {
    fontSize: 9,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  velocitySection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  velocityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  velocityTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  velocityTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  velocityFraction: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#BAE6FD',
  },
  velocityTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
    overflow: 'hidden',
    padding: 1,
  },
  velocityFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  navScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 16,
  },
  sectionGroup: {
    gap: 4,
  },
  sectionCategoryTitle: {
    fontSize: 10,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  activeNavItem: {
    borderWidth: 1,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  activePillBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  monoBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  kbdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  kbdBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  footerContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  themeLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabelText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  syncPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  syncStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncPulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  syncStatusText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  syncPercentage: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#94A3B8',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  versionText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
  },
});

export default DrawerComponent;
