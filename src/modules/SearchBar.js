// src/modules/SearchBar.js
// Screen 2: Dedicated Tasks Inventory & Backlog Search, Categories & Priority Bar
// Matched 1:1 against user reference media_1793630748158_ae2c7680.jpg & HTML

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

const CATEGORY_META = {
  All: {icon: null, color: '#00A3FF'},
  Work: {icon: 'terminal', color: '#0284C7'},
  Personal: {icon: 'user', color: '#D97706'},
  Architecture: {icon: 'grid', color: '#059669'},
  Reviews: {icon: 'check-square', color: '#4F46E5'},
  Shopping: {icon: 'shopping-bag', color: '#10B981'},
  Health: {icon: 'activity', color: '#0F766E'},
  Study: {icon: 'book-open', color: '#9333EA'},
  Finance: {icon: 'dollar-sign', color: '#D97706'},
};

export const SearchBar = () => {
  const {theme, isDark} = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    categories,
    selectedCategory,
    setSelectedCategory,
    getCategoryStats,
    tasks,
  } = useTasks();

  const priorityOptions = [
    {label: 'All', value: 'all'},
    {label: 'High', value: 'high', dotColor: '#EF4444'},
    {label: 'Med', value: 'medium', dotColor: '#F59E0B'},
    {label: 'Low', value: 'low', dotColor: '#10B981'},
  ];

  return (
    <View style={styles.container}>
      {/* 1. Tactile Search Box */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
          },
        ]}>
        <Feather
          name="search"
          size={18}
          color={isDark ? '#94A3B8' : '#94A3B8'}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search tasks, subtasks, tags..."
          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.input,
            {color: isDark ? '#F8F9FF' : '#0B1C30'},
          ]}
          returnKeyType="search"
          autoCorrect={false}
        />
        {Boolean(searchQuery) ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear search query"
            onPress={() => setSearchQuery('')}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.clearBtn}>
            <Feather name="x" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.tuneBtn,
              {backgroundColor: isDark ? '#334155' : '#F1F5F9'},
            ]}>
            <Feather
              name="sliders"
              size={14}
              color={isDark ? '#CBD5E1' : '#475569'}
            />
          </View>
        )}
      </View>

      {/* 2. Horizontal Scrollable Category Filter Pills (Elevate Squircle Tactile Tabs) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}>
        {categories.map((cat, idx) => {
          const isSelected = selectedCategory === cat;
          const catStats = getCategoryStats(cat);
          const count = cat === 'All' ? tasks.length : catStats.total;
          const meta = CATEGORY_META[cat] || {icon: 'tag', color: '#64748B'};

          return (
            <TouchableOpacity
              key={cat}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cat}`}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                isSelected
                  ? {
                      backgroundColor: '#00A3FF',
                      borderColor: '#0284C7',
                      borderBottomColor: '#0369A1',
                    }
                  : {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
                    },
                {marginRight: idx < categories.length - 1 ? 8 : 0},
              ]}>
              {Boolean(meta.icon) && (
                <Feather
                  name={meta.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : meta.color}
                  style={styles.categoryIcon}
                />
              )}
              <Text
                style={[
                  styles.categoryText,
                  {color: isSelected ? '#FFFFFF' : isDark ? '#E2E8F0' : '#334155'},
                ]}>
                {cat}
              </Text>
              <View
                style={[
                  styles.categoryCountBadge,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.25)'
                      : isDark
                      ? '#334155'
                      : '#F1F5F9',
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryCountText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#475569',
                    },
                  ]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Priority Segmented Filter Row */}
      <View
        style={[
          styles.priorityContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}>
        {priorityOptions.map(opt => {
          const isSelected = filterPriority === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              accessibilityRole="button"
              accessibilityLabel={`Priority ${opt.label}`}
              activeOpacity={0.75}
              onPress={() => setFilterPriority(opt.value)}
              style={[
                styles.prioritySegment,
                isSelected && [
                  styles.prioritySegmentActive,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderBottomColor: isDark ? '#00A3FF' : '#CBD5E1',
                  },
                ],
              ]}>
              {Boolean(opt.dotColor) && (
                <View
                  style={[
                    styles.priorityDot,
                    {backgroundColor: opt.dotColor},
                  ]}
                />
              )}
              <Text
                style={[
                  styles.prioritySegmentText,
                  isSelected
                    ? {
                        color: isDark ? '#38BDF8' : '#0284C7',
                        fontFamily: fontFamily.black || fontFamily.bold,
                      }
                    : {
                        color: isDark ? '#94A3B8' : '#64748B',
                        fontFamily: fontFamily.bold,
                      },
                ]}>
                {opt.label}
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
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 4, // Elevate 3D tactile bevel
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  tuneBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 4, // Elevate tactile bevel
    minHeight: 38,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    marginRight: 6,
  },
  categoryCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryCountText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  prioritySegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
  },
  prioritySegmentActive: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 2,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  prioritySegmentText: {
    fontSize: 12,
  },
});

export default SearchBar;
