// src/modules/HemburgerButton.js
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {spacing} from '../styles/spacing';

const HemburgerButton = ({onPressButton, navigation}) => {
  const {theme} = useTheme();

  const handlePress = () => {
    if (onPressButton) {
      onPressButton();
    } else if (navigation && navigation.openDrawer) {
      navigation.openDrawer();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Open Navigation Menu"
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceSecondary,
          borderColor: theme.border,
        },
      ]}
      onPress={handlePress}>
      <Feather name="menu" size={20} color={theme.textPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 38,
    width: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.small,
  },
});

export default HemburgerButton;
