// src/screens/welcomeScreen.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import StartButton from '../modules/StartButton';
import WelcomeImage from '../modules/WelcomeImage';
import WelcomeText from '../modules/WelcomeText';
import {textScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {fontFamily} from '../common/fonts';
import {useTheme} from '../context/ThemeContext';

const WelcomeScreen = () => {
  const {theme, isDark} = useTheme();

  return (
    <SafeAreaView
      style={[styles.mainContainer, {backgroundColor: theme.background}]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={[styles.logoDot, {backgroundColor: theme.primary}]} />
          <Text style={[styles.brandName, {color: theme.primary}]}>GoTask</Text>
        </View>

        <WelcomeImage />
        <WelcomeText />
        <StartButton />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.PADDING_20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.MARGIN_8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  brandName: {
    fontSize: textScale(28),
    fontFamily: fontFamily.black,
    letterSpacing: -0.5,
  },
});

export default WelcomeScreen;
