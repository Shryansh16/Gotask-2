// src/modules/SearchBar.js
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const SearchBar = () => {
  const {theme} = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
  } = useTasks();

  const statusChips = [
    {label: 'All', value: 'all', type: 'status'},
    {label: 'Pending', value: 'active', type: 'status'},
    {label: 'Done', value: 'completed', type: 'status'},
    {label: '🔥 Urgent', value: 'high', type: 'priority'},
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
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          },
        ]}>
        <Text style={[styles.searchIcon, {color: theme.textMuted}]}>🔍</Text>
        <TextInput
          placeholder="Search your tasks..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.input, {color: theme.textPrimary}]}
          returnKeyType="search"
        />
        {Boolean(searchQuery) && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearBtn}>
            <Text style={[styles.clearIcon, {color: theme.textMuted}]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Status Pills */}
      <View style={styles.chipsRow}>
        {statusChips.map(chip => {
          const isSelected =
            chip.type === 'status'
              ? filterStatus === chip.value
              : filterPriority === chip.value;

          return (
            <TouchableOpacity
              key={chip.label}
              onPress={() => handleChipPress(chip)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.primary
                    : theme.surfaceSecondary,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {color: isSelected ? '#FFFFFF' : theme.textSecondary},
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
    paddingHorizontal: spacing.PADDING_16,
    marginVertical: spacing.MARGIN_8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: textScale(14),
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearIcon: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: spacing.MARGIN_10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
});

export default SearchBar;
