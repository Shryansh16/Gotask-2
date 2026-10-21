// src/modules/QuotesBanner.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.PADDING_16 * 2;

const QUOTES = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    themeColor: '#4F46E5',
    emoji: '🚀',
  },
  {
    quote: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
    themeColor: '#06B6D4',
    emoji: '🎯',
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    themeColor: '#10B981',
    emoji: '🌱',
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    themeColor: '#8B5CF6',
    emoji: '⚡',
  },
];

export const QuotesBanner = () => {
  const { theme, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < QUOTES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {QUOTES.map((item, index) => (
          <View
            key={index}
            style={[
              styles.quoteCard,
              {
                width: CARD_WIDTH,
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              theme.cardShadow,
            ]}
          >
            <View style={styles.quoteTopRow}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${item.themeColor}15` },
                ]}
              >
                <Text style={[styles.badgeText, { color: item.themeColor }]}>
                  Daily Spark
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.quoteText,
                { color: theme.textPrimary },
              ]}
              numberOfLines={3}
            >
              "{item.quote}"
            </Text>

            <Text style={[styles.authorText, { color: theme.textMuted }]}>
              — {item.author}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.dotsRow}>
        {QUOTES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex ? theme.primary : theme.border,
                width: i === activeIndex ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.MARGIN_16,
  },
  scrollContent: {
    paddingHorizontal: spacing.PADDING_16,
  },
  quoteCard: {
    borderRadius: 20,
    padding: spacing.PADDING_16,
    borderWidth: 1,
    marginRight: spacing.PADDING_16,
  },
  quoteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_8,
  },
  emoji: {
    fontSize: textScale(20),
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.bold,
    textTransform: 'uppercase',
  },
  quoteText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
    lineHeight: 20,
    marginBottom: spacing.MARGIN_6,
  },
  authorText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    fontStyle: 'italic',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.MARGIN_8,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

export default QuotesBanner;
