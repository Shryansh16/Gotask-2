// src/modules/WelcomeText.js
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {textScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {fontFamily} from '../common/fonts';
import {useTheme} from '../context/ThemeContext';

const WelcomeText = () => {
  const {theme} = useTheme();

  return (
    <View style={styles.mainContainer}>
      <Text style={[styles.Heading, {color: theme.textPrimary}]}>
        Welcome to GoTask
      </Text>
      <Text style={[styles.Paragraph, {color: theme.textSecondary}]}>
        Stay organized, focus on what matters, and accomplish your daily tasks
        much faster.
      </Text>

      {/* Feature Highlights */}
      <View style={styles.featuresRow}>
        <View
          style={[styles.featurePill, {backgroundColor: theme.primaryLight}]}>
          <Text style={[styles.featureText, {color: theme.primary}]}>
            ⚡ Offline First
          </Text>
        </View>
        <View
          style={[styles.featurePill, {backgroundColor: theme.successLight}]}>
          <Text style={[styles.featureText, {color: theme.success}]}>
            🎯 Smart Focus
          </Text>
        </View>
        <View
          style={[styles.featurePill, {backgroundColor: theme.secondaryLight}]}>
          <Text style={[styles.featureText, {color: theme.secondary}]}>
            📊 Analytics
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: spacing.MARGIN_20,
    paddingHorizontal: spacing.PADDING_24,
    alignItems: 'center',
  },
  Heading: {
    fontSize: textScale(26),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.MARGIN_8,
  },
  Paragraph: {
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.MARGIN_16,
  },
  featurePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  featureText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
});

export default WelcomeText;
