// src/components/NoteCard.js
// Verified Note Card component aligned with docs/Design.md Section 4 & 5

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useNotes} from '../context/NoteContext';
import {categoryMeta} from '../styles/theme';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {CategoryBadge} from './Badge';

export const NoteCard = ({note, onEdit, onPress, linkedTaskTitle}) => {
  const {theme} = useTheme();
  const {deleteNote, togglePinNote, toggleArchiveNote} = useNotes();

  const meta = categoryMeta[note.category] || {
    color: theme.primary,
    bgColor: theme.primaryLight,
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"? You can undo this action immediately.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.id),
        },
      ],
    );
  };

  const formattedDate = new Date(
    note.updatedAt || note.createdAt || Date.now(),
  ).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => (onPress ? onPress(note) : onEdit ? onEdit(note) : null)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${note.title}. Category: ${
        note.category || 'General'
      }`}
      style={[
        styles.card,
        note.isPinned ? styles.cardPinned : null,
        {
          backgroundColor: theme.surface,
          borderColor: note.isPinned ? theme.primary : theme.border,
        },
        theme.cardShadow,
      ]}>
      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <CategoryBadge
            category={note.category || 'General'}
            color={meta.color}
            bgColor={meta.bgColor}
          />
          {note.isArchived && (
            <View
              style={[
                styles.archiveBadge,
                {backgroundColor: theme.surfaceSecondary},
              ]}>
              <Text style={[styles.archiveBadgeText, {color: theme.textMuted}]}>
                Archived
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => togglePinNote(note.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={note.isPinned ? 'Unpin note' : 'Pin note'}
            style={styles.actionIconBtn}>
            <Text
              style={[
                styles.pinIcon,
                {color: note.isPinned ? theme.primary : theme.textMuted},
              ]}>
              {note.isPinned ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Preview Content */}
      <Text
        numberOfLines={2}
        style={[styles.title, {color: theme.textPrimary}]}>
        {note.title}
      </Text>

      {Boolean(note.content) && (
        <Text
          numberOfLines={3}
          style={[styles.contentPreview, {color: theme.textSecondary}]}>
          {note.content}
        </Text>
      )}

      {/* Linked Task Indicator */}
      {Boolean(note.linkedTaskId) && (
        <View
          style={[
            styles.linkedTaskBox,
            {backgroundColor: theme.surfaceSecondary},
          ]}
          accessible={true}
          accessibilityLabel={`Linked to task ${linkedTaskTitle || 'Task'}`}>
          <Text style={styles.linkedTaskIcon}>🔗</Text>
          <Text
            numberOfLines={1}
            style={[styles.linkedTaskText, {color: theme.primary}]}>
            {linkedTaskTitle || `Task #${note.linkedTaskId.slice(0, 8)}`}
          </Text>
        </View>
      )}

      {/* Tags Row */}
      {Array.isArray(note.tags) && note.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {note.tags.map(t => (
            <View
              key={t}
              style={[
                styles.tagChip,
                {backgroundColor: theme.surfaceSecondary},
              ]}>
              <Text style={[styles.tagText, {color: theme.textSecondary}]}>
                #{t}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer Date & Actions */}
      <View style={[styles.footerRow, {borderTopColor: theme.divider}]}>
        <Text style={[styles.dateText, {color: theme.textMuted}]}>
          {formattedDate}
        </Text>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            onPress={() => toggleArchiveNote(note.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              note.isArchived ? 'Unarchive note' : 'Archive note'
            }
            style={[
              styles.smallBtn,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <Text style={[styles.smallBtnText, {color: theme.textSecondary}]}>
              {note.isArchived ? 'Restore' : 'Archive'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEdit && onEdit(note)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit note"
            style={[
              styles.smallBtn,
              styles.btnSpacing,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <Text style={[styles.smallBtnText, {color: theme.primary}]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete note"
            style={[
              styles.smallBtn,
              styles.btnSpacing,
              {backgroundColor: theme.dangerLight},
            ]}>
            <Text style={[styles.smallBtnText, {color: theme.danger}]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_14,
    borderWidth: 1,
  },
  cardPinned: {
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  archiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 6,
  },
  archiveBadgeText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 4,
  },
  pinIcon: {
    fontSize: textScale(18),
    lineHeight: 20,
  },
  title: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
    lineHeight: 22,
    marginBottom: 4,
  },
  contentPreview: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    lineHeight: 18,
    marginBottom: spacing.MARGIN_10,
  },
  linkedTaskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: spacing.MARGIN_10,
    alignSelf: 'flex-start',
  },
  linkedTaskIcon: {
    fontSize: textScale(11),
    marginRight: 6,
  },
  linkedTaskText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.MARGIN_8,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.medium,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.PADDING_10,
    borderTopWidth: 1,
    marginTop: spacing.MARGIN_4,
  },
  dateText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  btnSpacing: {
    marginLeft: 6,
  },
  smallBtnText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
});

export default NoteCard;
