// src/components/ElevateQuests.js
// Pixel-perfect replica of Elevate's "Quests" gamified challenge system (Image 2)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

export const ElevateQuests = ({
  completedTasksCount = 0,
  streakDays = 1,
  focusSessionsCount = 0,
  onPressQuest,
}) => {
  const {theme, isDark} = useTheme();

  // Quest definitions mapped to user productivity actions
  const quests = [
    {
      id: 'streak',
      title: 'Extend your streak',
      icon: 'zap',
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
      progress: Math.min(1, streakDays >= 1 ? 1 : 0),
      current: streakDays >= 1 ? 1 : 0,
      target: 1,
      isCompleted: streakDays >= 1,
      rewardIcon: 'gift',
      rewardColor: '#00A3FF',
    },
    {
      id: 'tasks',
      title: 'Complete 3 daily tasks',
      icon: 'check-circle',
      iconColor: '#10B981',
      iconBg: '#DCFCE7',
      progress: Math.min(1, completedTasksCount / 3),
      current: Math.min(completedTasksCount, 3),
      target: 3,
      isCompleted: completedTasksCount >= 3,
    },
    {
      id: 'focus',
      title: 'Complete 2 focus sessions',
      icon: 'clock',
      iconColor: '#00A3FF',
      iconBg: '#E0F2FE',
      progress: Math.min(1, focusSessionsCount / 2),
      current: Math.min(focusSessionsCount, 2),
      target: 2,
      isCompleted: focusSessionsCount >= 2,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section Header with Elevate's Countdown Pill */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: isDark ? '#94A3B8' : '#64748B'}]}>
          DAILY QUESTS
        </Text>
        <View style={styles.timerPill}>
          <Text style={styles.timerIcon}>⏳</Text>
          <Text style={styles.timerText}>4 HOURS LEFT</Text>
        </View>
      </View>

      {/* Quest Cards with 3D Bevels */}
      {quests.map(quest => (
        <TouchableOpacity
          key={quest.id}
          accessibilityRole="button"
          accessibilityLabel={`Quest: ${quest.title}, ${quest.current} of ${quest.target} completed`}
          activeOpacity={0.8}
          onPress={() => onPressQuest && onPressQuest(quest)}
          style={[
            styles.questCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          {/* Top Row: Icon + Title + Chevron or Gift */}
          <View style={styles.cardTopRow}>
            <View style={styles.titleWithIcon}>
              <View
                style={[
                  styles.questIconContainer,
                  {backgroundColor: isDark ? '#1E293B' : quest.iconBg},
                ]}>
                <Feather name={quest.icon} size={16} color={quest.iconColor} />
              </View>
              <Text
                style={[
                  styles.questTitle,
                  {color: isDark ? '#F8FAFC' : '#0F172A'},
                ]}>
                {quest.title}
              </Text>
            </View>

            {quest.rewardIcon ? (
              <View style={styles.rewardContainer}>
                <Feather name={quest.rewardIcon} size={22} color={quest.rewardColor} />
              </View>
            ) : (
              <Feather
                name="chevron-right"
                size={18}
                color={isDark ? '#64748B' : '#94A3B8'}
              />
            )}
          </View>

          {/* Bottom Row: Thick Rounded Progress Bar & Fraction Counter */}
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressBarBg,
                {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
              ]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.round(quest.progress * 100)}%`,
                    backgroundColor: quest.isCompleted ? '#10B981' : '#00A3FF',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.counterText,
                {color: isDark ? '#94A3B8' : '#64748B'},
              ]}>
              {quest.current}/{quest.target}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  timerIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  timerText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#D97706',
    letterSpacing: 0.4,
  },
  questCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderBottomWidth: 4, // 3D tactile bevel
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  questTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    flex: 1,
  },
  rewardContainer: {
    paddingLeft: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  counterText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    minWidth: 26,
    textAlign: 'right',
  },
});

export default ElevateQuests;

