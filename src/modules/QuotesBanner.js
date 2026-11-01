// src/modules/QuotesBanner.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

const QUOTES = [
  {
    quote: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
    tag: 'Momentum',
  },
  {
    quote: 'Focus on being productive instead of busy.',
    author: 'Tim Ferriss',
    tag: 'Clarity',
  },
  {
    quote: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
    tag: 'Consistency',
  },
  {
    quote: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
    tag: 'Execution',
  },
];

export const QuotesBanner = () => {
  const {theme, isDark} = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNextQuote = () => {
    setActiveIndex(prev => (prev + 1) % QUOTES.length);
  };

  const current = QUOTES[activeIndex];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.quoteCard,
          {
            backgroundColor: isDark ? '#0C4A6E' : '#F0F9FF',
            borderColor: isDark ? '#0284C7' : '#BAE6FD',
            borderBottomColor: isDark ? '#0369A1' : '#7DD3FC',
          },
        ]}>
        {/* Top Header Row with Badge & Shuffle Action */}
        <View style={styles.quoteTopRow}>
          <View
            style={[
              styles.badgeRow,
              {backgroundColor: isDark ? '#075985' : '#E0F2FE'},
            ]}>
            <Feather
              name="sparkles"
              size={12}
              color={isDark ? '#38BDF8' : '#0284C7'}
              style={styles.sparkleIcon}
            />
            <Text
              style={[
                styles.badgeText,
                {color: isDark ? '#E0F2FE' : '#0369A1'},
              ]}>
              DAILY SPARK • {current.tag.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View next inspirational quote"
            activeOpacity={0.7}
            onPress={handleNextQuote}
            style={[
              styles.cycleBtn,
              {
                backgroundColor: isDark ? '#075985' : '#FFFFFF',
                borderColor: isDark ? '#0284C7' : '#BAE6FD',
                borderBottomColor: isDark ? '#0369A1' : '#93C5FD',
              },
            ]}>
            <Text
              style={[
                styles.cycleBtnText,
                {color: isDark ? '#E0F2FE' : '#0369A1'},
              ]}>
              {activeIndex + 1}/{QUOTES.length}
            </Text>
            <Feather
              name="chevron-right"
              size={14}
              color={isDark ? '#E0F2FE' : '#0369A1'}
              style={{marginLeft: 2}}
            />
          </TouchableOpacity>
        </View>

        {/* Quote Content */}
        <Text
          style={[
            styles.quoteText,
            {color: isDark ? '#F0F9FF' : '#0C4A6E'},
          ]}
          numberOfLines={3}>
          "{current.quote}"
        </Text>

        {/* Bottom Author Row with Clean Dots */}
        <View style={styles.bottomRow}>
          <Text style={[styles.authorText, {color: theme.textSecondary}]}>
            — {current.author}
          </Text>

          <View style={styles.dotsRow}>
            {QUOTES.map((_, i) => (
              <TouchableOpacity
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Go to quote ${i + 1}`}
                onPress={() => setActiveIndex(i)}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === activeIndex ? '#4F46E5' : theme.border,
                    width: i === activeIndex ? 16 : 6,
                    marginHorizontal: 3,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quoteCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D tactile bevel
    shadowColor: '#BAE6FD',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  quoteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sparkleIcon: {
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.6,
  },
  cycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  cycleBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    lineHeight: 21,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
});

export default QuotesBanner;
