// src/design-system/Button.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

export const Button = ({
  label,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'subtle' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const {theme} = useTheme();

  let bg = theme.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;
  let borderBottomWidth = 4;
  let borderBottomColor = theme.primaryDark;

  if (variant === 'secondary') {
    bg = theme.surfaceSecondary;
    textColor = theme.textPrimary;
    borderColor = theme.border;
    borderWidth = 1.5;
    borderBottomWidth = 3;
    borderBottomColor = '#CBD5E1';
  } else if (variant === 'subtle') {
    bg = 'transparent';
    textColor = theme.primary;
    borderBottomWidth = 0;
  } else if (variant === 'danger') {
    bg = theme.dangerLight;
    textColor = theme.danger;
    borderColor = theme.danger;
    borderWidth = 1.5;
    borderBottomWidth = 3;
    borderBottomColor = '#B91C1C';
  }

  const height = size === 'small' ? 38 : size === 'large' ? 52 : 46;
  const paddingH = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const fontSize = size === 'small' ? 13 : size === 'large' ? 16 : 14;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{disabled: disabled || loading, busy: loading}}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.surfaceSecondary : bg,
          borderColor: disabled ? theme.border : borderColor,
          borderWidth,
          borderBottomWidth: disabled ? 0 : borderBottomWidth,
          borderBottomColor: disabled ? 'transparent' : borderBottomColor,
          height,
          paddingHorizontal: paddingH,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.label,
              {
                color: disabled ? theme.textMuted : textColor,
                fontSize,
              },
              textStyle,
            ]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum comfortable touch target
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  label: {
    fontFamily: fontFamily.bold,
    letterSpacing: -0.2,
  },
});

export default Button;
