// src/modules/StartButton.js
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {textScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {fontFamily} from '../common/fonts';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';

const StartButton = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();

  function onPressButton() {
    navigation.replace('Drawer');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.button,
          {backgroundColor: theme.primary},
          theme.glowShadow,
        ]}
        onPress={onPressButton}>
        <Text style={styles.buttonText}>Get Started ➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.skipButton}
        onPress={onPressButton}>
        <Text style={[styles.skipText, {color: theme.textMuted}]}>
          Skip to Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.PADDING_24,
    marginTop: spacing.MARGIN_24,
    marginBottom: spacing.MARGIN_20,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    height: 54,
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
  },
  skipButton: {
    marginTop: spacing.MARGIN_12,
    padding: 8,
  },
  skipText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
});

export default StartButton;
