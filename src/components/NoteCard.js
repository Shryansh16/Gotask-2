// src/components/NoteCard.js
// Verified Note Card Component aligned with docs/Design.md Section 18 and docs/PRD.md Phase 3
// Elevate Labs & Stitch Tactile Momentum Redesign (Screen 3: Knowledge Vault)
// Matched 1:1 against user reference media_1793629822319_915548ed.jpg

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NoteContext';
import { fontFamily } from '../common/fonts';

// Banner theme mappings matching Elevate Knowledge Tiles
const CARD_THEMES = {
  amber: {
    bannerBg: '#D97706',
    bannerBorder: '#B45309',
    cardBorder: '#FDE68A',
    cardBottomBorder: '#F59E0B',
    badgeText: '⭐ PINNED GUIDE',
    headerSub: 'Work Knowledge • Core',
    iconName: 'file-text',
    rightIcon: 'bookmark',
    categoryBg: '#FEF3C7',
    categoryText: '#92400E',
    categoryLabel: 'Pinned',
  },
  indigo: {
    bannerBg: '#4338CA',
    bannerBorder: '#3730A3',
    cardBorder: '#C7D2FE',
    cardBottomBorder: '#818CF8',
    badgeText: 'ENGINEERING',
    headerSub: 'Sprint 42 Retrospective',
    iconName: 'zap',
    rightIcon: 'code',
    categoryBg: '#EEF2FF',
    categoryText: '#4338CA',
    categoryLabel: 'Work',
  },
  cyan: {
    bannerBg: '#0284C7',
    bannerBorder: '#0369A1',
    cardBorder: '#BAE6FD',
    cardBottomBorder: '#38BDF8',
    badgeText: 'DESIGN SYSTEM',
    headerSub: 'Tactile & 3D Gamification',
    iconName: 'layout',
    rightIcon: 'grid',
    categoryBg: '#E0F2FE',
    categoryText: '#0284C7',
    categoryLabel: 'Design',
  },
  default: {
    bannerBg: '#0284C7',
    bannerBorder: '#0369A1',
    cardBorder: '#E2E8F0',
    cardBottomBorder: '#CBD5E1',
    badgeText: 'KNOWLEDGE',
    headerSub: 'General Documentation',
    iconName: 'file-text',
    rightIcon: 'bookmark',
    categoryBg: '#F1F5F9',
    categoryText: '#475569',
    categoryLabel: 'Note',
  },
};

