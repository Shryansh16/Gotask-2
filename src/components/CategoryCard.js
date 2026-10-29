// src/components/CategoryCard.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {categoryMeta} from '../styles/theme';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

const CATEGORY_ASSET_IMAGES = {
  Work: require('../assets/suitcase.png'),
  Personal: require('../assets/man.png'),
  Shopping: require('../assets/shopping-cart.png'),
  Health: require('../assets/heart-beat.png'),
};

const CATEGORY_FALLBACK_EMOJIS = {
  All: '📁',
  Work: '💼',
  Personal: '👤',
  Shopping: '🛒',
  Health: '❤️',
  Study: '📚',
  Finance: '💰',
  Ideas: '💡',
};

export const CategoryCard = ({
  category,
  isSelected,
  taskCount = 0,
  pendingCount = 0,
  onPress,
}) => {
  const {theme} = useTheme();
  const meta = categoryMeta[category] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  const imageSource = CATEGORY_ASSET_IMAGES[category];
  const emoji = CATEGORY_FALLBACK_EMOJIS[category] || '📌';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? meta.color : theme.surface,
          borderColor: isSelected ? meta.color : theme.border,
        },
        theme.cardShadow,
      ]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isSelected
              ? 'rgba(255,255,255,0.25)'
              : meta.bgColor,
          },
        ]}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={[styles.iconImage, isSelected && {tintColor: '#FFFFFF'}]}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.emojiText}>{emoji}</Text>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.categoryTitle,
          {color: isSelected ? '#FFFFFF' : theme.textPrimary},
        ]}>
        {category}
      </Text>

      <Text
        style={[
          styles.taskCount,
          {color: isSelected ? 'rgba(255,255,255,0.85)' : theme.textMuted},
        ]}>
        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 105,
    paddingVertical: spacing.PADDING_14,
    paddingHorizontal: spacing.PADDING_10,
    borderRadius: 22,
    alignItems: 'center',
    marginRight: spacing.MARGIN_12,
    borderWidth: 1.5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.MARGIN_10,
  },
  iconImage: {
    width: 26,
    height: 26,
  },
  emojiText: {
    fontSize: textScale(22),
  },
  categoryTitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 2,
  },
  taskCount: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
});

export default CategoryCard;
