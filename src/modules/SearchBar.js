// src/modules/SearchBar.js
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';

export const SearchBar = () => {
  const {theme, isDark} = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
  } = useTasks();

  const statusChips = [
    {
      label: 'All',
      value: 'all',
      type: 'status',
      activeColor: '#4F46E5',
      activeBg: '#4F46E5',
    },
    {
      label: 'Pending',
      value: 'active',
      type: 'status',
      icon: 'clock',
      activeColor: '#F59E0B',
      activeBg: '#F59E0B',
    },
    {
      label: 'Done',
      value: 'completed',
      type: 'status',
      icon: 'check-circle',
      activeColor: '#10B981',
      activeBg: '#10B981',
    },
    {
      label: 'Urgent',
      value: 'high',
      type: 'priority',
      icon: 'alert-circle',
      activeColor: '#EF4444',
      activeBg: '#EF4444',
    },
  ];

  const handleChipPress = chip => {
    if (chip.type === 'status') {
      setFilterStatus(chip.value);
    } else if (chip.type === 'priority') {
      setFilterPriority(filterPriority === chip.value ? 'all' : chip.value);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: isDark ? '#1E293B' : '#E2E8F0',
            borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
          },
        ]}>
        <Feather
          name="search"
          size={18}
          color={theme.primary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search your tasks..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.input, {color: theme.textPrimary}]}
          returnKeyType="search"
          autoCorrect={false}
        />
        {Boolean(searchQuery) && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear search query"
            onPress={() => setSearchQuery('')}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.clearBtn}>
            <Feather name="x" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Status Pills - explicit marginRight prevents RN 0.71 Android collision */}
      <View style={styles.chipsRow}>
        {statusChips.map((chip, index) => {
          const isSelected =
            chip.type === 'status'
              ? filterStatus === chip.value
              : filterPriority === chip.value;

          return (
            <TouchableOpacity
              key={chip.label}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${chip.label}`}
              activeOpacity={0.75}
              onPress={() => handleChipPress(chip)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? chip.activeBg
                    : theme.surface,
                  borderColor: isSelected
                    ? chip.activeBg
                    : isDark ? '#1E293B' : '#E2E8F0',
                  borderBottomColor: isSelected
                    ? '#1E1B4B'
                    : isDark ? '#0F172A' : '#CBD5E1',
                  marginRight: index < statusChips.length - 1 ? 8 : 0,
                },
              ]}>
              {chip.icon && (
                <Feather
                  name={chip.icon}
                  size={13}
                  color={isSelected ? '#FFFFFF' : chip.activeColor}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.textSecondary,
                    fontFamily: isSelected
                      ? fontFamily.bold
                      : fontFamily.medium,
                  },
                ]}>
                {chip.label}
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    paddingHorizontal: 14,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    minHeight: 34,
    justifyContent: 'center',
  },
  chipIcon: {
    marginRight: 5,
  },
  chipText: {
    fontSize: 12,
  },
});

export default SearchBar;
