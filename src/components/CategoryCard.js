// src/components/CategoryCard.js
import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';

const CATEGORY_FEATHER_ICONS = {
  All: 'layers',
  Work: 'briefcase',
  Personal: 'user',
  Shopping: 'shopping-bag',
  Health: 'activity',
  Study: 'book-open',
  Finance: 'dollar-sign',
  Ideas: 'compass',
};

export const CategoryCard = ({
  category,
  isSelected,
  taskCount = 0,
  onPress,
}) => {
  const {theme, isDark} = useTheme();
  const iconName = CATEGORY_FEATHER_ICONS[category] || 'tag';
  const meta = categoryMeta[category] || {
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  };

  const activeColor = meta.color;
  const activeBg = meta.color;
  const inactiveBg = isDark ? '#1E293B' : meta.bgColor;
  const inactiveTextColor = isDark ? '#F8FAFC' : '#0F172A';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Category ${category}, ${taskCount} tasks`}
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? activeBg : inactiveBg,
          borderColor: isSelected ? activeBg : isDark ? '#334155' : '#E2E8F0',
          borderBottomColor: isSelected ? '#1E1B4B' : isDark ? '#0F172A' : '#CBD5E1',
          shadowColor: isSelected ? activeColor : '#475569',
          shadowOpacity: isSelected ? 0.3 : 0.04,
          elevation: isSelected ? 4 : 1,
        },
      ]}>
      {/* Icon Medallion */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isSelected
              ? 'rgba(255, 255, 255, 0.22)'
              : isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.85)',
          },
        ]}>
        <Feather
          name={iconName}
          size={14}
          color={isSelected ? '#FFFFFF' : activeColor}
        />
      </View>

      {/* Category Name */}
      <Text
        style={[
          styles.categoryTitle,
          {color: isSelected ? '#FFFFFF' : inactiveTextColor},
        ]}>
        {category}
      </Text>

      {/* Task Count Badge */}
      <View
        style={[
          styles.countBadge,
          {
            backgroundColor: isSelected
              ? 'rgba(255, 255, 255, 0.22)'
              : isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.06)',
          },
        ]}>
        <Text
          style={[
            styles.taskCount,
            {color: isSelected ? '#FFFFFF' : activeColor},
          ]}>
          {taskCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 3, // Elevate 3D bevel
    marginRight: 10,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  taskCount: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
});

export default CategoryCard;
