// src/screens/FunctionScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import HemburgerButton from '../modules/HemburgerButton';
import StatsOverview from '../modules/StatsOverview';
import SearchBar from '../modules/SearchBar';
import QuotesBanner from '../modules/QuotesBanner';
import Categories from '../modules/Categories';
import YourTask from '../modules/YourTask';
import TaskModal from '../modules/TaskModal';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';

const FunctionScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { syncStatus, triggerSync } = useTasks();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  function onPressDrawer() {
    navigation.openDrawer();
  }

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Top Navigation Bar */}
      <View style={[styles.headerContainer, { borderBottomColor: theme.divider }]}>
        <View style={styles.headerLeft}>
          <HemburgerButton onPressButton={onPressDrawer} />
          <View>
            <Text style={[styles.brandTitle, { color: theme.primary }]}>GoTask</Text>
            <View style={styles.syncRow}>
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
              <Text style={[styles.syncText, { color: theme.textMuted }]}>
                {syncStatus === 'synced'
                  ? 'Cloud Synced'
                  : syncStatus === 'syncing'
                  ? 'Syncing...'
                  : 'Offline Ready'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Quick Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: theme.surfaceSecondary }]}
          >
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {/* Cloud Sync Button */}
          <TouchableOpacity
            onPress={triggerSync}
            style={[styles.iconButton, { backgroundColor: theme.surfaceSecondary, marginLeft: 8 }]}
          >
            <Text style={styles.themeIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Dashboard Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Productivity Summary Card */}
        <StatsOverview />

        {/* Live Search & Filter Bar */}
        <SearchBar />

        {/* Daily Motivation Carousel */}
        <QuotesBanner />

        {/* Categories Section */}
        <Categories />

        {/* Dynamic Task List */}
        <YourTask onOpenCreateModal={() => setIsCreateModalVisible(true)} />
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsCreateModalVisible(true)}
        style={[
          styles.fab,
          { backgroundColor: theme.primary },
          theme.glowShadow,
        ]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>

      {/* Create Task Modal */}
      <TaskModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: textScale(20),
    fontFamily: fontFamily.black,
    letterSpacing: -0.3,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  syncText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.regular,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: textScale(16),
  },
  scrollContent: {
    paddingTop: spacing.PADDING_12,
    paddingBottom: 80, // room for FAB
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: textScale(30),
    fontFamily: fontFamily.bold,
    marginTop: -3,
  },
});

export default FunctionScreen;
