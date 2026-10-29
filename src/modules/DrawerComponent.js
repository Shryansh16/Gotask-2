import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {spacing} from '../styles/spacing';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';

const DrawerComponent = props => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {profile, stats, syncStatus} = useTasks();

  const avatarSource =
    profile?.avatar && profile.avatar.startsWith('http')
      ? {uri: profile.avatar}
      : require('../assets/man.png');

  return (
    <View style={[styles.mainContainer, {backgroundColor: theme.background}]}>
      {/* Header Profile Hero */}
      <View>
        <ImageBackground
          source={require('../assets/background-blue.jpg')}
          style={styles.imageBackground}>
          <View style={styles.avatarRow}>
            <Image
              source={avatarSource}
              style={[styles.profileImage, {borderColor: theme.surface}]}
              defaultSource={require('../assets/man.png')}
            />
            {stats.streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 {stats.streak}d</Text>
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
            <Text style={styles.metricsText}>
              ✓ {stats.completed} Done • ⏳ {stats.pending} Left
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Navigation List */}
      <View style={{flex: 1, backgroundColor: theme.background}}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerList}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>

      {/* Drawer Footer */}
      <View
        style={[
          styles.footerContainer,
          {
            backgroundColor: theme.surfaceSecondary,
            borderTopColor: theme.divider,
          },
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleTheme}
          style={styles.themeToggleBtn}>
          <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
          <Text style={[styles.themeToggleText, {color: theme.textPrimary}]}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
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
          <Text style={[styles.versionText, {color: theme.textMuted}]}>
            GOTask v2.0 • {syncStatus === 'synced' ? 'Online' : 'Offline'}
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
  imageBackground: {
    padding: spacing.PADDING_20,
    paddingTop: spacing.PADDING_36,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_8,
  },
  profileImage: {
    height: spacing.HEIGHT_70 || 70,
    width: spacing.WIDTH_70 || 70,
    borderRadius: 35,
    borderWidth: 2.5,
  },
  streakBadge: {
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
    marginTop: spacing.MARGIN_4,
  },
  profileRole: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  metricsSummary: {
    marginTop: spacing.MARGIN_8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  metricsText: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  drawerList: {
    paddingTop: spacing.PADDING_10,
  },
  footerContainer: {
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_14,
    borderTopWidth: 1,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeToggleIcon: {
    fontSize: textScale(16),
    marginRight: 10,
  },
  themeToggleText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  versionText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
});

export default DrawerComponent;
