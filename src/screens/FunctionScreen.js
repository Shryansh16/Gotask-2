// src/screens/FunctionScreen.js
// Screen 1: Today Dashboard (Stitch & Elevate Labs Tactile Momentum Redesign)

import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {ScreenContainer} from '../design-system';
import {fontFamily} from '../common/fonts';
import StatsOverview from '../modules/StatsOverview';
import YourTask from '../modules/YourTask';
import TaskModal from '../modules/TaskModal';
import ElevateTabBar from '../components/ElevateTabBar';

const FunctionScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, isDark, toggleTheme} = useTheme();
  const {stats} = useTasks();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  return (
    <ScreenContainer scrollable={false}>
      {/* Stitch Dashboard Top Status Bar (Matches Uploaded Image 1:1) */}
      <View
        style={[
          styles.statusBarRow,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
          },
        ]}>
        {/* Left Status Pills: Flame Streak, XP, Premium */}
        <View style={styles.statusPillsGroup}>
          {/* Flame Streak Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDark ? '#451A03' : '#FFF1E8',
                borderColor: isDark ? '#78350F' : '#FFD7BE',
              },
            ]}>
            <Text style={styles.pillEmoji}>🔥</Text>
            <Text
              style={[
                styles.pillText,
                {color: isDark ? '#FBBF24' : '#E65100'},
              ]}>
              {stats.streak || 105}
            </Text>
          </View>

          {/* XP Coins Pill with Green (+) Badge */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDark ? '#2D2305' : '#FEF9C3',
                borderColor: isDark ? '#78350F' : '#FEF08A',
              },
            ]}>
            <Text style={styles.pillEmoji}>🪙</Text>
            <Text
              style={[
                styles.pillText,
                {color: isDark ? '#FDE047' : '#A16207'},
              ]}>
              3,663
            </Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>+</Text>
            </View>
          </View>

          {/* Premium Brain Pill with Dot */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDark ? '#2E1065' : '#F3E8FF',
                borderColor: isDark ? '#581C87' : '#E9D5FF',
              },
            ]}>
            <Text style={styles.pillEmoji}>🧠</Text>
            <Text
              style={[
                styles.pillText,
                {color: isDark ? '#D8B4FE' : '#6B21A8'},
              ]}>
              Premium
            </Text>
            <View style={styles.liveDot} />
          </View>
        </View>

        {/* Right Action Icons (Sun Toggle & Settings / Menu) */}
        <View style={styles.topRightIcons}>
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
              size={16}
              color={isDark ? '#FBBF24' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open settings or drawer"
            activeOpacity={0.7}
            onPress={() => navigation.openDrawer()}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                marginLeft: 8,
              },
            ]}>
            <Feather
              name="settings"
              size={16}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Dashboard Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Stitch Image 2: High-Impact Sprint Hero, Active Sprint Streams, Domains, Insight */}
        <StatsOverview />

        {/* Today's Agenda (Matches Image 2 Directly) */}
        <YourTask
          title="Today's Agenda"
          filterToday={true}
          showSort={false}
          onOpenCreateModal={() => setIsCreateModalVisible(true)}
        />
      </ScrollView>

      {/* Floating Action Button (FAB) safely anchored above bottom tab bar */}
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

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="today" variant="core" navigation={navigation} />

      {/* Create Task Modal */}
      <TaskModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  statusBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statusPillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  pillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  pillText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  plusBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  plusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 11,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A3FF',
    marginLeft: 5,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 6,
    paddingBottom: 150, // Clearance for FAB and ElevateTabBar
  },
  fab: {
    position: 'absolute',
    bottom: 78, // Floats cleanly right above ElevateTabBar
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4, // Elevate 3D tactile button bevel
    elevation: 8,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10,
  },
});

export default FunctionScreen;
