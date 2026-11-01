// src/components/ElevateTabBar.js
// Pixel-perfect replica of Elevate's iconic 5-tab tactile bottom navigation bar
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

const TABS = [
  {
    id: 'today',
    label: 'Today',
    screen: 'FunctionScreen',
    icon: 'compass',
    activeColor: '#00A3FF',
    activeBg: '#E0F2FE',
    activeBorder: '#BAE6FD',
  },
  {
    id: 'quests',
    label: 'Quests',
    screen: 'PlanningScreen',
    icon: 'map',
    activeColor: '#F59E0B',
    activeBg: '#FEF3C7',
    activeBorder: '#FDE68A',
  },
  {
    id: 'focus',
    label: 'Focus',
    screen: 'FocusScreen',
    icon: 'clock',
    activeColor: '#00A3FF',
    activeBg: '#E0F2FE',
    activeBorder: '#BAE6FD',
  },
  {
    id: 'habits',
    label: 'Habits',
    screen: 'HabitsScreen',
    icon: 'zap',
    activeColor: '#10B981',
    activeBg: '#DCFCE7',
    activeBorder: '#BBF7D0',
  },
  {
    id: 'me',
    label: 'Me',
    screen: 'Profile',
    icon: 'user',
    activeColor: '#8B5CF6',
    activeBg: '#EDE9FE',
    activeBorder: '#DDD6FE',
  },
];

export const ElevateTabBar = ({activeTab, navigation}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  const handleTabPress = (tab) => {
    if (!navigation) return;
    if (activeTab === tab.id) return;
    navigation.navigate(tab.screen);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          paddingBottom: bottomInset,
        },
      ]}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{selected: isActive}}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab)}
              style={styles.tabButton}>
              <View
                style={[
                  styles.tabPill,
                  isActive && {
                    backgroundColor: isDark ? '#1E293B' : tab.activeBg,
                    borderColor: isDark ? tab.activeColor : tab.activeBorder,
                    borderWidth: 1.5,
                  },
                ]}>
                <Feather
                  name={tab.icon}
                  size={20}
                  color={isActive ? tab.activeColor : (isDark ? '#64748B' : '#94A3B8')}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? (isDark ? '#FFFFFF' : tab.activeColor)
                      : (isDark ? '#64748B' : '#94A3B8'),
                    fontFamily: isActive ? fontFamily.bold : fontFamily.medium,
                  },
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 6,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: -0.2,
  },
});

export default ElevateTabBar;

