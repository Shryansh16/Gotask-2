// src/design-system/Card.js
import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../context/ThemeContext';

export const Card = ({
  children,
  onPress,
  style,
  variant = 'flat', // 'flat' | 'subtle' | 'elevated'
  accessibilityLabel,
  accessibilityRole,
  ...rest
}) => {
  const {theme} = useTheme();

  const isInteractive = typeof onPress === 'function';
  const Component = isInteractive ? TouchableOpacity : View;

  let bg = theme.surface;
  let borderColor = theme.border;

  if (variant === 'subtle') {
    bg = theme.surfaceSecondary;
  }

  return (
    <Component
      activeOpacity={isInteractive ? 0.75 : 1}
      onPress={onPress}
      accessibilityRole={
        accessibilityRole || (isInteractive ? 'button' : undefined)
      }
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor,
        },
        style,
      ]}
      {...rest}>
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    padding: 16,
    marginVertical: 6,
  },
});

export default Card;
