// src/screens/welcomeScreen.js
import React from 'react';
import {StyleSheet, Text, View, Image, useWindowDimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {ScreenContainer, Button} from '../design-system';
import {fontFamily} from '../common/fonts';
import {useTheme} from '../context/ThemeContext';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {width, height} = useWindowDimensions();

  const isCompact = width < 360;
  const imageSize = Math.min(width * 0.62, height * 0.26, 220);

  const handleStart = () => {
    navigation.replace('Drawer');
  };

  const features = [
    {
      icon: 'check-circle',
      color: '#8B5CF6',
      bg: isDark ? '#1E1B4B' : '#F5F3FF',
      title: 'Smart Tasks & Categories',
      sub: 'Organize your day with zero friction',
    },
    {
      icon: 'clock',
      color: '#10B981',
      bg: isDark ? '#064E3B' : '#ECFDF5',
      title: 'Pomodoro & Deep Focus',
      sub: 'Scientifically backed focus intervals',
    },
    {
      icon: 'zap',
      color: '#F59E0B',
      bg: isDark ? '#451A03' : '#FFFBEB',
      title: 'Gamified Daily Streaks',
      sub: 'Build momentum and reach your goals',
    },
  ];

  return (
    <ScreenContainer
      scrollable={true}
      contentContainerStyle={styles.scrollContent}>
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, {backgroundColor: '#4F46E5'}]} />
          <Text style={[styles.brandTitle, {color: '#4F46E5'}]}>
            GoTask
          </Text>
        </View>
        <Text style={[styles.brandTagline, {color: theme.textMuted}]}>
          Elevate Your Daily Momentum
        </Text>
      </View>

      {/* Hero Illustration */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../assets/GOTaskWelcomeImage.webp')}
          style={{width: imageSize, height: imageSize, borderRadius: 20}}
          resizeMode="contain"
          accessibilityLabel="GoTask Welcome illustration"
        />
      </View>

      {/* Headline Section */}
      <View style={styles.textSection}>
        <Text style={[styles.headline, {color: theme.textPrimary}]}>
          Train Your Focus.{'\n'}Achieve Your Goals.
        </Text>
        <Text style={[styles.body, {color: theme.textSecondary}]}>
          A joyful, disciplined productivity system designed for clarity,
          habits, and measurable growth.
        </Text>

        {/* Elevate-Style Feature Cards */}
        <View style={styles.featureList}>
          {features.map((feat, index) => (
            <View
              key={index}
              style={[
                styles.featureCard,
                {
                  backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderLeftColor: feat.color,
                },
              ]}>
              <View style={[styles.iconCircle, {backgroundColor: feat.bg}]}>
                <Feather name={feat.icon} size={16} color={feat.color} />
              </View>
              <View style={styles.featureTextCol}>
                <Text
                  style={[styles.featureTitle, {color: theme.textPrimary}]}>
                  {feat.title}
                </Text>
                <Text style={[styles.featureSub, {color: theme.textSecondary}]}>
                  {feat.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          label="Get Started →"
          size={isCompact ? 'medium' : 'large'}
          onPress={handleStart}
          accessibilityLabel="Get Started and open Dashboard"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontFamily: fontFamily.black,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headline: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    marginBottom: 16,
  },
  featureList: {
    width: '100%',
    maxWidth: 340,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    borderLeftWidth: 5,
    marginBottom: 8,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  featureSub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    marginTop: 1,
  },
  footer: {
    marginTop: 18,
    paddingBottom: 8,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
});

export default WelcomeScreen;
