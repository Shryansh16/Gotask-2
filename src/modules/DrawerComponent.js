// src/modules/DrawerComponent.js
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { spacing } from '../styles/spacing';
import { fontFamily } from '../common/fonts';

const DrawerComponent = props => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, stats, syncStatus } = useTasks();

  const avatarSource =
    profile?.avatar && profile.avatar.startsWith('http')
      ? { uri: profile.avatar }
      : require('../assets/man.png');

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header Profile Hero with Safe Top Inset */}
      <View
        style={[
          styles.drawerHeader,
          {
            paddingTop: Math.max(insets.top, 24) + 12,
            backgroundColor: isDark ? '#1E1B4B' : '#4F46E5',
          },
        ]}>
        <View style={styles.avatarRow}>
          <Image
            source={avatarSource}
            style={[styles.profileImage, { borderColor: '#FFFFFF' }]}
            defaultSource={require('../assets/man.png')}
          />
          {stats.streak > 0 && (
            <View style={styles.streakBadge}>
              <Feather
                name="zap"
                size={11}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.streakBadgeText}>{stats.streak}d streak</Text>
            </View>
          )}
        </View>

        <Text style={styles.profileName} numberOfLines={1}>
          {profile?.name || 'User'}
        </Text>
        <Text style={styles.profileRole} numberOfLines={1}>
          {profile?.role || 'Productivity Enthusiast'}
        </Text>

        {/* Quick Metrics Bar */}
        <View style={styles.metricsSummary}>
          <Feather
            name="check"
            size={11}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.metricsText}>
            {stats.completed} Done • {stats.pending} Left
          </Text>
        </View>
      </View>

      {/* Navigation List */}
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerList}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>

      {/* Drawer Footer with Safe Bottom Inset */}
      <View
        style={[
          styles.footerContainer,
          {
            backgroundColor: theme.surfaceSecondary,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 14) + 6,
          },
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleTheme}
          style={styles.themeToggleBtn}>
          <Feather
            name={isDark ? 'sun' : 'moon'}
            size={16}
            color={theme.primary}
            style={{ marginRight: 10 }}
          />
          <Text style={[styles.themeToggleText, { color: theme.textPrimary }]}>
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </Text>
        </TouchableOpacity>

        <View style={styles.versionRow}>
          <View
            style={[
              styles.syncDot,
              {
                backgroundColor:
                  syncStatus === 'synced'
                    ? theme.success
                    : syncStatus === 'syncing'
                      ? theme.warning
                      : theme.textMuted,
              },
            ]}
          />
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            GoTask v2.0 • {syncStatus === 'synced' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  profileImage: {
    height: 56,
    width: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fontFamily.bold,
    marginTop: 6,
  },
  profileRole: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  metricsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  metricsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
  },
  drawerList: {
    paddingTop: spacing.small,
  },
  footerContainer: {
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.small + 2,
    borderTopWidth: 1,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeToggleText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  versionText: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
});

export default DrawerComponent;
