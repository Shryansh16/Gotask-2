// src/screens/Profile.js
import React, { useState } from 'react';
import {
  SafeAreaView,
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
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import HemburgerButton from '../modules/HemburgerButton';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';

const Profile = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
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
      ? { uri: profile.avatar }
      : require('../assets/man.png');

  // Achievement logic
  const achievements = [
    {
      id: 'streak_master',
      title: 'Streak Master',
      desc: 'Maintained 3+ days consistency',
      icon: '🔥',
      unlocked: stats.streak >= 3,
    },
    {
      id: 'goal_crusher',
      title: 'Goal Crusher',
      desc: `Reached daily goal of ${profile.dailyGoal || 5} tasks`,
      icon: '🎯',
      unlocked: stats.completed >= (profile.dailyGoal || 5),
    },
    {
      id: 'high_velocity',
      title: 'High Velocity',
      desc: 'Achieved 75%+ completion rate',
      icon: '⚡',
      unlocked: stats.completionRate >= 75 && stats.total > 0,
    },
    {
      id: 'task_veteran',
      title: 'Task Veteran',
      desc: 'Added 5+ productive tasks',
      icon: '🏆',
      unlocked: stats.total >= 5,
    },
  ];

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <HemburgerButton onPressButton={() => navigation.openDrawer()} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Profile</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenEdit}
          style={[styles.editHeaderBtn, { backgroundColor: theme.primaryLight }]}
        >
          <Text style={[styles.editHeaderText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card Hero */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={avatarSource}
              style={[styles.avatar, { borderColor: theme.primary }]}
              defaultSource={require('../assets/man.png')}
            />
            <View style={[styles.avatarBadge, { backgroundColor: theme.success }]}>
              <Text style={styles.avatarBadgeText}>✓</Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: theme.textPrimary }]}>
            {profile?.name || 'User'}
          </Text>
          <Text style={[styles.userRole, { color: theme.primary }]}>
            {profile?.role || 'Productivity Enthusiast'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textMuted }]}>
            {profile?.email || 'shryansh@example.com'}
          </Text>

          {/* Quick Metrics Strip */}
          <View
            style={[
              styles.metricsStrip,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          >
            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
                {stats.total}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Total
              </Text>
            </View>
            <View style={[styles.metricSep, { backgroundColor: theme.divider }]} />
            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: theme.success }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Done
              </Text>
            </View>
            <View style={[styles.metricSep, { backgroundColor: theme.divider }]} />
            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: theme.warning }]}>
                {stats.pending}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Pending
              </Text>
            </View>
            <View style={[styles.metricSep, { backgroundColor: theme.divider }]} />
            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: theme.primary }]}>
                {stats.streak}d
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Streak
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Goal Target Card */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Daily Task Target
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Goal: {profile?.dailyGoal || 5} tasks completed / day
              </Text>
            </View>
            <Text style={[styles.goalPercentText, { color: theme.primary }]}>
              {Math.min(
                100,
                Math.round(
                  (stats.completed / Math.max(profile?.dailyGoal || 5, 1)) * 100
                )
              )}
              %
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.primary,
                  width: `${Math.min(
                    100,
                    Math.max(
                      (stats.completed / Math.max(profile?.dailyGoal || 5, 1)) * 100,
                      4
                    )
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Productivity Badges & Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
            Productivity Badges
          </Text>

          <View style={styles.badgesGrid}>
            {achievements.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.badgeCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: item.unlocked ? theme.primary : theme.border,
                    opacity: item.unlocked ? 1 : 0.55,
                  },
                  item.unlocked ? theme.cardShadow : null,
                ]}
              >
                <Text style={styles.badgeIcon}>{item.icon}</Text>
                <Text
                  style={[styles.badgeTitle, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.badgeDesc, { color: theme.textMuted }]}
                  numberOfLines={2}
                >
                  {item.desc}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: item.unlocked
                        ? theme.successLight
                        : theme.surfaceSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: item.unlocked ? theme.success : theme.textMuted },
                    ]}
                  >
                    {item.unlocked ? 'Unlocked 🌟' : 'In Progress'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Sync & Cloud Management */}
        <View
          style={[
            styles.syncCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <View style={styles.syncLeft}>
            <Text style={[styles.syncTitle, { color: theme.textPrimary }]}>
              Cloud Backup & Sync
            </Text>
            <Text style={[styles.syncSubtitle, { color: theme.textMuted }]}>
              Status:{' '}
              {syncStatus === 'synced'
                ? 'Fully Synchronized'
                : syncStatus === 'syncing'
                ? 'Syncing changes...'
                : 'Offline mode active'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={triggerSync}
            style={[styles.syncBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.syncBtnText}>Sync Now 🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Restore Sample Data */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              'Seed Sample Tasks',
              'Load standard sample tasks for high productivity demonstration?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Load Data', onPress: () => seedSampleTasks() },
              ]
            );
          }}
          style={[
            styles.sampleDataBtn,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sampleDataText, { color: theme.primary }]}>
            📥 Load Sample Demo Tasks
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Edit Profile
            </Text>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Shryansh Shree"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Role / Title
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Productivity Architect"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="e.g. shryansh@example.com"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Daily Target (Tasks)
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={dailyGoal}
              onChangeText={setDailyGoal}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor={theme.textMuted}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveProfile}
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  editHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  editHeaderText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    padding: spacing.PADDING_16,
    paddingBottom: spacing.PADDING_40,
  },
  profileCard: {
    borderRadius: 24,
    padding: spacing.PADDING_20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.MARGIN_16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.MARGIN_10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarBadgeText: {
    color: '#FFFFFF',
    fontSize: textScale(10),
    fontWeight: 'bold',
  },
  userName: {
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
    marginTop: 4,
  },
  userRole: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  userEmail: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  metricsStrip: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 16,
    marginTop: spacing.MARGIN_16,
    paddingVertical: spacing.PADDING_12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricColumn: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
  },
  metricLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  metricSep: {
    width: 1,
    height: 24,
  },
  sectionCard: {
    borderRadius: 20,
    padding: spacing.PADDING_16,
    borderWidth: 1,
    marginBottom: spacing.MARGIN_16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: textScale(15),
    fontFamily: fontFamily.bold,
  },
  sectionSubtitle: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  goalPercentText: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  achievementsSection: {
    marginBottom: spacing.MARGIN_16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    borderRadius: 16,
    padding: spacing.PADDING_14,
    borderWidth: 1.5,
    marginBottom: spacing.MARGIN_12,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: textScale(24),
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: textScale(10),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginTop: 4,
    minHeight: 28,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  statusPillText: {
    fontSize: textScale(9),
    fontFamily: fontFamily.bold,
  },
  syncCard: {
    borderRadius: 20,
    padding: spacing.PADDING_16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_16,
  },
  syncLeft: {
    flex: 1,
    marginRight: 10,
  },
  syncTitle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
  syncSubtitle: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  syncBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  sampleDataBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleDataText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.PADDING_20,
  },
  modalContent: {
    borderRadius: 24,
    padding: spacing.PADDING_20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
    marginBottom: spacing.MARGIN_16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.MARGIN_20,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  modalSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
});

export default Profile;
