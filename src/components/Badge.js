// src/components/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { priorityMeta } from '../styles/theme';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';

export const PriorityBadge = ({ priority = 'medium' }) => {
  const meta = priorityMeta[priority] || priorityMeta.medium;

  return (
    <View style={[styles.priorityBadge, { backgroundColor: meta.bgColor }]}>
      <View style={[styles.priorityDot, { backgroundColor: meta.dotColor }]} />
      <Text style={[styles.priorityText, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
};

export const CategoryBadge = ({ category, color = '#2563EB', bgColor = '#EFF6FF' }) => {
  return (
    <View style={[styles.categoryBadge, { backgroundColor: bgColor }]}>
      <Text style={[styles.categoryText, { color }]}>
        {category}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
});
