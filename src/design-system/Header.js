// src/design-system/Header.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

export const Header = ({
  title,
  subtitle,
  onPressLeft,
  leftIcon = 'menu', // 'menu' | 'arrow-left' | null
  rightComponent,
  navigation,
  showBack,
  rightAction,
  style,
}) => {
  const {theme, isDark} = useTheme();

  // Resolve back press or left press
  const handleLeftPress = onPressLeft
    ? onPressLeft
    : showBack && navigation?.goBack
    ? () => navigation.goBack()
    : null;

  const resolvedLeftIcon = showBack ? 'arrow-left' : leftIcon;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.divider,
        },
        style,
      ]}>
      <View style={styles.leftRow}>
        {handleLeftPress && resolvedLeftIcon && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              resolvedLeftIcon === 'menu' ? 'Open navigation menu' : 'Go back'
            }
            activeOpacity={0.7}
            onPress={handleLeftPress}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}>
            <Feather
              name={resolvedLeftIcon}
              size={18}
              color={theme.textPrimary}
            />
          </TouchableOpacity>
        )}
        <View style={styles.titleColumn}>
          {title && (
            <Text
              numberOfLines={1}
              style={[styles.title, {color: theme.textPrimary}]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, {color: theme.textMuted}]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Render right component or right action */}
      {rightComponent ? (
        <View style={styles.rightRow}>{rightComponent}</View>
      ) : rightAction ? (
        <View style={styles.rightRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              rightAction.accessibilityLabel || rightAction.label || 'Action'
            }
            activeOpacity={0.7}
            onPress={rightAction.onPress}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#EEF2FF',
                borderColor: theme.border,
              },
            ]}>
            {rightAction.icon && (
              <Feather
                name={rightAction.icon}
                size={16}
                color="#4F46E5"
                style={{marginRight: rightAction.label ? 4 : 0}}
              />
            )}
            {rightAction.label && (
              <Text style={[styles.actionBtnText, {color: '#4F46E5'}]}>
                {rightAction.label}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleColumn: {
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
});

export default Header;
