// src/screens/FunctionScreen.js
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {ScreenContainer, Header} from '../design-system';
import StatsOverview from '../modules/StatsOverview';
import SearchBar from '../modules/SearchBar';
import QuotesBanner from '../modules/QuotesBanner';
import Categories from '../modules/Categories';
import YourTask from '../modules/YourTask';
import TaskModal from '../modules/TaskModal';
import ElevateTabBar from '../components/ElevateTabBar';
import ElevateQuests from '../components/ElevateQuests';

const FunctionScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark, toggleTheme} = useTheme();
  const {syncStatus, triggerSync, stats} = useTasks();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  function onPressDrawer() {
    navigation.openDrawer();
  }

  const renderRightHeaderActions = () => (
    <View style={styles.headerRight}>
      {/* Theme Toggle with Vector Icon */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Toggle Dark/Light Mode"
        activeOpacity={0.7}
        onPress={toggleTheme}
        style={[
          styles.iconButton,
          {
            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            borderColor: theme.border,
          },
        ]}>
        <Feather
          name={isDark ? 'sun' : 'moon'}
          size={16}
          color={isDark ? '#FBBF24' : '#4F46E5'}
        />
      </TouchableOpacity>

      {/* Cloud Sync Button */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Trigger cloud sync"
        activeOpacity={0.7}
        onPress={triggerSync}
        style={[
          styles.iconButton,
          {
            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            borderColor: theme.border,
            marginLeft: 8,
          },
        ]}>
        <Feather
          name="refresh-cw"
          size={16}
          color={syncStatus === 'syncing' ? '#4F46E5' : theme.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer scrollable={false}>
      {/* Notch-Safe Header */}
      <Header
        title="GoTask"
        subtitle={
          syncStatus === 'synced'
            ? 'Cloud Synced'
            : syncStatus === 'syncing'
            ? 'Syncing changes...'
            : 'Offline Active'
        }
        onPressLeft={onPressDrawer}
        leftIcon="menu"
        rightComponent={renderRightHeaderActions()}
      />

      {/* Scrollable Dashboard Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Productivity Summary Hero Card */}
        <StatsOverview />

        {/* Live Search & Filter Bar */}
        <SearchBar />

        {/* Focus Categories Section */}
        <Categories />

        {/* Daily Motivation Spark */}
        <QuotesBanner />

        {/* Dynamic Task List */}
        <YourTask onOpenCreateModal={() => setIsCreateModalVisible(true)} />
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
            backgroundColor: '#4F46E5',
            borderBottomColor: '#3730A3',
            shadowColor: '#4F46E5',
          },
        ]}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="today" navigation={navigation} />

      {/* Create Task Modal */}
      <TaskModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 12,
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
