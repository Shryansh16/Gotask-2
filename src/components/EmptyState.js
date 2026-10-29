// src/components/EmptyState.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const EmptyState = ({
  icon = '✨',
  title = 'No Tasks Yet',
  subtitle = 'You have no tasks in this view. Enjoy your free time or add something new to your list!',
  buttonText,
  onButtonPress,
}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, {backgroundColor: theme.primaryLight}]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={[styles.title, {color: theme.textPrimary}]}>{title}</Text>
      <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
        {subtitle}
      </Text>

      {Boolean(buttonText && onButtonPress) && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onButtonPress}
          style={[styles.button, {backgroundColor: theme.primary}]}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.PADDING_24,
    paddingVertical: spacing.PADDING_40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.MARGIN_16,
  },
  iconText: {
    fontSize: textScale(32),
  },
  title: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.MARGIN_8,
  },
  subtitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.MARGIN_20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
});

export default EmptyState;