export const NoteCard = ({ note, onEdit, onPress, linkedTaskTitle }) => {
  const { isDark } = useTheme();
  const { deleteNote, togglePinNote, toggleArchiveNote } = useNotes();

  // Determine card theme based on pinned status, gradient property, or category
  let themeKey = 'default';
  if (note.headerGradient) {
    themeKey = note.headerGradient;
  } else if (note.isPinned) {
    themeKey = 'amber';
  } else if (note.category === 'Work' || note.category === 'Study') {
    themeKey = 'indigo';
  } else if (note.category === 'Design' || note.category === 'Ideas') {
    themeKey = 'cyan';
  }

  const theme = CARD_THEMES[themeKey] || CARD_THEMES.default;

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"? You can undo this action immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.id),
        },
      ],
    );
  };

  const handleArchive = () => {
    toggleArchiveNote(note.id);
  };

  const formattedDate = new Date(
    note.updatedAt || note.createdAt || Date.now(),
  ).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const taskCount =
    note.linkedTaskCount || (note.linkedTaskId ? 1 : 0);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
          borderColor: isDark ? '#1E293B' : theme.cardBorder,
          borderBottomColor: isDark ? '#0F172A' : theme.cardBottomBorder,
        },
      ]}>
      {/* 1. Elevate-style Gradient Top Banner Badge */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: theme.bannerBg,
            borderBottomColor: theme.bannerBorder,
          },
        ]}>
        {/* Ambient watermark circle in top right */}
        <View style={styles.bannerWatermark} />

        <View style={styles.bannerLeft}>
          {/* Squircle Icon */}
          <View style={styles.bannerIconBox}>
            <Feather name={theme.iconName} size={16} color="#FFFFFF" />
          </View>

          <View style={styles.bannerTextCol}>
            <View style={styles.badgePill}>
              {note.isPinned && (
                <Feather
                  name="star"
                  size={10}
                  color="#FFFFFF"
                  style={{ marginRight: 3 }}
                />
              )}
              <Text style={styles.badgePillText}>
                {note.headerBadge || theme.badgeText}
              </Text>
            </View>
            <Text style={styles.bannerSubText} numberOfLines={1}>
              {note.headerSub || theme.headerSub}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => togglePinNote(note.id)}
          style={styles.pinToggleBtn}>
          <Feather
            name={theme.rightIcon}
            size={16}
            color="rgba(255, 255, 255, 0.85)"
          />
        </TouchableOpacity>
      </View>

      {/* 2. Content Body Area */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => (onPress ? onPress(note) : onEdit ? onEdit(note) : null)}
        style={styles.contentArea}>
        {/* Title & Category Badge */}
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}
            numberOfLines={2}>
            {note.title}
          </Text>
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: isDark ? '#1E293B' : theme.categoryBg,
                borderColor: isDark ? '#334155' : 'transparent',
              },
            ]}>
            <Text
              style={[
                styles.categoryPillText,
                { color: isDark ? '#CBD5E1' : theme.categoryText },
              ]}>
              {note.isPinned ? 'Pinned' : note.category || theme.categoryLabel}
            </Text>
          </View>
        </View>

        {/* Excerpt */}
        {Boolean(note.content) && (
          <Text
            style={[
              styles.excerpt,
              { color: isDark ? '#94A3B8' : '#475569' },
            ]}
            numberOfLines={3}>
            {note.content}
          </Text>
        )}

        {/* Tags & Linked Tasks Pill Row */}
        <View style={styles.tagsRow}>
          {Array.isArray(note.tags) &&
            note.tags.map((tag, idx) => {
              const cleanTag = tag.replace(/^#/, '');
              return (
                <View
                  key={idx}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#EFF4FF',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.tagChipText,
                      { color: isDark ? '#CBD5E1' : '#1E293B' },
                    ]}>
                    #{cleanTag}
                  </Text>
                </View>
              );
            })}

          {/* Linked Task Pill */}
          {taskCount > 0 && (
            <View
              style={[
                styles.linkedTaskPill,
                {
                  backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                  borderColor: isDark ? '#065F46' : '#A7F3D0',
                },
              ]}>
              <Feather
                name="link"
                size={11}
                color="#059669"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.linkedTaskText}>
                {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
              </Text>
            </View>
          )}
        </View>

        {/* 3. Footer Action Row */}
        <View
          style={[
            styles.footerRow,
            { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}>
          {/* Left: Date */}
          <View style={styles.dateGroup}>
            <Feather
              name="clock"
              size={12}
              color={isDark ? '#64748B' : '#94A3B8'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.dateText,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              {formattedDate}
            </Text>
          </View>

          {/* Right: Actions (Archive, Edit, Delete) */}
          <View style={styles.actionButtonsGroup}>
            {/* Archive Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleArchive}
              accessibilityLabel="Archive note"
              style={[
                styles.footerActionBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#EFF4FF',
                },
              ]}>
              <Feather
                name={note.isArchived ? 'inbox' : 'archive'}
                size={12}
                color={isDark ? '#CBD5E1' : '#475569'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.footerActionBtnText,
                  { color: isDark ? '#CBD5E1' : '#475569' },
                ]}>
                {note.isArchived ? 'Restore' : 'Archive'}
              </Text>
            </TouchableOpacity>

            {/* Edit Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onEdit && onEdit(note)}
              accessibilityLabel="Edit note"
              style={[styles.footerActionBtn, styles.editBtn]}>
              <Feather
                name="edit-2"
                size={12}
                color="#00629D"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleDelete}
              accessibilityLabel="Delete note"
              style={styles.deleteIconBtn}>
              <Feather name="trash-2" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 4, // 3D Tactile Bevel
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  banner: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  bannerWatermark: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bannerTextCol: {
    flex: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginBottom: 2,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  bannerSubText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  pinToggleBtn: {
    padding: 6,
  },
  contentArea: {
    padding: 14,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16.5,
    fontFamily: fontFamily.bold,
    flex: 1,
    letterSpacing: -0.2,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  excerpt: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagChipText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  linkedTaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  linkedTaskText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11.5,
    fontFamily: fontFamily.medium,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footerActionBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  editBtn: {
    backgroundColor: '#CFE5FF',
  },
  editBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#00629D',
  },
  deleteIconBtn: {
    padding: 5,
    marginLeft: 2,
  },
});

export default NoteCard;
