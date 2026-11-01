// src/components/EmptyState.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

export const EmptyState = ({
  vectorIcon,
  icon = 'inbox',
  title = 'No Tasks Yet',
  subtitle,
  message,
  buttonText,
  onButtonPress,
  actionLabel,
  onAction,
}) => {
  const {theme, isDark} = useTheme();

  const resolvedIcon = vectorIcon || icon || 'inbox';
  const resolvedSubtitle =
    subtitle ||
    message ||
    'You have no tasks in this view. Enjoy your time or add something new to your list.';
  const resolvedButtonText = buttonText || actionLabel;
  const resolvedOnPress = onButtonPress || onAction;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
          },
        ]}>
        <Feather name={resolvedIcon} size={32} color="#4F46E5" />
      </View>
      <Text style={[styles.title, {color: theme.textPrimary}]}>{title}</Text>
      <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
        {resolvedSubtitle}
      </Text>

      {Boolean(resolvedButtonText && resolvedOnPress) && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={resolvedButtonText}
          activeOpacity={0.8}
          onPress={resolvedOnPress}
          style={[styles.button, {backgroundColor: '#4F46E5'}]}>
          <Text style={styles.buttonText}>{resolvedButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
});

export default EmptyState;
