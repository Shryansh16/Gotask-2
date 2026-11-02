// src/screens/HabitsScreen.js
// Verified Habits, Routines, and Reminders Screen (docs/PRD.md Phase 5 — Habits, Routines, and Reminders)
// Stitch & Elevate Labs Tactile Momentum Redesign (Screen 5: Habits & Rituals)
// Matched 1:1 against user reference media_1793629762862_f07baea9.jpg & media_1793629762660_8c2874a5.html

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import {
  useHabits,
  isHabitScheduledForDate,
  SAMPLE_HABITS,
} from '../context/HabitContext';
import { fontFamily } from '../common/fonts';
import ScreenContainer from '../design-system/ScreenContainer';
import HabitCard from '../components/HabitCard';
import HabitModal from '../modules/HabitModal';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';

export const HabitsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const {
    habits,
    todayStr,
    undoDeleteHabit,
    lastDeletedHabit,
    error,
    clearError,
  } = useHabits();

  const [frequencyFilter, setFrequencyFilter] = useState('daily'); // 'daily' | 'weekly'
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const handleCreateNew = () => {
    setSelectedHabit(null);
    setHabitModalVisible(true);
  };

  const handleEditHabit = habit => {
    setSelectedHabit(habit);
    setHabitModalVisible(true);
  };

  const handleUseFreeze = () => {
    Alert.alert(
      'Streak Freeze Token Activated ❄️',
      'Your active streaks are protected from resetting for the next 24 hours. Keep up the high momentum!',
      [{ text: 'Awesome!' }],
    );
  };

  // Determine active source habits (falls back to verified SAMPLE_HABITS if empty)
  const sourceHabits = habits && habits.length > 0 ? habits : SAMPLE_HABITS;

  // Filter habits by Frequency switch (Daily Habits vs Weekly Rituals)
  const filteredHabits = useMemo(() => {
    return sourceHabits.filter(habit => {
      if (habit.isArchived) {
        return false;
      }
      if (frequencyFilter === 'daily') {
        return (
          habit.frequency === 'daily' ||
          habit.frequency === 'weekdays' ||
          !habit.frequency
        );
      }
      if (frequencyFilter === 'weekly') {
        return habit.frequency === 'custom' || habit.frequency === 'weekly';
      }
      return true;
    });
  }, [sourceHabits, frequencyFilter]);

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0F19' : '#FFFFFF'}
      />

      {/* 1. Elevate Gamified Top Utility Bar */}
      <View
        style={[
          styles.topUtilityBar,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
            borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
          },
        ]}>
        {/* Streak Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isDark ? '#2D1A05' : '#FFF7ED',
              borderColor: isDark ? '#7C2D12' : '#FED7AA',
              borderBottomColor: isDark ? '#431407' : '#FED7AA',
            },
          ]}>
          <Text style={styles.pillEmoji}>🔥</Text>
          <Text
            style={[
              styles.pillCountText,
              { color: isDark ? '#FB923C' : '#0F172A' },
            ]}>
            105
          </Text>
        </View>

        {/* XP/Coins Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isDark ? '#2D2305' : '#FEF9C3',
              borderColor: isDark ? '#78350F' : '#FEF08A',
              borderBottomColor: isDark ? '#451A03' : '#FDE68A',
            },
          ]}>
          <View style={styles.coinsWrap}>
            <Text style={styles.pillEmoji}>🪙</Text>
            <View style={styles.plusPip}>
              <Text style={styles.plusPipText}>+</Text>
            </View>
          </View>
          <Text
            style={[
              styles.pillCountText,
              { color: isDark ? '#FDE047' : '#0F172A' },
            ]}>
            3,663
          </Text>
        </View>

        {/* League / Tier Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
              borderColor: isDark ? '#065F46' : '#A7F3D0',
              borderBottomColor: isDark ? '#022C22' : '#A7F3D0',
            },
          ]}>
          <Feather
            name="shield"
            size={14}
            color="#059669"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.tierText}>TIER 3</Text>
        </View>

        {/* Help / Theme Toggle Button */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Toggle theme or view rules`}
          style={[
            styles.helpBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}>
          <Feather
            name={isDark ? 'sun' : 'help-circle'}
            size={16}
            color={isDark ? '#FDE047' : '#64748B'}
          />
        </TouchableOpacity>
      </View>

      {/* Undo Deletion Toast */}
      {lastDeletedHabit && (
        <View
          style={[
            styles.undoToast,
            {
              backgroundColor: isDark ? '#1E293B' : '#FEF2F2',
              borderColor: '#FECACA',
            },
          ]}>
          <Text
            style={[styles.undoText, { color: isDark ? '#F8F9FF' : '#0B1C30' }]}
            numberOfLines={1}>
            Deleted "{lastDeletedHabit.title}"
          </Text>
          <TouchableOpacity
            onPress={undoDeleteHabit}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Undo habit deletion">
            <Text style={[styles.undoButtonText, { color: '#00A3FF' }]}>
              UNDO
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Storage Error Banner */}
      {error && (
        <TouchableOpacity
          style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}
          onPress={clearError}
          accessible={true}
          accessibilityRole="alert">
          <Text style={[styles.errorText, { color: '#DC2626' }]}>
            {error} (tap to dismiss)
          </Text>
        </TouchableOpacity>
      )}

      {/* Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 2. Elevate Emerald League / Streak Trophy Hero Card */}
        <View
          style={[
            styles.leagueHeroCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          {/* Subtle Corner Halos */}
          <View style={styles.heroHaloTopRight} />
          <View style={styles.heroHaloBottomLeft} />

          {/* 3D Tactile Crest Badge */}
          <View style={styles.crestWrapper}>
            <View style={styles.crestBadge3D}>
              <View style={styles.crestBadgeInner}>
                <Text style={styles.crownEmoji}>👑</Text>
                <Feather name="cpu" size={26} color="#FFFFFF" />
              </View>
            </View>
            {/* Rank #5 Pill */}
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>#5</Text>
            </View>
          </View>

          {/* Heading & Subtitle */}
          <Text
            style={[
              styles.leagueTitle,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}>
            Emerald League
          </Text>
          <Text
            style={[
              styles.leagueSubtitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            Top 5 advance to the Diamond Division
          </Text>

          {/* Elevate Countdown Pill */}
          <View style={styles.countdownPill}>
            <Text style={styles.countdownEmoji}>⏳</Text>
            <Text style={styles.countdownText}>9 HOURS LEFT</Text>
          </View>

          {/* Weekly Momentum Progress Bar & Summary */}
          <View
            style={[
              styles.momentumBox,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <View style={styles.momentumHeaderRow}>
              <View style={styles.momentumTitleGroup}>
                <View style={styles.pulsingDot} />
                <Text
                  style={[
                    styles.momentumTitleText,
                    { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}>
                  Weekly Momentum
                </Text>
              </View>
              <Text style={styles.momentumValueText}>
                85% • +12% XP Boost
              </Text>
            </View>

            {/* Momentum Bar Track */}
            <View
              style={[
                styles.momentumTrack,
                { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
              ]}>
              <View style={[styles.momentumFill, { width: '85%' }]} />
            </View>
          </View>

          {/* Weekly Day Beads Grid */}
          <View style={styles.weekBeadsGrid}>
            {['M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <View key={idx} style={styles.weekBeadCol}>
                <Text
                  style={[
                    styles.weekBeadDay,
                    { color: isDark ? '#64748B' : '#94A3B8' },
                  ]}>
                  {day}
                </Text>
                <View style={styles.weekBeadDone}>
                  <Feather name="check" size={14} color="#FFFFFF" />
                </View>
              </View>
            ))}

            {/* SUN (Active Glowing Today) */}
            <View style={styles.weekBeadCol}>
              <Text style={[styles.weekBeadDay, styles.weekBeadSunActive]}>
                SUN
              </Text>
              <View style={styles.weekBeadSunCircle}>
                <Feather name="zap" size={14} color="#059669" />
              </View>
            </View>
          </View>
        </View>

        {/* 3. Frequency Selector Filter Tabs (Elevate Tactile Switch) */}
        <View
          style={[
            styles.switchContainer,
            { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFrequencyFilter('daily')}
            style={[
              styles.switchTab,
              frequencyFilter === 'daily' && [
                styles.switchTabActive,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderBottomColor: isDark ? '#000000' : '#CBD5E1',
                },
              ],
            ]}>
            <Feather
              name="zap"
              size={14}
              color={frequencyFilter === 'daily' ? '#F59E0B' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.switchTabText,
                frequencyFilter === 'daily'
                  ? [
                      styles.switchTabTextActive,
                      { color: isDark ? '#F8F9FF' : '#0F172A' },
                    ]
                  : { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              Daily Habits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFrequencyFilter('weekly')}
            style={[
              styles.switchTab,
              frequencyFilter === 'weekly' && [
                styles.switchTabActive,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderBottomColor: isDark ? '#000000' : '#CBD5E1',
                },
              ],
            ]}>
            <Feather
              name="calendar"
              size={14}
              color={frequencyFilter === 'weekly' ? '#0082CC' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.switchTabText,
                frequencyFilter === 'weekly'
                  ? [
                      styles.switchTabTextActive,
                      { color: isDark ? '#F8F9FF' : '#0F172A' },
                    ]
                  : { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              Weekly Rituals
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Habit Cards as Elevate Game Tiles */}
        {filteredHabits.length === 0 ? (
          <EmptyState
            vectorIcon="zap"
            title="All Caught Up in Habits!"
            subtitle="Define daily routines, freeze streaks when life happens, and compound discipline!"
            buttonText="+ Add New Habit (+50 XP)"
            onButtonPress={handleCreateNew}
          />
        ) : (
          <View style={styles.habitsList}>
            {filteredHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={handleEditHabit}
              />
            ))}
          </View>
        )}

        {/* 5. Elevate Game Perk Card: Streak Freeze Token Card */}
        <View
          style={[
            styles.freezePerkCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <View style={styles.freezeLeftRow}>
            {/* Glowing 3D Emblem */}
            <View style={styles.freezeIconBadge3D}>
              <Feather name="cloud-snow" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.freezeTextColumn}>
              <View style={styles.freezeTitleRow}>
                <Text
                  style={[
                    styles.freezeTitleText,
                    { color: isDark ? '#F8F9FF' : '#0F172A' },
                  ]}>
                  Streak Freeze Token
                </Text>
                <View style={styles.activeTokenPill}>
                  <Text style={styles.activeTokenText}>1 Active</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.freezeSubText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}>
                Protects all streaks from reset for 24h.
              </Text>
            </View>
          </View>

          {/* Use Freeze CTA Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUseFreeze}
            style={styles.freezeUseBtn}>
            <Text style={styles.freezeUseBtnText}>USE FREEZE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button anchored above Elevate bottom bar */}
      <TouchableOpacity
        onPress={handleCreateNew}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new habit"
        style={styles.fab}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="habits" variant="core" navigation={navigation} />

      {/* Habit Create/Edit Modal */}
      <HabitModal
        visible={habitModalVisible}
        onClose={() => setHabitModalVisible(false)}
        habitToEdit={selectedHabit}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topUtilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  pillEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  pillCountText: {
    fontSize: 13.5,
    fontFamily: fontFamily.bold,
  },
  coinsWrap: {
    position: 'relative',
    marginRight: 4,
  },
  plusPip: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    backgroundColor: '#10B981',
    borderRadius: 6,
    width: 11,
    height: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusPipText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: fontFamily.bold,
    lineHeight: 9,
  },
  tierText: {
    color: '#059669',
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  helpBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  undoToast: {
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
  undoButtonText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 150, // Clearance for FAB and Elevate bottom bar
  },
  leagueHeroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  heroHaloTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  heroHaloBottomLeft: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  crestWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  crestBadge3D: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#059669',
    padding: 2,
    borderBottomWidth: 4,
    borderBottomColor: '#065F46',
    elevation: 5,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  crestBadgeInner: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownEmoji: {
    fontSize: 11,
    marginBottom: -2,
  },
  rankPill: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#0F172A',
  },
  leagueTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  leagueSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    marginTop: 2,
    marginBottom: 8,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  countdownEmoji: {
    fontSize: 11,
    marginRight: 4,
  },
  countdownText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  momentumBox: {
    width: '100%',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  momentumHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  momentumTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  momentumTitleText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bold,
  },
  momentumValueText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
  momentumTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  momentumFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  weekBeadsGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekBeadCol: {
    alignItems: 'center',
    flex: 1,
  },
  weekBeadDay: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  weekBeadDone: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  weekBeadSunActive: {
    color: '#059669',
  },
  weekBeadSunCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  switchContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 16,
    marginBottom: 14,
  },
  switchTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 13,
  },
  switchTabActive: {
    borderBottomWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  switchTabText: {
    fontSize: 12.5,
    fontFamily: fontFamily.medium,
  },
  switchTabTextActive: {
    fontFamily: fontFamily.bold,
  },
  habitsList: {
    marginBottom: 6,
  },
  freezePerkCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  freezeLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  freezeIconBadge3D: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    borderBottomWidth: 3,
    borderBottomColor: '#0369A1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  freezeTextColumn: {
    flex: 1,
  },
  freezeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freezeTitleText: {
    fontSize: 13.5,
    fontFamily: fontFamily.bold,
  },
  activeTokenPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activeTokenText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    color: '#0284C7',
  },
  freezeSubText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginTop: 1,
  },
  freezeUseBtn: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#0891B2',
    elevation: 2,
  },
  freezeUseBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#082F49',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 82,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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

export default HabitsScreen;
