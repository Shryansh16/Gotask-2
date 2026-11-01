// src/screens/Profile.js
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import ElevateTabBar from '../components/ElevateTabBar';
import ElevateLeagueLeaderboard from '../components/ElevateLeagueLeaderboard';

const Profile = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {
    profile,
    updateProfile,
    stats,
    syncStatus,
    triggerSync,
    seedSampleTasks,
  } = useTasks();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [role, setRole] = useState(profile?.role || '');
  const [dailyGoal, setDailyGoal] = useState(String(profile?.dailyGoal || 5));

  const handleOpenEdit = () => {
    setName(profile?.name || '');
    setEmail(profile?.email || '');
    setRole(profile?.role || '');
    setDailyGoal(String(profile?.dailyGoal || 5));
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      dailyGoal: parseInt(dailyGoal, 10) || 5,
    });
    setIsEditModalOpen(false);
  };

  const avatarSource =
    profile?.avatar && profile.avatar.startsWith('http')
      ? {uri: profile.avatar}
      : require('../assets/man.png');

  // Gamified achievements aligned with Elevate style
  const achievements = [
    {
      id: 'streak_master',
      title: 'Streak Master',
      desc: '3+ consecutive days active',
      icon: 'zap',
      color: '#F59E0B',
      bg: '#FFFBEB',
      unlocked: stats.streak >= 3,
    },
    {
      id: 'goal_crusher',
      title: 'Goal Crusher',
      desc: `Reached ${profile?.dailyGoal || 5} tasks daily target`,
      icon: 'target',
      color: '#10B981',
      bg: '#ECFDF5',
      unlocked: stats.completed >= (profile?.dailyGoal || 5),
    },
    {
      id: 'high_velocity',
      title: 'High Velocity',
      desc: '75%+ task completion rate',
      icon: 'trending-up',
      color: '#3B82F6',
      bg: '#EFF6FF',
      unlocked: stats.completionRate >= 75 && stats.total > 0,
    },
    {
      id: 'task_veteran',
      title: 'Task Veteran',
      desc: 'Organized 5+ productive tasks',
      icon: 'award',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      unlocked: stats.total >= 5,
    },
  ];

  const targetGoal = Math.max(profile?.dailyGoal || 5, 1);
  const targetPercent = Math.min(
    100,
    Math.round((stats.completed / targetGoal) * 100),
  );

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <Header
        title="My Profile"
        subtitle="Performance, streaks & achievements"
        navigation={navigation}
        rightAction={{
          icon: 'edit-2',
          label: 'Edit',
          onPress: handleOpenEdit,
          accessibilityLabel: 'Edit Profile',
        }}
      />

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Elevate-Grade Profile Performance Hero */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={avatarSource}
                style={[
                  styles.avatar,
                  {borderColor: isDark ? '#38BDF8' : '#00A3FF'},
                ]}
                defaultSource={require('../assets/man.png')}
              />
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={11} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileTextCol}>
              <Text
                style={[styles.userName, {color: theme.textPrimary}]}
                numberOfLines={1}>
                {profile?.name || 'User'}
              </Text>
              <View
                style={[
                  styles.rolePill,
                  {backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF'},
                ]}>
                <Text style={[styles.rolePillText, {color: '#4F46E5'}]}>
                  {profile?.role || 'Productivity Architect'}
                </Text>
              </View>
              <Text
                style={[styles.userEmail, {color: theme.textSecondary}]}
                numberOfLines={1}>
                {profile?.email || 'shryansh@example.com'}
              </Text>
            </View>
          </View>

          {/* Signature Elevate 3-Pill Metrics Row */}
          <View style={styles.elevateMetricsRow}>
            <View
              style={[
                styles.elevateMetricPill,
                {
                  backgroundColor: isDark ? '#2D2305' : '#FEF3C7',
                  borderColor: isDark ? '#78350F' : '#FDE68A',
                  borderBottomColor: isDark ? '#451A03' : '#F59E0B',
                },
              ]}>
              <Text style={styles.elevateMetricEmoji}>🔥</Text>
              <View>
                <Text
                  style={[
                    styles.elevateMetricValue,
                    {color: isDark ? '#FBBF24' : '#B45309'},
                  ]}>
                  {stats.streak}d
                </Text>
                <Text
                  style={[
                    styles.elevateMetricLabel,
                    {color: isDark ? '#FBBF24' : '#92400E'},
                  ]}>
                  STREAK
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.elevateMetricPill,
                {
                  backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
                  borderColor: isDark ? '#065F46' : '#BBF7D0',
                  borderBottomColor: isDark ? '#022C22' : '#22C55E',
                },
              ]}>
              <Text style={styles.elevateMetricEmoji}>🛡️</Text>
              <View>
                <Text
                  style={[
                    styles.elevateMetricValue,
                    {color: isDark ? '#34D399' : '#15803D'},
                  ]}>
                  Emerald
                </Text>
                <Text
                  style={[
                    styles.elevateMetricLabel,
                    {color: isDark ? '#34D399' : '#166534'},
                  ]}>
                  LEAGUE
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.elevateMetricPill,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#FEF9C3',
                  borderColor: isDark ? '#3730A3' : '#FEF08A',
                  borderBottomColor: isDark ? '#1E1B4B' : '#EAB308',
                },
              ]}>
              <Text style={styles.elevateMetricEmoji}>⭐</Text>
              <View>
                <Text
                  style={[
                    styles.elevateMetricValue,
                    {color: isDark ? '#A5B4FC' : '#A16207'},
                  ]}>
                  {stats.completed * 25 + stats.streak * 50}
                </Text>
                <Text
                  style={[
                    styles.elevateMetricLabel,
                    {color: isDark ? '#A5B4FC' : '#854D0E'},
                  ]}>
                  TOTAL XP
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Target Momentum Card */}
        <View
          style={[
            styles.targetCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          <View style={styles.targetHeaderRow}>
            <View style={styles.targetIconCircle}>
              <Feather name="target" size={18} color="#10B981" />
            </View>
            <View style={styles.targetTitleCol}>
              <Text
                style={[styles.targetTitle, {color: theme.textPrimary}]}>
                Daily Target Progress
              </Text>
              <Text style={[styles.targetSub, {color: theme.textSecondary}]}>
                {stats.completed} of {targetGoal} tasks completed today
              </Text>
            </View>
            <View style={styles.targetPercentBadge}>
              <Text style={styles.targetPercentText}>{targetPercent}%</Text>
            </View>
          </View>

          {/* Thick 8px rounded progress bar */}
          <View
            style={[
              styles.progressBarTrack,
              {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
            ]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(targetPercent, 4)}%`,
                  backgroundColor:
                    targetPercent === 100 ? '#10B981' : '#4F46E5',
                },
              ]}
            />
          </View>
        </View>

        {/* Elevate Emerald League & Leaderboard (Image 3) */}
        <ElevateLeagueLeaderboard
          userXP={stats.totalTasks * 50 + stats.completed * 100}
        />

        {/* Productivity Trophy Case (Badges Grid) */}
        <View style={styles.trophySection}>
          <View style={styles.sectionTitleRow}>
            <Feather
              name="award"
              size={18}
              color="#F59E0B"
              style={{marginRight: 6}}
            />
            <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
              Productivity Trophy Case
            </Text>
          </View>

          <View style={styles.badgesGrid}>
            {achievements.map(item => (
              <View
                key={item.id}
                style={[
                  styles.badgeCard,
                  {
                    backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
                    borderColor: item.unlocked
                      ? item.color
                      : isDark
                      ? '#1E293B'
                      : '#E2E8F0',
                  },
                ]}>
                <View
                  style={[
                    styles.badgeIconCircle,
                    {
                      backgroundColor: item.unlocked
                        ? isDark
                          ? '#1E1B4B'
                          : item.bg
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                    },
                  ]}>
                  <Feather
                    name={item.icon}
                    size={22}
                    color={item.unlocked ? item.color : theme.textMuted}
                  />
                </View>
                <Text
                  style={[styles.badgeTitle, {color: theme.textPrimary}]}
                  numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.badgeDesc, {color: theme.textSecondary}]}
                  numberOfLines={2}>
                  {item.desc}
                </Text>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: item.unlocked
                        ? isDark
                          ? '#064E3B'
                          : '#ECFDF5'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: item.unlocked ? '#10B981' : theme.textMuted,
                      },
                    ]}>
                    {item.unlocked ? '✓ UNLOCKED' : 'IN PROGRESS'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Cloud Backup & Sync Action Tile */}
        <View
          style={[
            styles.actionCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <View style={[styles.actionIconCircle, {backgroundColor: '#ECFEFF'}]}>
            <Feather name="cloud" size={18} color="#06B6D4" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionCardTitle, {color: theme.textPrimary}]}>
              Cloud Backup & Sync
            </Text>
            <Text style={[styles.actionCardSub, {color: theme.textSecondary}]}>
              {syncStatus === 'synced'
                ? 'All tasks synced to cloud'
                : syncStatus === 'syncing'
                ? 'Syncing in progress...'
                : 'Offline mode active'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={triggerSync}
            style={styles.syncButton}>
            <Feather
              name="refresh-cw"
              size={13}
              color="#FFFFFF"
              style={{marginRight: 4}}
            />
            <Text style={styles.syncButtonText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Load Demo Data Action Tile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Seed Sample Tasks',
              'Load standard sample tasks for high productivity demonstration?',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Load Data', onPress: () => seedSampleTasks()},
              ],
            );
          }}
          style={[
            styles.actionCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              marginTop: 10,
            },
          ]}>
          <View style={[styles.actionIconCircle, {backgroundColor: '#EEF2FF'}]}>
            <Feather name="download" size={18} color="#4F46E5" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionCardTitle, {color: theme.textPrimary}]}>
              Load Demo Productivity Data
            </Text>
            <Text style={[styles.actionCardSub, {color: theme.textSecondary}]}>
              Instantly populate goals, tasks, and habits
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="me" navigation={navigation} />

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, {color: theme.textPrimary}]}>
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Feather name="x" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.textPrimary,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Role / Title
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.textPrimary,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Senior Designer"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.textPrimary,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Daily Target Tasks
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.textPrimary,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              value={dailyGoal}
              onChangeText={setDailyGoal}
              placeholder="5"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
            />

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={[
                  styles.modalCancelBtn,
                  {borderColor: theme.border},
                ]}>
                <Text
                  style={[styles.modalBtnText, {color: theme.textSecondary}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={[styles.modalSaveBtn, {backgroundColor: '#4F46E5'}]}>
                <Text style={[styles.modalBtnText, {color: '#FFFFFF'}]}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Full bottom clearance
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderBottomWidth: 5, // Elevate 3D bevel
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#00A3FF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextCol: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.4,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  rolePillText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  elevateMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  elevateMetricPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    marginHorizontal: 3,
  },
  elevateMetricEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  elevateMetricValue: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.2,
  },
  elevateMetricLabel: {
    fontSize: 9,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  targetCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    borderLeftWidth: 6,
    borderLeftColor: '#10B981',
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  targetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  targetTitleCol: {
    flex: 1,
  },
  targetTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  targetSub: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  targetPercentBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetPercentText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#10B981',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trophySection: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  actionCardSub: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: fontFamily.bold,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    marginBottom: 6,
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  modalActionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 10,
  },
  modalSaveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
});

export default Profile;
