// src/modules/HemburgerButton.js
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../styles/spacing';

const HemburgerButton = ({ onPressButton }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceSecondary,
          borderColor: theme.border,
        },
      ]}
      onPress={onPressButton}
    >
      <View style={[styles.bar, { backgroundColor: theme.textPrimary, width: 18 }]} />
      <View style={[styles.bar, { backgroundColor: theme.primary, width: 13 }]} />
      <View style={[styles.bar, { backgroundColor: theme.textPrimary, width: 16 }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    width: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.MARGIN_12,
  },
  bar: {
    height: 2.5,
    borderRadius: 2,
    marginVertical: 1.8,
  },
});

export default HemburgerButton;