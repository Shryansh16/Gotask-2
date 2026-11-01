// src/design-system/ScreenContainer.js
import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';

export const ScreenContainer = ({
  children,
  scrollable = false,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  maxContentWidth = 680,
  ...rest
}) => {
  const insets = useSafeAreaInsets();
  const {theme, isDark} = useTheme();
  const {width} = useWindowDimensions();

  // Safe insets for Android notch, status bar, and gesture navigation bar
  const topPadding = edges.includes('top')
    ? Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0)
    : 0;
  const bottomPadding = edges.includes('bottom')
    ? Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0)
    : 0;
  const leftPadding = edges.includes('left') ? insets.left : 0;
  const rightPadding = edges.includes('right') ? insets.right : 0;

  const isWide = width >= 600;

  const containerStyle = [
    styles.root,
    {
      backgroundColor: theme.background,
      paddingTop: topPadding,
      paddingBottom: bottomPadding,
      paddingLeft: leftPadding,
      paddingRight: rightPadding,
    },
    style,
  ];

  const contentWrapperStyle = isWide
    ? {maxWidth: maxContentWidth, width: '100%', alignSelf: 'center'}
    : {flex: 1};

  return (
    <View style={containerStyle}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            contentContainerStyle={[
              styles.scrollContent,
              isWide && {
                maxWidth: maxContentWidth,
                width: '100%',
                alignSelf: 'center',
              },
              contentContainerStyle,
            ]}
            {...rest}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.innerContent, contentWrapperStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContent: {
    flex: 1,
  },
});

export default ScreenContainer;
